import { z } from 'zod';
import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { ClaudeError, RateLimitError, SessionExpiredError } from '@/lib/errors';
import { claudeText, getModelId } from '@/lib/claude/client';
import { costUsdCents } from '@/lib/claude/pricing';
import { buildDevelopmentPlanPrompt } from '@/lib/prompts/development-plan';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import type { PsychologicalProfile } from '@/types';

export const runtime = 'edge';

const PlanInputSchema = z.object({
  profileId: z.string().uuid(),
  regenerate: z.boolean().optional().default(false),
});

const MicroGoalSchema = z.object({
  text: z.string().min(1).max(300),
});

const ActionSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  microGoals: z.array(MicroGoalSchema).min(1).max(5),
});

const AreaSchema = z.object({
  name: z.string().min(1).max(80),
  rationale: z.string().min(1).max(400),
  actions: z.array(ActionSchema).min(1).max(5),
});

const PlanResponseSchema = z.object({
  areas: z.array(AreaSchema).length(3),
});

const DAILY_TOKEN_CAP = Number(process.env.DAILY_TOKEN_CAP ?? 15000);
const DAILY_COST_CAP_CENTS = Number(process.env.DAILY_COST_CAP_CENTS ?? 200);

// Best-effort extraction of the outermost JSON object from free-form Claude
// output. Handles markdown fences, trailing prose, and truncated responses by
// walking the first balanced {...} and ignoring characters inside strings.
function extractJsonObject(text: string): unknown | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === '\\') {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        const slice = text.slice(start, i + 1);
        try {
          return JSON.parse(slice);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export const POST = withErrorHandler(async (req) => {
  const generationStartedAt = new Date().toISOString();
  const body = PlanInputSchema.parse(await req.json());
  const response = new Response();
  const supabase = createEdgeClient(req, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const { data: consent, error: consentError } = await supabase
    .from('consent_records').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  if (consentError) {
    return Response.json({ ok: false, error: 'consent_unavailable' }, { status: 503 });
  }
  if (!consent) {
    return Response.json({ ok: false, error: 'consent_required' }, { status: 403 });
  }

  const { data: profileRow } = await supabase
    .from('psychological_profiles')
    .select('*')
    .eq('id', body.profileId)
    .eq('user_id', user.id)
    .single();

  if (!profileRow) {
    return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  // Check existing plan
  if (!body.regenerate) {
    const { data: existing } = await supabase
      .from('development_plans')
      .select('id, areas, created_at')
      .eq('user_id', user.id)
      .eq('profile_id', profileRow.id)
      .gte('created_at', profileRow.updated_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) {
      return { planId: existing.id, areas: existing.areas };
    }
  }

  const service = createEdgeServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const model = getModelId();
  const estInput = 2000;
  const estOutput = 1500;
  const estCostCents = costUsdCents(model, estInput, estOutput);

  const { data: charge } = await service.rpc('charge_rate_limit', {
    p_user_id: user.id,
    p_day: today,
    p_est_input: estInput,
    p_est_output: estOutput,
    p_est_cost_cents: estCostCents,
    p_daily_token_cap: DAILY_TOKEN_CAP,
    p_daily_cost_cap_cents: DAILY_COST_CAP_CENTS,
  });
  const chargeRow = Array.isArray(charge) ? charge[0] : charge;
  if (!chargeRow?.allowed) throw new RateLimitError();

  const profile: PsychologicalProfile = {
    id: profileRow.id,
    userId: profileRow.user_id,
    bigFive: {
      openness: profileRow.openness ?? 50,
      conscientiousness: profileRow.conscientiousness ?? 50,
      extraversion: profileRow.extraversion ?? 50,
      agreeableness: profileRow.agreeableness ?? 50,
      neuroticism: profileRow.neuroticism ?? 50,
    },
    jungFunctions: profileRow.jung_functions ?? {
      Se: 50, Si: 50, Ne: 50, Ni: 50, Te: 50, Ti: 50, Fe: 50, Fi: 50,
    },
    archetype: profileRow.archetype,
    analysisRaw: profileRow.analysis_raw ?? undefined,
    archetypeSecondary: profileRow.archetype_secondary ?? '',
    inputMode: profileRow.input_mode,
    inputTexts: profileRow.input_texts ?? [],
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
  };

  const { system, prompt } = buildDevelopmentPlanPrompt(profile);

  let actualInput = 0;
  let actualOutput = 0;
  let actualCost = 0;

  try {
    const result = await claudeText({
      system,
      prompt,
      temperature: 0.4,
      maxTokens: 3500,
    });
    actualInput = result.inputTokens;
    actualOutput = result.outputTokens;
    actualCost = costUsdCents(model, actualInput, actualOutput);

    const rawJson = extractJsonObject(result.text);
    if (!rawJson) throw new Error('No JSON in plan response');
    const validated = PlanResponseSchema.parse(rawJson);

    // Add IDs to each area/action/microgoal so UI can track checkboxes
    const areasWithIds = validated.areas.map((area, i) => ({
      id: `area-${i}`,
      name: area.name,
      rationale: area.rationale,
      actions: area.actions.map((action, j) => ({
        id: `area-${i}-action-${j}`,
        title: action.title,
        description: action.description,
        microGoals: action.microGoals.map((g, k) => ({
          id: `area-${i}-action-${j}-goal-${k}`,
          text: g.text,
          completed: false,
        })),
      })),
    }));

    // Keep previous plans for export/history. Consumers select only current derivatives.
    const { data: inserted, error: insertError } = await service
      .from('development_plans')
      .insert({
        user_id: user.id,
        profile_id: profileRow.id,
        areas: areasWithIds,
        // Anchor freshness before reading the profile, not after the provider returns.
        created_at: generationStartedAt,
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      throw new ClaudeError(insertError);
    }

    return { planId: inserted.id, areas: areasWithIds };
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
      console.warn('[plan] reconcile failed', e);
    }
  }
});
