import { z } from 'zod';
import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { CrisisDetected, SessionExpiredError } from '@/lib/errors';
import { runSafetyPipeline } from '@/lib/chat/pipeline';
import { claudeStream, getModelId } from '@/lib/claude/client';
import { costUsdCents } from '@/lib/claude/pricing';
import { buildChatSystemPrompt } from '@/lib/prompts/chat-context';
import { computeHash, CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';
import { crisisResources } from '@/lib/chat/crisis-resources';
import type { PsychologicalProfile } from '@/types';

export const runtime = 'edge';

const ChatInputSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
  /**
   * Autonomy dial — controls how assertive Umbra should be during
   * this turn. See lib/prompts/chat-context.ts ChatAutonomyMode.
   * Default 'guide' matches the previous behavior, so existing clients
   * keep working without change. Fase 3.6 del IMPLEMENTATION_PLAN.md.
   */
  mode: z.enum(['mirror', 'guide', 'challenge']).optional(),
});

const DAILY_TOKEN_CAP = Number(process.env.DAILY_TOKEN_CAP ?? 15000);
const DAILY_COST_CAP_CENTS = Number(process.env.DAILY_COST_CAP_CENTS ?? 200);
const SESSION_IDLE_MS = 45 * 60 * 1000; // 45 minutes

export async function POST(req: Request) {
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
    body = ChatInputSchema.parse(await req.json());
  } catch (e) {
    return Response.json(
      { ok: false, error: 'validation', issues: e instanceof z.ZodError ? e.issues : [] },
      { status: 400 },
    );
  }

  const service = createEdgeServiceClient();

  // Fetch or create conversation
  let conversationId = body.conversationId;
  let lastActivityAt: Date | null = null;
  let priorAssistantTurn: string | undefined;

  if (conversationId) {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id, last_activity_at, user_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!conv) {
      return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    lastActivityAt = new Date(conv.last_activity_at);

    // Session timeout check
    if (Date.now() - lastActivityAt.getTime() > SESSION_IDLE_MS) {
      return Response.json(
        { ok: false, error: 'session_expired', message: 'empezá una conversación nueva' },
        { status: 401 },
      );
    }

    // Fetch last assistant turn for classifier context
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('content')
      .eq('conversation_id', conversationId)
      .eq('role', 'assistant')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    priorAssistantTurn = lastMsg?.content;
  } else {
    // Create new conversation with profile snapshot
    const { data: profileRow } = await supabase
      .from('psychological_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('version', 1)
      .maybeSingle();

    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        profile_snapshot: profileRow,
        last_activity_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (convError || !conv) {
      return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
    }
    conversationId = conv.id;
  }

  // === STAGE 1 + 2: Crisis safety pipeline ===
  try {
    await runSafetyPipeline({
      message: body.message,
      priorAssistantTurn,
      sampleRate: 0.01,
    });
  } catch (e) {
    if (e instanceof CrisisDetected) {
      // Log crisis event with hashed payload
      const userHash = await computeHash('crisis', user.id);
      const messageHash = await computeHash('crisis', body.message);
      await service.from('crisis_events').insert({
        user_hash: userHash,
        pepper_version: CURRENT_PEPPER_VERSION,
        severity: e.severity,
        regex_hits: e.hits,
        message_hash: messageHash,
      });

      return Response.json(
        {
          ok: false,
          error: 'crisis',
          severity: e.severity,
          resources: crisisResources(),
          message:
            e.severity === 'classifier_error'
              ? 'No pudimos verificar tu mensaje. Por tu seguridad, mostramos recursos.'
              : undefined,
        },
        { status: 451 },
      );
    }
    console.error('[chat] unexpected pipeline error', e);
    return Response.json({ ok: false, error: 'internal' }, { status: 500 });
  }

  // === STAGE 3: Rate limit check (atomic) ===
  const today = new Date().toISOString().slice(0, 10);
  const model = getModelId();
  const estInput = 2000 + Math.ceil(body.message.length / 4);
  const estOutput = 1000;
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

  // Fetch profile for system prompt
  const { data: profileRow } = await supabase
    .from('psychological_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('version', 1)
    .maybeSingle();

  const profile: PsychologicalProfile | null = profileRow
    ? {
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
        inputMode: profileRow.input_mode,
        inputTexts: profileRow.input_texts ?? [],
        createdAt: profileRow.created_at,
        updatedAt: profileRow.updated_at,
      }
    : null;

  // Build conversation history for Claude (last 10 messages)
  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(10);

  const historyText = (history ?? [])
    .map((m) => `${m.role === 'user' ? 'Usuario' : 'Umbra'}: ${m.content}`)
    .join('\n\n');

  const system = buildChatSystemPrompt(profile, body.mode ?? 'guide');
  const fullPrompt = `${historyText ? `## Historia de la conversación\n\n${historyText}\n\n` : ''}## Nuevo mensaje del usuario\n\n${body.message}`;

  // Persist user message immediately
  await service.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: body.message,
  });

  // === STAGE 4: Stream Claude response ===
  const encoder = new TextEncoder();
  let fullText = '';
  let inputTokens = 0;
  let outputTokens = 0;
  // Idempotency guard: persistAssistantMessage() is called from both the
  // happy path and the error path, and the happy path can itself throw
  // between the insert and the final enqueue. Without a flag we risk
  // inserting the same assistant row twice on certain error shapes.
  let assistantPersisted = false;

  async function persistAssistantMessage() {
    if (assistantPersisted) return;
    if (fullText.length === 0) return;
    const { error: insertErr } = await service.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: fullText,
    });
    if (insertErr) {
      console.error('[chat] assistant insert failed', insertErr);
      return;
    }
    assistantPersisted = true;
  }

  async function bumpActivity() {
    const { error: updErr } = await service
      .from('conversations')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', conversationId);
    if (updErr) console.error('[chat] activity bump failed', updErr);
  }

  const stream = new ReadableStream({
    async start(controller) {
      // Send conversation ID first for client tracking
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'start', conversationId })}\n\n`,
        ),
      );

      try {
        for await (const event of claudeStream({
          system,
          prompt: fullPrompt,
          temperature: 0.5,
          maxTokens: 1024,
        })) {
          if (event.type === 'text') {
            fullText += event.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', chunk: event.text })}\n\n`,
              ),
            );
          } else if (event.type === 'done') {
            inputTokens = event.inputTokens;
            outputTokens = event.outputTokens;
          }
        }

        await persistAssistantMessage();
        await bumpActivity();

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
        );
      } catch (e) {
        console.error('[chat] stream error', e);
        // Persist whatever partial output we captured so the user doesn't lose
        // the assistant's half-finished turn on retry, and keep the conversation
        // activity timer fresh. persistAssistantMessage() is a no-op if the
        // happy path already ran.
        try {
          await persistAssistantMessage();
          await bumpActivity();
        } catch (persistErr) {
          console.error('[chat] partial persist failed', persistErr);
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'stream_error',
              partial: assistantPersisted,
            })}\n\n`,
          ),
        );
      } finally {
        controller.close();
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
          console.warn('[chat] reconcile failed', e);
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
