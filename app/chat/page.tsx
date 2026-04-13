'use client';

import { useState, useRef } from 'react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { CrisisBanner } from '@/components/chat/CrisisBanner';
import { ChatThread } from '@/components/chat/ChatThread';
import { ChatInput } from '@/components/chat/ChatInput';
import { CrisisCard } from '@/components/chat/CrisisCard';
import type { CrisisResource } from '@/lib/chat/crisis-resources';
import type { MessageRole } from '@/types';

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [crisis, setCrisis] = useState<CrisisState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
        body: JSON.stringify({ conversationId, message }),
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

  return (
    <LayoutShell>
      <CrisisBanner />
      <div className="mt-6 flex min-h-[70vh] flex-col justify-between">
        {crisis ? (
          <CrisisCard
            resources={crisis.resources}
            severity={crisis.severity}
            extraMessage={crisis.extraMessage}
          />
        ) : (
          <>
            <ChatThread messages={messages} />
            {error && (
              <div className="mb-4 rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
                {error}
              </div>
            )}
            <ChatInput onSend={handleSend} disabled={sending} />
          </>
        )}
      </div>
    </LayoutShell>
  );
}
