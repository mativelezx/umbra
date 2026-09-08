'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { MessageRole } from '@/types';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  streaming?: boolean;
}

interface ChatThreadProps {
  messages: ChatMessage[];
  hideDefaultGreeting?: boolean;
}

export function ChatThread({
  messages,
  hideDefaultGreeting = false,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-5">
      {messages.length === 0 && !hideDefaultGreeting && (
        <MessageBubble
          role="assistant"
          content="Hola. ¿En qué estás pensando hoy?"
        />
      )}
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          role={m.role}
          content={m.content}
          streaming={m.streaming}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
