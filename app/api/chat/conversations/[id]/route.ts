import { z } from 'zod';
import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { NotFoundError, SessionExpiredError } from '@/lib/errors';

export const runtime = 'edge';

const IdSchema = z.string().uuid();

interface ConversationRow {
  id: string;
  user_id: string;
  created_at: string;
  profile_snapshot: unknown;
}

interface MessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * GET /api/chat/conversations/[id]
 *
 * Returns a single conversation's full message history. Ownership is
 * enforced via the auth.uid() lookup on the `conversations` row (RLS
 * policies also protect against cross-user reads).
 *
 * Fase 3.3 del IMPLEMENTATION_PLAN.md. We extract the [id] segment
 * from the URL path instead of reading it from a Next.js context
 * argument, because our withErrorHandler wrapper only accepts the
 * single `Request` argument.
 */
export const GET = withErrorHandler(async (req) => {
  // Extract the dynamic [id] segment from the pathname.
  // URL shape: /api/chat/conversations/<uuid>
  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const idRaw = segments[segments.length - 1] ?? '';
  const id = IdSchema.parse(idRaw);

  const response = new Response();
  const supabase = createEdgeClient(req, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const service = createEdgeServiceClient();

  const { data: conversation } = await service
    .from('conversations')
    .select('id, user_id, created_at, profile_snapshot')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!conversation) {
    throw new NotFoundError('conversation');
  }

  const row = conversation as ConversationRow;

  const { data: messages } = await service
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  const rows = (messages ?? []) as MessageRow[];

  return {
    id: row.id,
    createdAt: row.created_at,
    messages: rows.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
    })),
  };
});
