'use client';

import { useCallback, useRef, useState } from 'react';
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
                ? 'rounded-full bg-violet-400/20 px-3 py-1 font-body text-sm normal-case tracking-normal text-violet-200 transition-[scale] duration-150 ease-out active:scale-[0.96]'
                : 'rounded-full px-3 py-1 font-body text-sm normal-case tracking-normal text-text-3 transition-[color,scale] duration-150 ease-out hover:text-text-1 active:scale-[0.96]'
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
  const abortRef = useRef<AbortController | null>(null);

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
    setLoadingConversation(true);
    try {
      const res = await fetch(`/api/chat/conversations/${id}`);
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
      if (!payload) return;
      setConversationId(payload.id);
      setMessages(
        payload.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );
    } catch {
      setError('Error de red al cargar la conversación.');
    } finally {
      setLoadingConversation(false);
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
    setMessages([]);
    setCrisis(null);
    setError(null);
  }, []);

  async function handleSend(message: string) {
    if (crisis) return; // chat is hard-blocked after crisis
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

      // Handle non-streaming error responses (crisis, rate limit, etc.)
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('text/event-stream')) {
        const data = await res.json();
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
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'start' && event.conversationId) {
              setConversationId(event.conversationId);
            } else if (event.type === 'text') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + event.chunk }
                    : m,
                ),
              );
            } else if (event.type === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, streaming: false } : m,
                ),
              );
            } else if (event.type === 'error') {
              throw new Error(event.message ?? 'stream_error');
            }
          } catch (parseErr) {
            console.warn('[chat] parse error', parseErr);
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setError('Se cortó la conexión. Reintentá.');
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMsgId),
      );
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <LayoutShell>
      <h1 className="mb-4 font-bold">Chat</h1>
      <CrisisBanner />
      {profile && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProfileContextPill profile={profile} />
          <AutonomyDial value={autonomyMode} onChange={setAutonomyMode} />
        </div>
      )}
      <div className="mt-4 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <ConversationsSidebar
            activeConversationId={conversationId ?? null}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </div>
        <div className="flex min-h-[70vh] flex-col justify-between rounded-2xl bg-white p-4 md:p-6">
          {crisis ? (
            <CrisisCard
              resources={crisis.resources}
              severity={crisis.severity}
              extraMessage={crisis.extraMessage}
            />
          ) : (
            <>
              <div className="flex flex-col gap-6 pb-6">
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
                <div className="mb-4 rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
                  {error}
                </div>
              )}
              <ChatInput onSend={handleSend} disabled={sending || loadingConversation} />
            </>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
