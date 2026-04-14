import { createEdgeClient, createEdgeServiceClient } from '@/lib/supabase/edge';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { SessionExpiredError } from '@/lib/errors';

export const runtime = 'edge';

interface ConversationRow {
  id: string;
  created_at: string;
  profile_snapshot: unknown;
}

interface MessageAggregate {
  conversation_id: string;
  count: number;
  last_at: string;
  first_user_content: string | null;
}

/**
 * GET /api/chat/conversations
 *
 * Returns the authenticated user's most recent conversations ordered
 * by last message time descending, limited to 50. Each item carries a
 * title (first user message truncated), a preview, timestamps and a
 * message count for the sidebar UI.
 *
 * Fase 3.3 del IMPLEMENTATION_PLAN.md — chat persistente con historial.
 */
export const GET = withErrorHandler(async (req) => {
  const response = new Response();
  const supabase = createEdgeClient(req, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const service = createEdgeServiceClient();

  const { data: rows } = await service
    .from('conversations')
    .select('id, created_at, profile_snapshot')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const conversations = (rows ?? []) as ConversationRow[];
  const ids = conversations.map((c) => c.id);
  if (ids.length === 0) {
    return { conversations: [] };
  }

  // Fetch aggregates per conversation in a single round-trip. We pull
  // the first user message for title and the latest message timestamp
  // for ordering.
  const { data: messagesRaw } = await service
    .from('messages')
    .select('conversation_id, role, content, created_at')
    .in('conversation_id', ids)
    .order('created_at', { ascending: true });

  const byConversation = new Map<string, MessageAggregate>();
  for (const m of messagesRaw ?? []) {
    const row = m as {
      conversation_id: string;
      role: 'user' | 'assistant';
      content: string;
      created_at: string;
    };
    const agg = byConversation.get(row.conversation_id);
    if (agg) {
      agg.count += 1;
      if (row.created_at > agg.last_at) agg.last_at = row.created_at;
      if (!agg.first_user_content && row.role === 'user') {
        agg.first_user_content = row.content;
      }
    } else {
      byConversation.set(row.conversation_id, {
        conversation_id: row.conversation_id,
        count: 1,
        last_at: row.created_at,
        first_user_content: row.role === 'user' ? row.content : null,
      });
    }
  }

  const enriched = conversations
    .map((c) => {
      const agg = byConversation.get(c.id) ?? null;
      const title = agg?.first_user_content
        ? truncate(agg.first_user_content, 60)
        : 'Conversación sin título';
      const preview = agg?.first_user_content
        ? truncate(agg.first_user_content, 140)
        : '';
      return {
        id: c.id,
        title,
        preview,
        createdAt: c.created_at,
        lastMessageAt: agg?.last_at ?? c.created_at,
        messageCount: agg?.count ?? 0,
      };
    })
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

  return { conversations: enriched };
});

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1) + '…';
}
