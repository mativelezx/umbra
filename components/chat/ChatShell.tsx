'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CaretDown, ChatCircleDots } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { CrisisBanner } from '@/components/chat/CrisisBanner';
import { ChatThread } from '@/components/chat/ChatThread';
import { ChatInput } from '@/components/chat/ChatInput';
import { CrisisCard } from '@/components/chat/CrisisCard';
import { ProfileContextPill } from '@/components/chat/ProfileContextPill';
import { QuickPromptChips } from '@/components/chat/QuickPromptChips';
import { ContextualGreeting } from '@/components/chat/ContextualGreeting';
import { ConversationsSidebar } from '@/components/chat/ConversationsSidebar';
import type { CrisisResource } from '@/lib/chat/crisis-resources';
import type { Archetype, BigFive, JungFunctions, MessageRole } from '@/types';
import type { PerDimensionStatus } from '@/lib/profile/dimension-display';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  streaming?: boolean;
}

interface CrisisState {
  severity: string;
  resources: CrisisResource[];
  extraMessage?: string;
}

export interface ChatShellProfile {
  firstName: string | null;
  archetype: Archetype;
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  perDimensionStatus?: PerDimensionStatus;
}

interface ChatShellProps {
  profile: ChatShellProfile | null;
}

type AutonomyMode = 'mirror' | 'guide' | 'challenge';

const AUTONOMY_OPTIONS: ReadonlyArray<{
  value: AutonomyMode;
  label: string;
  helper: string;
}> = [
  { value: 'mirror', label: 'Espejo', helper: 'Te devuelvo lo que decís sin interpretar.' },
  { value: 'guide', label: 'Guía', helper: 'Sumo preguntas para profundizar.' },
  { value: 'challenge', label: 'Reto', helper: 'Cuestiono tus supuestos con cuidado.' },
];

