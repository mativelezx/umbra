import { z } from 'zod';
import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import {
  ClaudeError,
  ConsentRequiredError,
  CrisisDetected,
  RateLimitError,
  SessionExpiredError,
} from '@/lib/errors';
import { claudeText, getModelId } from '@/lib/claude/client';
import { costUsdCents } from '@/lib/claude/pricing';
import { runSafetyPipeline } from '@/lib/chat/pipeline';
import {
  emptyWorkingProfile,
  normalizeConductorJson,
  WorkingProfileSchema,
} from '@/lib/prompts/onboarding-conductor';
import { buildChatgptSeedParserPrompt } from '@/lib/prompts/chatgpt-seed-parser';
import { createSeededSession } from '@/lib/onboarding/session-store';
import type { WorkingProfile } from '@/types';

// Nontrivial provider calls can exceed Edge's 25-second first-response limit.
export const runtime = 'nodejs';
export const maxDuration = 120;

const SeedRequestSchema = z.object({
  rawText: z.string().min(200).max(14000),
});

const DAILY_TOKEN_CAP = Number(process.env.DAILY_TOKEN_CAP ?? 400000);
const DAILY_COST_CAP_CENTS = Number(process.env.DAILY_COST_CAP_CENTS ?? 200);

function extractJsonObject(text: string): string | null {
  let s = text.trim();
  const fenceMatch = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) s = fenceMatch[1].trim();

  const start = s.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

export const POST = withErrorHandler(async (req) => {
  const body = SeedRequestSchema.parse(await req.json());
  const response = new Response();
  const supabase = createEdgeClient(req, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const { data: consent } = await supabase
    .from('consent_records')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  if (!consent) throw new ConsentRequiredError();

  // Safety pipeline on the pasted text — catches crisis language that
  // might have leaked from ChatGPT's response.
  try {
    await runSafetyPipeline({
      message: body.rawText,
      sampleRate: 0.02,
    });
  } catch (e) {
    if (e instanceof CrisisDetected) throw e;
    throw e;
  }

  const service = createEdgeServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const model = getModelId();

  const estInput = 3500 + Math.ceil(body.rawText.length / 4);
  const estOutput = 1800;
  const estCostCents = costUsdCents(model, estInput, estOutput);

  const { data: charge, error: chargeErr } = await service.rpc('charge_rate_limit', {
    p_user_id: user.id,
    p_day: today,
    p_est_input: estInput,
    p_est_output: estOutput,
    p_est_cost_cents: estCostCents,
    p_daily_token_cap: DAILY_TOKEN_CAP,
    p_daily_cost_cap_cents: DAILY_COST_CAP_CENTS,
  });
  if (chargeErr) {
    console.error('[onboarding/seed] charge_rate_limit failed', chargeErr);
    throw new ClaudeError(chargeErr);
  }
  const chargeRow = Array.isArray(charge) ? charge[0] : charge;
  if (!chargeRow?.allowed) throw new RateLimitError(86400);

  const { system, prompt } = buildChatgptSeedParserPrompt({
    rawText: body.rawText,
  });

  let actualInput = 0;
  let actualOutput = 0;
  let actualCost = 0;

  try {
    const result = await claudeText({
      system,
      prompt,
      model,
      temperature: 0.2,
      maxTokens: 4096,
    });
    actualInput = result.inputTokens;
    actualOutput = result.outputTokens;
    actualCost = costUsdCents(model, actualInput, actualOutput);

    const json = extractJsonObject(result.text);
    if (!json) {
      console.error('[onboarding/seed] no JSON in parser response');
      throw new Error('parser_no_json');
    }

    const repaired = normalizeConductorJson(JSON.parse(json), 1) as Record<
      string,
      unknown
    >;

    // The parser returns a WorkingProfile directly (not wrapped in a
    // ConductorResponse). Extract/normalize the bare profile.
    const profileCandidate =
      repaired.updatedProfile ?? repaired;
    const parsed = WorkingProfileSchema.safeParse(profileCandidate);

    let workingProfile: WorkingProfile;
    if (parsed.success) {
      workingProfile = parsed.data;
    } else {
      console.warn(
        '[onboarding/seed] parser output failed Zod, falling back to empty profile',
        parsed.error.issues,
      );
      workingProfile = emptyWorkingProfile();
    }

    const session = await createSeededSession(
      service,
      user.id,
      workingProfile,
      body.rawText,
    );

    return {
      sessionId: session.sessionId,
      workingProfile: session.workingProfile,
      seeded: true,
    };
  } catch (e) {
    if (e instanceof CrisisDetected) throw e;
    if (e instanceof RateLimitError) throw e;
    if (e instanceof SessionExpiredError) throw e;
    console.error('[onboarding/seed] parse or session creation failed', e);
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
      console.warn('[onboarding/seed] reconcile failed', e);
    }
  }
});
