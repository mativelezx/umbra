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
import { claudeText, getHaikuModelId } from '@/lib/claude/client';
import { costUsdCents } from '@/lib/claude/pricing';
import { runSafetyPipeline } from '@/lib/chat/pipeline';
import {
  BANNED_INSIGHT_RE,
  buildFallbackOpenTextQuestion,
  buildOnboardingConductorPrompt,
  ConductorResponseSchema,
  DEFAULT_CONFIDENCE_THRESHOLD,
  DEFAULT_MAX_TURNS,
  normalizeConductorJson,
  OnboardingAnswerSchema,
} from '@/lib/prompts/onboarding-conductor';
import {
  attachAnswer,
  commitConductorTurn,
  commitFallbackTurn,
  createSession,
  loadSession,
  markAbandoned,
  markCompleted,
} from '@/lib/onboarding/session-store';
import { transcriptCharLength } from '@/lib/onboarding/serialize';
import type { OnboardingNextResponse, OnboardingTurn } from '@/types';

export const runtime = 'edge';

// Extracts the first JSON object from a Claude response, stripping
// markdown code fences and scanning brace-matched positions. Returns
// null if no balanced object is found.
function extractJsonObject(text: string): string | null {
  let s = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences if present.
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

const NextRequestSchema = z.object({
  sessionId: z.string().uuid().nullable(),
  previousAnswer: OnboardingAnswerSchema.nullable(),
});

const DAILY_TOKEN_CAP = Number(process.env.DAILY_TOKEN_CAP ?? 80000);
const DAILY_COST_CAP_CENTS = Number(process.env.DAILY_COST_CAP_CENTS ?? 200);

export const POST = withErrorHandler(async (req) => {
  const body = NextRequestSchema.parse(await req.json());
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

  const service = createEdgeServiceClient();

  let session = body.sessionId
    ? await loadSession(service, user.id, body.sessionId)
    : await createSession(service, user.id);

  if (body.previousAnswer) {
    if (body.previousAnswer.type === 'open_text') {
      try {
        await runSafetyPipeline({
          message: body.previousAnswer.text,
          sampleRate: 0.01,
        });
      } catch (e) {
        if (e instanceof CrisisDetected) {
          await markAbandoned(service, session.sessionId);
        }
        throw e;
      }
    }
    session = await attachAnswer(service, session, body.previousAnswer);
  }

  const today = new Date().toISOString().slice(0, 10);
  const haiku = getHaikuModelId();
  const estInput = 4500 + Math.ceil(transcriptCharLength(session.turns) / 4);
  const estOutput = 2000;
  const estCostCents = costUsdCents(haiku, estInput, estOutput);

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
    console.error('[onboarding/next] charge_rate_limit failed', chargeErr);
    throw new ClaudeError(chargeErr);
  }
  const chargeRow = Array.isArray(charge) ? charge[0] : charge;
  if (!chargeRow?.allowed) throw new RateLimitError(86400);

  const turnNumber = session.turns.length + 1;
  const isSeeded = session.flags?.seeded === true;
  // Seeded sessions run shorter (3 refinement turns) since the baseline
  // profile is already pre-populated from the external retrato.
  const sessionMaxTurns = isSeeded ? 3 : DEFAULT_MAX_TURNS;
  const { system, prompt } = buildOnboardingConductorPrompt({
    priorTurns: session.turns,
    workingProfile: session.workingProfile,
    previousAnswer: body.previousAnswer,
    turnNumber,
    maxTurns: sessionMaxTurns,
    confidenceThreshold: DEFAULT_CONFIDENCE_THRESHOLD,
    seeded: isSeeded,
  });

  let actualInput = 0;
  let actualOutput = 0;
  let actualCost = 0;

  try {
    const result = await claudeText({
      system,
      prompt,
      model: haiku,
      temperature: 0.4,
      maxTokens: 4096,
    });
    actualInput = result.inputTokens;
    actualOutput = result.outputTokens;
    actualCost = costUsdCents(haiku, actualInput, actualOutput);

    const json = extractJsonObject(result.text);
    if (!json) throw new Error('conductor_no_json');

    const repaired = normalizeConductorJson(JSON.parse(json), turnNumber);
    const parsed = ConductorResponseSchema.parse(repaired);

    const cleanInsights = parsed.insights.filter(
      (i) => !BANNED_INSIGHT_RE.test(i.text),
    );

    const updated = await commitConductorTurn(service, session, {
      ...parsed,
      insights: cleanInsights,
    });

    if (parsed.done) {
      await markCompleted(service, updated.sessionId);
    }

    const latestTurn: OnboardingTurn | null =
      updated.turns[updated.turns.length - 1] ?? null;
    if (!latestTurn) {
      throw new Error('conductor_empty_state');
    }

    const envelope: OnboardingNextResponse = {
      sessionId: updated.sessionId,
      turn: latestTurn,
      workingProfile: updated.workingProfile,
      insights: cleanInsights,
      done: parsed.done,
      turnNumber: updated.turns.length,
      maxTurns: sessionMaxTurns,
    };

    return envelope;
  } catch (e) {
    if (e instanceof CrisisDetected) throw e;
    if (e instanceof RateLimitError) throw e;
    if (e instanceof SessionExpiredError) throw e;

    console.error('[onboarding/next] conductor failed, using fallback', e);

    const exclude = session.turns
      .map((t) => t.question.id)
      .filter((id) => id.startsWith('fb-'));
    const fallback = buildFallbackOpenTextQuestion(turnNumber - 1, exclude);
    const updated = await commitFallbackTurn(service, session, fallback);

    const done = updated.turns.length >= sessionMaxTurns;
    if (done) await markCompleted(service, updated.sessionId);

    const envelope: OnboardingNextResponse = {
      sessionId: updated.sessionId,
      turn: updated.turns[updated.turns.length - 1],
      workingProfile: updated.workingProfile,
      insights: [],
      done,
      turnNumber: updated.turns.length,
      maxTurns: sessionMaxTurns,
    };
    return envelope;
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
      console.warn('[onboarding/next] reconcile failed', e);
    }
  }
});
