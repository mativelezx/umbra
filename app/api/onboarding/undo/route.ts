import { z } from 'zod';
import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import {
  ConsentRequiredError,
  NotFoundError,
  SessionExpiredError,
} from '@/lib/errors';
import { loadSession, undoLastAnsweredTurn } from '@/lib/onboarding/session-store';

export const runtime = 'edge';

const UndoRequestSchema = z.object({
  sessionId: z.string().uuid(),
});

/**
 * POST /api/onboarding/undo
 *
 * Removes the user's most recent answered turn (and any pending turn
 * queued after it) so they can revise their previous answer. Returns
 * the updated session state so the client can re-render the last
 * answered turn's question with the previous answer pre-filled.
 *
 * Fase 3.4 del IMPLEMENTATION_PLAN.md. Reduces the "single chance"
 * anxiety of the onboarding flow — users can reconsider without
 * starting over. PAIR cap. 5 Feedback + Control heuristic.
 */
export const POST = withErrorHandler(async (req) => {
  const body = UndoRequestSchema.parse(await req.json());
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
  const session = await loadSession(service, user.id, body.sessionId);

  if (session.sessionId !== body.sessionId) {
    throw new NotFoundError('onboarding_session');
  }

  const updated = await undoLastAnsweredTurn(service, session);

  return {
    sessionId: updated.sessionId,
    turns: updated.turns,
    workingProfile: updated.workingProfile,
    flags: updated.flags,
  };
});
