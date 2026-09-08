import { z } from 'zod';
import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import {
  BudgetExceededError,
  ClaudeError,
  NotFoundError,
  RateLimitError,
  SessionExpiredError,
} from '@/lib/errors';
import { claudeStream, getModelId } from '@/lib/claude/client';
import { costUsdCents } from '@/lib/claude/pricing';
import { buildNarrativePrompt } from '@/lib/prompts/generate-narrative';
import type { PsychologicalProfile } from '@/types';

export const runtime = 'edge';

const NarrativeInputSchema = z.object({
  profileId: z.string().uuid(),
  regenerate: z.boolean().optional().default(false),
});
const NarrativeContentSchema = z.string().trim().min(1).max(20000);

const DAILY_TOKEN_CAP = Number(process.env.DAILY_TOKEN_CAP ?? 15000);
const DAILY_COST_CAP_CENTS = Number(process.env.DAILY_COST_CAP_CENTS ?? 200);

export async function POST(req: Request) {
  const generationStartedAt = new Date().toISOString();
  const response = new Response();
  const supabase = createEdgeClient(req, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: false, error: 'session_expired' }, { status: 401 });
  }

  let body;
  try {
    body = NarrativeInputSchema.parse(await req.json());
  } catch (e) {
    return Response.json(
      { ok: false, error: 'validation', issues: e instanceof z.ZodError ? e.issues : [] },
      { status: 400 },
    );
  }

  // Check acceptance before reading content, reserving budget or generating text.
  const { data: consent, error: consentError } = await supabase
    .from('consent_records').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  if (consentError) {
    return Response.json({ ok: false, error: 'consent_unavailable' }, { status: 503 });
  }
  if (!consent) {
    return Response.json({ ok: false, error: 'consent_required' }, { status: 403 });
  }

  // Fetch profile
  const { data: profileRow, error: profileError } = await supabase
    .from('psychological_profiles')
    .select('*')
    .eq('id', body.profileId)
    .eq('user_id', user.id)
    .single();

  if (profileError || !profileRow) {
    return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  // Check if narrative already exists and regenerate=false
  if (!body.regenerate) {
    const { data: existing } = await supabase
      .from('narratives')
      .select('id, content')
      .eq('profile_id', body.profileId)
      .eq('user_id', user.id)
      .gte('created_at', profileRow.updated_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) {
      // Stream the existing narrative back as SSE
      let replayInterval: ReturnType<typeof setInterval> | undefined;
      return new Response(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            // Preserve every character, including Markdown line breaks and long words.
            const chunks = existing.content.match(/[\s\S]{1,80}/g) ?? [existing.content];
            let i = 0;
            replayInterval = setInterval(() => {
              if (i >= chunks.length) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
                );
                controller.close();
                clearInterval(replayInterval);
                return;
              }
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', chunk: chunks[i] })}\n\n`,
                ),
              );
              i++;
            }, 40);
          },
          cancel() {
            clearInterval(replayInterval);
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        },
      );
    }
  }

  // Atomic charge
  const service = createEdgeServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const model = getModelId();
  const estInput = 2500;
  const estOutput = 2000;
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
  if (!chargeRow?.allowed) {
    return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

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
      Se: 50,
      Si: 50,
      Ne: 50,
      Ni: 50,
      Te: 50,
      Ti: 50,
      Fe: 50,
      Fi: 50,
    },
    archetype: profileRow.archetype,
    archetypeSecondary: profileRow.archetype_secondary ?? '',
    analysisRaw: profileRow.analysis_raw ?? undefined,
    inputMode: profileRow.input_mode,
    inputTexts: profileRow.input_texts ?? [],
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
  };

  const { system, prompt } = buildNarrativePrompt(profile);

  const encoder = new TextEncoder();
  let fullText = '';
  // Keep the reservation for any usage the provider never reports.
  let inputTokens = estInput;
  let outputTokens = estOutput;

  const safeEnqueue = (controller: ReadableStreamDefaultController, chunk: Uint8Array) => {
    try {
      controller.enqueue(chunk);
    } catch {
      // Client disconnected; keep accumulating fullText so we can still persist.
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      let completed = false;
      try {
        for await (const event of claudeStream({
          system,
          prompt,
          temperature: 0.7,
          maxTokens: 2048,
        })) {
          if (event.type === 'text') {
            fullText += event.text;
            safeEnqueue(
              controller,
              encoder.encode(`data: ${JSON.stringify({ type: 'text', chunk: event.text })}\n\n`),
            );
          } else if (event.type === 'usage' || event.type === 'done') {
            if (event.type === 'done') completed = true;
            inputTokens = event.inputTokens ?? inputTokens;
            outputTokens = event.outputTokens ?? outputTokens;
          }
        }
        if (!completed) throw new Error('narrative_incomplete');
        const content = NarrativeContentSchema.parse(fullText);
        const { data: saved, error: saveError } = await service.from('narratives').insert({
          user_id: user.id,
          profile_id: body.profileId,
          content,
          created_at: generationStartedAt,
        }).select('id').single();
        if (saveError || !saved) throw new Error('narrative_save_failed');
        // Completion means the whole provider response is persisted, not merely displayed.
        safeEnqueue(controller, encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch (e) {
        console.error('[narrative] stream error', e);
        safeEnqueue(
          controller,
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'stream_error' })}\n\n`),
        );
      } finally {
        try {
          controller.close();
        } catch {
          // already closed on client disconnect
        }
        try {
          const actualCost = costUsdCents(model, inputTokens, outputTokens);
          await service.rpc('reconcile_rate_limit', {
            p_user_id: user.id,
            p_day: today,
            p_actual_input: inputTokens,
            p_actual_output: outputTokens,
            p_estimated_input: estInput,
            p_estimated_output: estOutput,
            p_actual_cost_cents: actualCost,
            p_estimated_cost_cents: estCostCents,
          });
        } catch (e) {
          console.warn('[narrative] reconcile failed', e);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
