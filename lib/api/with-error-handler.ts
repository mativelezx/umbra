import { z } from 'zod';
import {
  BudgetExceededError,
  ClaudeError,
  ClassifierFailure,
  ConsentRequiredError,
  CrisisDetected,
  NotFoundError,
  RateLimitError,
  SessionExpiredError,
} from '@/lib/errors';
import { crisisResources } from '@/lib/chat/crisis-resources';

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: string;
  [key: string]: unknown;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

type Handler<T> = (req: Request) => Promise<T | Response>;

/**
 * Wraps an API route handler in a consistent response envelope + error catch.
 *
 *     export const POST = withErrorHandler(async (req) => {
 *       const body = MySchema.parse(await req.json());
 *       return { result: 'ok' };
 *     });
 *
 * Handlers may return plain data (wrapped in { ok:true, data }) or a
 * pre-built Response (passed through — useful for SSE streaming).
 */
export function withErrorHandler<T>(handler: Handler<T>): (req: Request) => Promise<Response> {
  return async (req) => {
    try {
      const result = await handler(req);
      if (result instanceof Response) return result;
      return Response.json({ ok: true, data: result } satisfies ApiSuccess<T>);
    } catch (e) {
      return errorToResponse(e, req);
    }
  };
}

function errorToResponse(e: unknown, req: Request): Response {
  if (e instanceof z.ZodError) {
    return Response.json(
      { ok: false, error: 'validation', issues: e.issues } satisfies ApiFailure,
      { status: 400 },
    );
  }

  if (e instanceof RateLimitError) {
    return Response.json(
      { ok: false, error: 'rate_limited', retry_after: e.retryAfter } satisfies ApiFailure,
      { status: 429 },
    );
  }

  if (e instanceof BudgetExceededError) {
    return Response.json(
      { ok: false, error: 'budget_exceeded' } satisfies ApiFailure,
      { status: 503 },
    );
  }

  if (e instanceof CrisisDetected) {
    return Response.json(
      {
        ok: false,
        error: 'crisis',
        severity: e.severity,
        resources: crisisResources(),
      } satisfies ApiFailure,
      { status: 451 },
    );
  }

  if (e instanceof ClassifierFailure) {
    return Response.json(
      {
        ok: false,
        error: 'crisis',
        severity: 'classifier_error',
        resources: crisisResources(),
        message: 'No pudimos verificar tu mensaje. Por tu seguridad mostramos recursos.',
      } satisfies ApiFailure,
      { status: 451 },
    );
  }

  if (e instanceof ClaudeError) {
    return Response.json(
      { ok: false, error: 'ai_unavailable' } satisfies ApiFailure,
      { status: 503 },
    );
  }

  if (e instanceof ConsentRequiredError) {
    return Response.json(
      { ok: false, error: 'consent_required' } satisfies ApiFailure,
      { status: 403 },
    );
  }

  if (e instanceof SessionExpiredError) {
    return Response.json(
      { ok: false, error: 'session_expired' } satisfies ApiFailure,
      { status: 401 },
    );
  }

  if (e instanceof NotFoundError) {
    return Response.json(
      { ok: false, error: 'not_found', resource: e.resource } satisfies ApiFailure,
      { status: 404 },
    );
  }

  // Unknown error — structured log, generic user response
  console.error('[api] unhandled error', {
    path: new URL(req.url).pathname,
    error: e instanceof Error ? { message: e.message, stack: e.stack, name: e.name } : e,
  });

  return Response.json(
    { ok: false, error: 'internal' } satisfies ApiFailure,
    { status: 500 },
  );
}
