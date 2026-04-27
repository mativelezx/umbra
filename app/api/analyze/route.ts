import { z } from 'zod';
import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import {
  ClaudeError,
  ConsentRequiredError,
  RateLimitError,
  SessionExpiredError,
} from '@/lib/errors';
import { claudeText, getModelId } from '@/lib/claude/client';
import { costUsdCents } from '@/lib/claude/pricing';
import { buildInterpretNarrativePrompt } from '@/lib/prompts/interpret-narrative';
import { buildEvidencePrompt } from '@/lib/prompts/analyze-evidence';
import { computeHash, CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';
import {
  inferBigFive,
  isMlApiHealthy,
  MlApiUnavailableError,
} from '@/lib/ml-client';
import type { AnalyzeResponse, BigFive, BigFiveDimension } from '@/types';

export const runtime = 'edge';

/**
 * POST /api/analyze
 *
 * Pipeline post-pivot ML (ADR-002 v2 + ADR-026):
 *   1. Pass 1 — inferencia Big Five vía módulo ML propio (`/ml/`).
 *      DistilBERT congelado + Ridge multi-output entrenado sobre
 *      Essays + corpus rioplatense. Servido por FastAPI en
 *      `process.env.ML_API_URL` (default localhost:8000).
 *   2. Pass 1.5 — lectura interpretativa Jung + arquetipo + razonamiento
 *      vía Claude (`buildInterpretNarrativePrompt`). Recibe los Big Five
 *      ya inferidos como contexto. NO infiere Big Five.
 *   3. Pass 2 — evidence highlights fire-and-forget (sin cambios).
 *
 * Feature flag `ANALYZE_BIG_FIVE_SOURCE`:
 *   - "ml" (default) → módulo ML propio. Si cae, propaga 503.
 *   - "claude" → fallback al prompt viejo `analyze-profile.ts` (deprecated;
 *     re-abre la brecha que el refactor cierra; usar solo durante
 *     contingencia operativa breve).
 */

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
const BIG_FIVE_SOURCE = (process.env.ANALYZE_BIG_FIVE_SOURCE ?? 'ml').toLowerCase();

const BIG_FIVE_DIMS: BigFiveDimension[] = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

function clamp(n: unknown): number {
  const num = Number(n);
  if (!Number.isFinite(num)) return 50;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function clampBigFive(bf: BigFive): BigFive {
  return {
    openness: clamp(bf.openness),
    conscientiousness: clamp(bf.conscientiousness),
    extraversion: clamp(bf.extraversion),
    agreeableness: clamp(bf.agreeableness),
    neuroticism: clamp(bf.neuroticism),
  };
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

  // ChatGPT seed flow — recovery del seed pasado por session
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

  const combinedText = augmentedTexts.join('\n\n');

  // ─── Pass 1 — Inferencia Big Five vía módulo ML propio ────────────────
  let bigFive: BigFive;
  let bigFiveSource: 'ml' | 'claude_fallback' = 'ml';
  let perDimensionStatus: Record<BigFiveDimension, 'ok' | 'low_confidence'> | undefined;
  let mlModelVersion = 'unavailable';

  try {
    const ml = await inferBigFive(combinedText);
    bigFive = clampBigFive(ml.bigFive);
    perDimensionStatus = ml.perDimensionStatus;
    mlModelVersion = ml.modelVersion;
  } catch (e) {
    if (BIG_FIVE_SOURCE !== 'claude') {
      // Política por defecto: NO fallback a Claude para Big Five (ADR-026).
      // Re-abre la brecha entre código y TFG. Devolvemos 503 explícito.
      console.error('[analyze] módulo ML no disponible — devolviendo ai_unavailable', e);
      throw new ClaudeError(e instanceof Error ? e : new Error('ml_api_unavailable'));
    }
    // Modo "claude" (contingencia operativa breve): se loggea, se infiere
    // Big Five con un mini-prompt Claude. El profile queda marcado con
    // bigFiveSource="claude_fallback" para auditar luego.
    console.warn('[analyze] ML caído + flag=claude — fallback a Claude para Big Five');
    const fallbackBf = await fallbackInferBigFiveWithClaude(combinedText);
    bigFive = clampBigFive(fallbackBf);
    bigFiveSource = 'claude_fallback';
  }

  // ─── Rate limit (estimación + reserva atómica) ────────────────────────
  const estInput = 2200 + Math.ceil(combinedText.length / 4);
  const estOutput = 900;
  const estCostCents = costUsdCents(model, estInput, estOutput);

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

  // ─── Pass 1.5 — Lectura interpretativa Jung + arquetipo via Claude ────
  const { system, prompt } = buildInterpretNarrativePrompt({
    texts: augmentedTexts,
    areas: augmentedAreas,
    bigFive,
    perDimensionStatus,
  });

  let actualInput = 0;
  let actualOutput = 0;
  let actualCost = 0;

  try {
    const claudeResult = await claudeText({
      system,
      prompt,
      temperature: 0,
      maxTokens: 1200,
    });
    actualInput = claudeResult.inputTokens;
    actualOutput = claudeResult.outputTokens;
    actualCost = costUsdCents(model, actualInput, actualOutput);

    const jsonMatch = claudeResult.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in interpret-narrative response');
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

    const interpretation = InterpretResponseSchema.parse(sanitized);

    // Persistir profile
    const analysisRaw = {
      bigFive,
      jungFunctions: interpretation.jungFunctions,
      archetype: interpretation.archetype,
      archetypeSecondary: interpretation.archetypeSecondary,
      confidence: interpretation.confidence,
      reasoning: interpretation.reasoning,
      bigFiveSource,
      mlModelVersion,
      perDimensionStatus,
    };

    const { data: inserted, error: insertError } = await service
      .from('psychological_profiles')
      .upsert(
        {
          user_id: user.id,
          version: 1,
          openness: bigFive.openness,
          conscientiousness: bigFive.conscientiousness,
          extraversion: bigFive.extraversion,
          agreeableness: bigFive.agreeableness,
          neuroticism: bigFive.neuroticism,
          jung_functions: interpretation.jungFunctions,
          archetype: interpretation.archetype,
          archetype_secondary: interpretation.archetypeSecondary,
          analysis_raw: analysisRaw,
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
    await service.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);

    // Research dataset insert
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
        generated_profile: { bigFive, ...interpretation, bigFiveSource, mlModelVersion },
      });
    }

    // Pass 2 — evidence highlights (fire-and-forget)
    runEvidencePass2({
      profileId,
      originalText: combinedText,
      bigFive,
      jungFunctions: interpretation.jungFunctions,
      service,
    }).catch((e) => {
      console.warn('[analyze] Pass 2 evidence failed', e);
    });

    return {
      profileId,
      bigFive,
      jungFunctions: interpretation.jungFunctions,
      archetype: interpretation.archetype,
      archetypeSecondary: interpretation.archetypeSecondary,
      confidence: interpretation.confidence,
      reasoning: interpretation.reasoning,
    } satisfies AnalyzeResponse & { profileId: string };
  } catch (e) {
    console.error('[analyze] interpret-narrative failed', e);
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

/**
 * Fallback de contingencia operativa cuando ANALYZE_BIG_FIVE_SOURCE=claude.
 * NO se usa por defecto. Solo activable explícitamente por env var
 * mientras el módulo ML está caído. Re-abre la brecha entre código y
 * TFG y por eso queda fuera del flujo principal.
 */
async function fallbackInferBigFiveWithClaude(text: string): Promise<BigFive> {
  const sys =
    'Sos un instrumento de inferencia Big Five de contingencia. Devolvés JSON con 5 puntuaciones 0-100.';
  const usr = `Inferí Big Five (IPIP-NEO) sobre el siguiente texto introspectivo. Devolvé JSON estricto:\n{"openness":<0-100>,"conscientiousness":<0-100>,"extraversion":<0-100>,"agreeableness":<0-100>,"neuroticism":<0-100>}\n\nTexto:\n${text}`;
  const r = await claudeText({ system: sys, prompt: usr, temperature: 0, maxTokens: 200 });
  const m = r.text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Fallback Claude Big Five: no JSON');
  const j = JSON.parse(m[0]) as Partial<BigFive>;
  return {
    openness: Number(j.openness ?? 50),
    conscientiousness: Number(j.conscientiousness ?? 50),
    extraversion: Number(j.extraversion ?? 50),
    agreeableness: Number(j.agreeableness ?? 50),
    neuroticism: Number(j.neuroticism ?? 50),
  };
}

async function runEvidencePass2(args: {
  profileId: string;
  originalText: string;
  bigFive: BigFive;
  jungFunctions: import('@/types').JungFunctions;
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
