// app/api/research/usability/route.ts

import { z } from 'zod';
import { createEdgeClient as createClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { ConsentRequiredError, RateLimitError, SessionExpiredError } from '@/lib/errors';
import { CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';
import {
  getUsabilityItemMap,
  getUsabilityItems,
  isMetuxInstrument,
  METUX_ROW_INSTRUMENTS,
} from '@/lib/research/instruments';
import type {
  UsabilityInstrument,
  UsabilityResponsePayload,
} from '@/types/research';

export const runtime = 'edge';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const UsabilityInstrumentSchema = z.enum([
  'umux_lite',
  'metux_autonomy',
  'metux_competence',
  'metux_relatedness',
  'cuq',
  'sus',
]);

const UsabilityAnswerSchema = z.object({
  item_key: z.string().min(1).max(120),
  score: z.number().int().min(1).max(7),
  free_text: z.string().trim().max(500).optional(),
});

const UsabilityPayloadSchema = z
  .object({
    instrument: UsabilityInstrumentSchema,
    responses: z.array(UsabilityAnswerSchema).min(1).max(16),
    shown_at: z.string().datetime({ offset: true }),
    answered_at: z.string().datetime({ offset: true }),
  })
  .superRefine((value, ctx) => {
    const expectedItems = getUsabilityItems(value.instrument);
    const expectedKeys = new Set(expectedItems.map((item) => item.itemKey));
    const seenKeys = new Set<string>();

    if (value.responses.length !== expectedItems.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['responses'],
        message: `Se esperaban ${expectedItems.length} respuestas para ${value.instrument}.`,
      });
    }

    value.responses.forEach((answer, index) => {
      if (!expectedKeys.has(answer.item_key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responses', index, 'item_key'],
          message: 'item_key inválido para el instrumento enviado.',
        });
      }

      if (seenKeys.has(answer.item_key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responses', index, 'item_key'],
          message: 'No podés repetir el mismo ítem dentro del mismo envío.',
        });
      }

      seenKeys.add(answer.item_key);
    });

    expectedItems.forEach((item) => {
      if (!seenKeys.has(item.itemKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responses'],
          message: `Falta responder el ítem ${item.itemKey}.`,
        });
      }
    });

    if (new Date(value.answered_at).getTime() < new Date(value.shown_at).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['answered_at'],
        message: 'answered_at no puede ser anterior a shown_at.',
      });
    }
  });

interface SuccessBody {
  ok: true;
  inserted: number;
}

interface FailureBody {
  ok: false;
  error: string;
}

function jsonWithHeaders(
  body: SuccessBody | FailureBody,
  sourceHeaders: Headers,
  init?: ResponseInit,
): Response {
  const response = Response.json(body, init);

  sourceHeaders.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      response.headers.append(key, value);
      return;
    }

    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  });

  return response;
}

function normalizeFreeText(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildInsertRows(userId: string, body: UsabilityResponsePayload) {
  const itemsByKey = getUsabilityItemMap(body.instrument);

  return body.responses.map((answer) => {
    const itemDefinition = itemsByKey.get(answer.item_key);

    if (!itemDefinition) {
      throw new Error(`Missing item definition for ${answer.item_key}`);
    }

    return {
      user_id: userId,
      instrument: isMetuxInstrument(body.instrument)
        ? itemDefinition.instrument
        : body.instrument,
      item_key: answer.item_key,
      score: answer.score,
      free_text: normalizeFreeText(answer.free_text),
      shown_at: body.shown_at,
      answered_at: body.answered_at,
      pepper_version: CURRENT_PEPPER_VERSION,
    };
  });
}

async function findRecentSubmission(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  instrument: UsabilityInstrument,
) {
  const cutoffIso = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

  if (isMetuxInstrument(instrument)) {
    return supabase
      .from('usability_responses')
      .select('answered_at')
      .eq('user_id', userId)
      .in('instrument', [...METUX_ROW_INSTRUMENTS])
      .gte('answered_at', cutoffIso)
      .order('answered_at', { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  return supabase
    .from('usability_responses')
    .select('answered_at')
    .eq('user_id', userId)
    .eq('instrument', instrument)
    .gte('answered_at', cutoffIso)
    .order('answered_at', { ascending: false })
    .limit(1)
    .maybeSingle();
}

export const POST = withErrorHandler(async (req) => {
  const forwardedHeaders = new Response();
  const body: UsabilityResponsePayload = UsabilityPayloadSchema.parse(await req.json());
  const supabase = createClient(req, forwardedHeaders);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new SessionExpiredError();
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('research_opt_in')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[research/usability] failed to load profile', profileError);
    return jsonWithHeaders(
      { ok: false, error: 'db_error' },
      forwardedHeaders.headers,
      { status: 500 },
    );
  }

  if (!profile?.research_opt_in) {
    throw new ConsentRequiredError();
  }

  const { data: recentSubmission, error: rateLimitError } = await findRecentSubmission(
    supabase,
    user.id,
    body.instrument,
  );

  if (rateLimitError) {
    console.error('[research/usability] failed to check recent submission', rateLimitError);
    return jsonWithHeaders(
      { ok: false, error: 'db_error' },
      forwardedHeaders.headers,
      { status: 500 },
    );
  }

  if (recentSubmission?.answered_at) {
    const nextAllowedAt = new Date(
      new Date(recentSubmission.answered_at).getTime() + SEVEN_DAYS_MS,
    );
    const retryAfter = Math.max(
      1,
      Math.ceil((nextAllowedAt.getTime() - Date.now()) / 1000),
    );

    throw new RateLimitError(retryAfter);
  }

  const service = createEdgeServiceClient();
  const rows = buildInsertRows(user.id, body);

  const { error: insertError } = await service.from('usability_responses').insert(rows);

  if (insertError) {
    console.error('[research/usability] insert failed', insertError);
    return jsonWithHeaders(
      { ok: false, error: 'db_error' },
      forwardedHeaders.headers,
      { status: 500 },
    );
  }

  return jsonWithHeaders(
    { ok: true, inserted: rows.length },
    forwardedHeaders.headers,
  );
});
