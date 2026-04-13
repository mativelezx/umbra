'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/LoadingDimension';

interface NarrativeSectionProps {
  profileId: string;
  initialContent?: string | null;
}

export function NarrativeSection({ profileId, initialContent }: NarrativeSectionProps) {
  const [content, setContent] = useState<string>(initialContent ?? '');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (regenerate: boolean) => {
      setStreaming(true);
      setError(null);
      setContent('');
      try {
        const res = await fetch('/api/narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, regenerate }),
        });
        if (!res.ok || !res.body) {
          throw new Error('narrative_failed');
        }
        const reader = res.body.getReader();
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
              if (event.type === 'text') {
                setContent((prev) => prev + event.chunk);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'unknown');
      } finally {
        setStreaming(false);
      }
    },
    [profileId],
  );

  useEffect(() => {
    // If we have initial content (including demo seed), don't call the API
    if (!initialContent && !profileId.startsWith('demo-')) {
      generate(false);
    }
  }, [initialContent, generate, profileId]);

  return (
    <section className="card-glow rounded-lg p-8 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-3">
          Tu narrativa
        </p>
        {content && !streaming && (
          <button
            onClick={() => generate(true)}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-heading text-xs text-text-3 transition-colors hover:bg-violet-400/5 hover:text-text-1"
          >
            <ArrowClockwise size={14} />
            Regenerar
          </button>
        )}
      </div>

      {streaming && !content && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[93%]" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-[92%]" />
        </div>
      )}

      {error && (
        <p className="font-body text-sm text-accent-rose">
          No pudimos generar la narrativa. Intentá regenerar.
        </p>
      )}

      {content && (
        <article className="font-display text-xl italic leading-relaxed text-text-1 md:text-2xl md:leading-[1.7]">
          {content.split('\n\n').map((paragraph, i) => (
            <p key={i} className={i > 0 ? 'mt-5' : ''}>
              {paragraph}
            </p>
          ))}
          {streaming && <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-violet-400" />}
        </article>
      )}
    </section>
  );
}
