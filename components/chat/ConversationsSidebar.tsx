'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChatCircleDots, Plus } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export interface ConversationsSidebarEntry {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}

interface ConversationsSidebarProps {
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onNewChat: () => void;
}

/**
 * Sidebar that lists the user's recent chat conversations. Renders on
 * desktop as a column at the left of the chat. ChatShell exposes the
 * same history through an inline disclosure on narrower screens.
 *
 * Fase 3.3 del IMPLEMENTATION_PLAN.md — chat persistente con historial.
 * PAIR cap. 5 Feedback + Control: users can return to past reflections
 * without restarting the mirror.
 */
export function ConversationsSidebar({
  activeConversationId,
  onSelect,
  onNewChat,
}: ConversationsSidebarProps) {
  const [conversations, setConversations] = useState<ConversationsSidebarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chat/conversations');
      if (!res.ok) {
        setError('No pudimos cargar tus conversaciones.');
        return;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        data?: { conversations: ConversationsSidebarEntry[] };
        conversations?: ConversationsSidebarEntry[];
      };
      const list =
        data.data?.conversations ?? data.conversations ?? [];
      setConversations(list);
    } catch {
      setError('Error de red.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  // Refresh when a new conversation becomes active — covers the case
  // where a fresh chat just started and we want to pull it into the list.
  useEffect(() => {
    if (activeConversationId) {
      void fetchConversations();
    }
  }, [activeConversationId, fetchConversations]);

  return (
    <aside aria-label="Historial de conversaciones" className="conversation-list">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-body text-sm font-medium text-text-1">
          Tus conversaciones
        </p>
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-text-3 px-3 py-2 font-body text-sm text-text-1 transition-colors duration-200 hover:bg-umbra-shadow"
          aria-label="Empezar una conversación nueva"
        >
          <Plus size={16} weight="bold" aria-hidden="true" />
          Nueva conversación
        </button>
      </div>

      {loading && (
        <p role="status" className="font-body text-sm text-text-3">Cargando…</p>
      )}

      {error && (
        <p role="alert" className="font-body text-sm text-accent-rose">{error}</p>
      )}

      {!loading && !error && conversations.length === 0 && (
        <p className="font-body text-sm text-text-3">
          Todavía no empezaste una conversación.
        </p>
      )}

      <ul className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {conversations.map((c) => {
          const isActive = c.id === activeConversationId;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'w-full rounded-md border px-3 py-2 text-left transition-all duration-200',
                  isActive
                    ? 'border-violet-400/40 bg-violet-400/10'
                    : 'border-transparent bg-transparent hover:border-violet-400/15 hover:bg-umbra-shadow/30',
                )}
              >
                <div className="flex items-start gap-2">
                  <ChatCircleDots
                    size={14}
                    weight="duotone"
                    className={cn(
                      'mt-0.5 shrink-0',
                      isActive ? 'text-violet-200' : 'text-text-3',
                    )}
                  />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span
                      className={cn(
                        'font-body text-xs leading-snug',
                        isActive ? 'text-text-1' : 'text-text-2',
                      )}
                    >
                      {c.title}
                    </span>
                    <span className="font-body text-sm normal-case tracking-normal text-text-4">
                      {formatRelative(c.lastMessageAt)} · {c.messageCount}{' '}
                      {c.messageCount === 1 ? 'mensaje' : 'mensajes'}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/**
 * Very small relative date formatter — "hace X min", "hace X h",
 * "hace X d" or the ISO date fallback for older entries. Avoids
 * pulling a library just for this use case.
 */
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(iso).toISOString().slice(0, 10);
}
