import { z } from 'zod';
import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import {
  ClaudeError,
  ConsentRequiredError,
  RateLimitError,
  SessionExpiredError,
  MlUnavailableError,
} from '@/lib/errors';
import { claudeText, getModelId } from '@/lib/claude/client';
import { costUsdCents } from '@/lib/claude/pricing';
import { buildInterpretNarrativePrompt } from '@/lib/prompts/interpret-narrative';
import { buildEvidencePrompt } from '@/lib/prompts/analyze-evidence';
import { computeHash, CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';
import { inferBigFive, MlApiUnavailableError, MlApiError } from '@/lib/ml-client';
import type { AnalyzeResponse } from '@/types';

export const runtime = 'edge';

const AnalyzeInputSchema = z.object({
  texts: z.array(z.string().min(1).max(15000)).min(1).max(16),
  mode: z.enum(['dynamic']),
  areas: z.array(z.string().min(1).max(100)).optional(),
  /**
   * Optional onboarding session id. When provided and the session has
   * `flags.seedText` (seeded from ChatGPT import per Fase 3 ChatGPT
   * seed flow), the analyzer prepends that raw text to `texts` so the
   * final profile is grounded in BOTH the imported portrait AND the
   * refinement turns.
   */
  sessionId: z.string().uuid().optional(),
});

const InterpretResponseSchema = z.object({
  jungFunctions: z.object({
    Se: z.number(),
    Si: z.number(),
    Ne: z.number(),
    Ni: z.number(),
    Te: z.number(),
    Ti: z.number(),
    Fe: z.number(),
    Fi: z.number(),
  }),
  archetype: z.enum(['hero', 'sage', 'explorer', 'creator', 'caregiver', 'rebel']),
  archetypeSecondary: z.string(),
  confidence: z.number(),
  reasoning: z.string(),
});

const EvidenceResponseSchema = z.object({
  highlights: z.array(
    z.object({
      trait: z.string(),
      phrases: z.array(
        z.object({
          quote: z.string(),
          occurrence: z.number().int().positive(),
        }),
      ),
    }),
  ),
});

const DAILY_TOKEN_CAP = Number(process.env.DAILY_TOKEN_CAP ?? 15000);
const DAILY_COST_CAP_CENTS = Number(process.env.DAILY_COST_CAP_CENTS ?? 200);

function clamp(n: unknown): number {
  const num = Number(n);
  if (!Number.isFinite(num)) return 50;
  return Math.min(100, Math.max(0, Math.round(num)));
}

export const POST = withErrorHandler(async (req) => {
  const body = AnalyzeInputSchema.parse(await req.json());
  const response = new Response();
  const supabase = createEdgeClient(req, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new SessionExpiredError();

  // Consent gate
  const { data: consent } = await supabase
    .from('consent_records')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  if (!consent) throw new ConsentRequiredError();

  const service = createEdgeServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const model = getModelId();

  // ChatGPT seed flow — recover original pasted portrait
  const augmentedTexts = [...body.texts];
  const augmentedAreas = body.areas ? [...body.areas] : undefined;
  if (body.sessionId) {
    const { data: seedRow } = await service
      .from('onboarding_sessions')
      .select('flags')
      .eq('id', body.sessionId)
      .eq('user_id', user.id)
      .maybeSingle();
    const flags = (seedRow?.flags ?? null) as
      | { seeded?: boolean; seedText?: string }
      | null;
    if (flags?.seeded && typeof flags.seedText === 'string' && flags.seedText.length > 0) {
      augmentedTexts.unshift(flags.seedText);
      if (augmentedAreas) {
        augmentedAreas.unshift('Retrato importado desde ChatGPT');
      }
    }
  }

  // Pass 1 — Big Five vía módulo ML propio (ADR-026).
  // Si el módulo ML cae, NO degradamos a Claude para Big Five (ADR-026
  // explícito: el módulo ML es la única fuente de inferencia Big Five).
  const combinedText = augmentedTexts.join('\n\n');
  let mlResult;
  try {
    mlResult = await inferBigFive(combinedText);
  } catch (e) {
    if (e instanceof MlApiUnavailableError) {
      throw new MlUnavailableError(
        'El módulo de análisis no está disponible en este momento. Probá de nuevo en unos minutos.',
      );
    }
    if (e instanceof MlApiError) {
      throw new MlUnavailableError(
        'El módulo de análisis devolvió un error inesperado. Probá de nuevo.',
      );
    }
    throw e;
  }

  // Estimate tokens + cost para la pasada narrativa (Pass 1.5 + Pass 2)
  const estInput = 3000 + Math.ceil(combinedText.length / 4);
  const estOutput = 1200;
  const estCostCents = costUsdCents(model, estInput, estOutput);

  // Atomic charge_rate_limit
  const { data: charge, error: chargeError } = await service.rpc('charge_rate_limit', {
    p_user_id: user.id,
    p_day: today,
    p_est_input: estInput,
    p_est_output: estOutput,
    p_est_cost_cents: estCostCents,
    p_daily_token_cap: DAILY_TOKEN_CAP,
    p_daily_cost_cap_cents: DAILY_COST_CAP_CENTS,
  });

  if (chargeError) {
    console.error('[analyze] charge_rate_limit failed', chargeError);
    throw new ClaudeError(chargeError);
  }
  const chargeRow = Array.isArray(charge) ? charge[0] : charge;
  if (!chargeRow?.allowed) {
    throw new RateLimitError(86400);
  }

  // Pass 1.5 — Lectura interpretativa (Jung + arquetipo + reasoning)
  const { system, prompt } = buildInterpretNarrativePrompt({
    texts: augmentedTexts,
    areas: augmentedAreas,
    bigFive: mlResult.bigFive,
    perDimensionStatus: mlResult.perDimensionStatus,
  });

  let actualInput = 0;
  let actualOutput = 0;
  let actualCost = 0;

  try {
    const claudeResult = await claudeText({
      system,
      prompt,
      temperature: 0,
      maxTokens: 1500,
    });
    actualInput = claudeResult.inputTokens;
    actualOutput = claudeResult.outputTokens;
    actualCost = costUsdCents(model, actualInput, actualOutput);

    // Parse + validate Claude response
    const jsonMatch = claudeResult.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in interpret response');
    const rawJson = JSON.parse(jsonMatch[0]);

    const sanitized = {
      ...rawJson,
      jungFunctions: {
        Se: clamp(rawJson.jungFunctions?.Se),
        Si: clamp(rawJson.jungFunctions?.Si),
        Ne: clamp(rawJson.jungFunctions?.Ne),
        Ni: clamp(rawJson.jungFunctions?.Ni),
        Te: clamp(rawJson.jungFunctions?.Te),
        Ti: clamp(rawJson.jungFunctions?.Ti),
        Fe: clamp(rawJson.jungFunctions?.Fe),
        Fi: clamp(rawJson.jungFunctions?.Fi),
      },
      confidence: clamp(rawJson.confidence),
    };

    const interpret = InterpretResponseSchema.parse(sanitized);

    const profile: AnalyzeResponse = {
      bigFive: mlResult.bigFive,
      jungFunctions: interpret.jungFunctions,
      archetype: interpret.archetype,
      archetypeSecondary: interpret.archetypeSecondary,
      confidence: interpret.confidence,
      reasoning: interpret.reasoning,
      perDimensionStatus: mlResult.perDimensionStatus,
    };

    // Persist profile
    const { data: inserted, error: insertError } = await service
      .from('psychological_profiles')
      .upsert(
        {
          user_id: user.id,
          version: 1,
          openness: profile.bigFive.openness,
          conscientiousness: profile.bigFive.conscientiousness,
          extraversion: profile.bigFive.extraversion,
          agreeableness: profile.bigFive.agreeableness,
          neuroticism: profile.bigFive.neuroticism,
          jung_functions: profile.jungFunctions,
          archetype: profile.archetype,
          archetype_secondary: profile.archetypeSecondary,
          analysis_raw: {
            ...rawJson,
            ml: {
              modelVersion: mlResult.modelVersion,
              elapsedMs: mlResult.elapsedMs,
              perDimensionStatus: mlResult.perDimensionStatus,
            },
          },
          input_mode: body.mode,
          input_texts: augmentedTexts,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,version' },
      )
      .select('id')
      .single();

    if (insertError || !inserted) {
      console.error('[analyze] profile insert failed', insertError);
      throw new ClaudeError(insertError);
    }

    const profileId = inserted.id;

    // Mark onboarding complete
    await service.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);

    // Research dataset insert if opted in
    const { data: profileRow } = await service
      .from('profiles')
      .select('research_opt_in')
      .eq('id', user.id)
      .single();

    if (profileRow?.research_opt_in) {
      const userHash = await computeHash('research', user.id);
      await service.from('research_dataset').insert({
        user_hash: userHash,
        pepper_version: CURRENT_PEPPER_VERSION,
        input_text: combinedText,
        generated_profile: profile,
      });
    }

    // Pass 2: evidence highlights (fire-and-forget, don't block response)
    runEvidencePass2({
      profileId,
      originalText: combinedText,
      bigFive: profile.bigFive,
      jungFunctions: profile.jungFunctions,
      service,
    }).catch((e) => {
      console.warn('[analyze] Pass 2 evidence failed', e);
    });

    return {
      profileId,
      ...profile,
    };
  } catch (e) {
    console.error('[analyze] interpret pass or persist failed', e);
    throw new ClaudeError(e);
  } finally {
    try {
      await service.rpc('reconcile_rate_limit', {
        p_user_id: user.id,
        p_day: today,
        p_actual_input: actualInput,
        p_actual_output: actualOutput,
        p_estimated_input: estInput,
        p_estimated_output: estOutput,
        p_actual_cost_cents: actualCost,
        p_estimated_cost_cents: estCostCents,
      });
    } catch (e) {
      console.warn('[analyze] reconcile failed', e);
    }
  }
});

async function runEvidencePass2(args: {
  profileId: string;
  originalText: string;
  bigFive: AnalyzeResponse['bigFive'];
  jungFunctions: AnalyzeResponse['jungFunctions'];
  service: ReturnType<typeof createEdgeServiceClient>;
}) {
  const { profileId, originalText, bigFive, jungFunctions, service } = args;
  const { system, prompt } = buildEvidencePrompt({
    originalText,
    bigFive,
    jungFunctions,
  });

  const result = await claudeText({
    system,
    prompt,
    temperature: 0.3,
    maxTokens: 800,
  });

  const jsonMatch = result.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return;
  }
  const validated = EvidenceResponseSchema.safeParse(parsed);
  if (!validated.success) return;

  await service.from('evidence_highlights').insert({
    profile_id: profileId,
    payload: validated.data,
  });
}