function AutonomyDial({
  value,
  onChange,
}: {
  value: AutonomyMode;
  onChange: (next: AutonomyMode) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-violet-400/15 bg-umbra-shadow/30 p-1"
      role="radiogroup"
      aria-label="Modo de conversación"
    >
      {AUTONOMY_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.helper}
            onClick={() => onChange(opt.value)}
            className={
              active
                ? 'min-h-11 rounded-full bg-text-1 px-4 py-2 font-body text-sm text-white transition-colors duration-150'
                : 'min-h-11 rounded-full px-4 py-2 font-body text-sm text-text-3 transition-colors duration-150 hover:bg-umbra-shadow hover:text-text-1'
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ChatShell({ profile }: ChatShellProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [crisis, setCrisis] = useState<CrisisState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('guide');
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyToggleRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  /**
   * Load a historical conversation's messages into state. Called from
   * the sidebar when the user picks a past conversation. Aborts any
   * in-flight stream and resets crisis + error before swapping.
   */
  const handleSelectConversation = useCallback(async (id: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setCrisis(null);
    setError(null);
    setSending(false);
    setLoadingConversation(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, { signal: controller.signal });
      if (abortRef.current !== controller) return;
      if (!res.ok) {
        setError('No pudimos abrir esta conversación.');
        return;
      }
      const envelope = (await res.json()) as {
        ok?: boolean;
        data?: {
          id: string;
          messages: Array<{
            id: string;
            role: MessageRole;
            content: string;
          }>;
        };
      };
      const payload = envelope.data;
      if (abortRef.current !== controller) return;
      if (!payload) throw new Error('missing_conversation');
      setConversationId(payload.id);
      setMessages(
        payload.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );
    } catch {
      if (abortRef.current !== controller || controller.signal.aborted) return;
      setError('Error de red al cargar la conversación.');
    } finally {
      if (abortRef.current === controller) {
        setLoadingConversation(false);
        abortRef.current = null;
      }
    }
  }, []);

  /**
   * Start a fresh chat. Clears conversationId, messages, crisis state
   * and any error — the next send() will trigger a new conversation
   * server-side, and its id will come back in the SSE 'start' event.
   */
  const handleNewChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setConversationId(undefined);
    setSending(false);
    setLoadingConversation(false);
    setMessages([]);
    setCrisis(null);
    setError(null);
  }, []);

  async function handleSend(message: string) {
    if (crisis || abortRef.current) return;
    setSending(true);
    setError(null);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: message,
    };
    const assistantMsgId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantMsgId, role: 'assistant', content: '', streaming: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message,
          mode: autonomyMode,
        }),
        signal: controller.signal,
      });
      if (abortRef.current !== controller) return;

      // Handle non-streaming error responses (crisis, rate limit, etc.)
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('text/event-stream')) {
        const data = await res.json();
        if (abortRef.current !== controller) return;
        if (data.error === 'crisis') {
          setCrisis({
            severity: data.severity,
            resources: data.resources,
            extraMessage: data.message,
          });
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
          return;
        }
        if (data.error === 'rate_limited') {
          setError('Alcanzaste tu cupo diario. Volvé mañana.');
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
          return;
        }
        if (data.error === 'session_expired') {
          setError('Tu sesión en esta conversación expiró. Empezá una nueva.');
          setConversationId(undefined);
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
          return;
        }
        throw new Error(data.error ?? 'unknown');
      }

      // Stream handling
      if (!res.ok || !res.body) throw new Error('stream_unavailable');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let completed = false;
      let receivedText = false;
      try {
      while (!completed) {
        const { done, value } = await reader.read();
        if (abortRef.current !== controller) return;
        if (done) break;
        buf += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
        const lines = buf.split('\n\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
            const parsed: unknown = JSON.parse(line.slice(6));
            if (!parsed || typeof parsed !== 'object') throw new Error('invalid_stream_event');
            const event = parsed as Record<string, unknown>;
            if (event.type === 'start' && typeof event.conversationId === 'string') {
              setConversationId(event.conversationId);
            } else if (event.type === 'text' && typeof event.chunk === 'string') {
              const chunk = event.chunk;
              receivedText ||= chunk.trim().length > 0;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + chunk }
                    : m,
                ),
              );
            } else if (event.type === 'done') {
              if (!receivedText) throw new Error('empty_stream');
              completed = true;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, streaming: false } : m,
                ),
              );
              break;
            } else if (event.type === 'error') {
              throw new Error('stream_error');
            } else {
              throw new Error('invalid_stream_event');
            }
        }
      }
      if (!completed) throw new Error('incomplete_stream');
      } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
    } catch (e) {
      if (abortRef.current !== controller || controller.signal.aborted || (e instanceof Error && e.name === 'AbortError')) return;
      setError('Se cortó la conexión. Reintentá.');
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMsgId),
      );
    } finally {
      if (abortRef.current === controller) {
        setSending(false);
        abortRef.current = null;
      }
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <LayoutShell>
      <div className="chat-experience">
      <h1 className="mb-4 font-bold">Chat</h1>
      <CrisisBanner />
      {profile && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProfileContextPill profile={profile} />
          <AutonomyDial value={autonomyMode} onChange={setAutonomyMode} />
        </div>
      )}
      <button
        ref={historyToggleRef}
        type="button"
        className="chat-history-toggle"
        aria-expanded={historyOpen}
        aria-controls="chat-history"
        onClick={() => setHistoryOpen((open) => !open)}
      >
        <ChatCircleDots size={20} aria-hidden="true" />
        Tus conversaciones
        <CaretDown size={18} aria-hidden="true" />
      </button>
      <div className="chat-layout">
        <div id="chat-history" className={historyOpen ? 'chat-history is-open' : 'chat-history'}>
          <ConversationsSidebar
            activeConversationId={conversationId ?? null}
            onSelect={(id) => {
              if (historyOpen) historyToggleRef.current?.focus();
              setHistoryOpen(false);
              void handleSelectConversation(id);
            }}
            onNewChat={() => {
              if (historyOpen) historyToggleRef.current?.focus();
              setHistoryOpen(false);
              handleNewChat();
            }}
          />
        </div>
        <div className="chat-reading-surface">
          {crisis ? (
            <CrisisCard
              resources={crisis.resources}
              severity={crisis.severity}
              extraMessage={crisis.extraMessage}
            />
          ) : (
            <>
              <div className="chat-messages flex flex-col gap-6 pb-6" role="region" aria-label="Mensajes de la conversación" tabIndex={0}>
                {isEmpty && profile && (
                  <ContextualGreeting profile={profile} />
                )}
                <ChatThread
                  messages={messages}
                  hideDefaultGreeting={profile != null}
                />
              </div>
              {profile && (
                <QuickPromptChips
                  profile={profile}
                  onPick={(prompt) => handleSend(prompt)}
                  compact={!isEmpty}
                />
              )}
              {loadingConversation && (
                <div className="mb-4 rounded-md border border-violet-400/20 bg-umbra-shadow/40 px-4 py-3 font-body text-sm text-text-3">
                  Cargando conversación…
                </div>
              )}
              {error && (
                <div role="alert" className="mb-4 rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
                  {error}
                </div>
              )}
              <ChatInput onSend={handleSend} disabled={sending || loadingConversation} />
            </>
          )}
        </div>
      </div>
      </div>
    </LayoutShell>
  );
}
