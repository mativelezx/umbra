'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowClockwise, BookOpen } from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/LoadingDimension';
import { SectionedNarrative } from './SectionedNarrative';

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
    <section className="card-glow rounded-lg p-8 md:p-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={20} weight="duotone" className="text-violet-300" />
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-3">
            Tu narrativa
          </p>
        </div>
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
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[95%]" />
          <Skeleton className="h-5 w-[90%]" />
          <Skeleton className="mt-6 h-3 w-32" />
          <Skeleton className="h-5 w-[93%]" />
          <Skeleton className="h-5 w-[88%]" />
        </div>
      )}

      {error && (
        <p className="font-body text-sm text-accent-rose">
          No pudimos generar la narrativa. Intentá regenerar.
        </p>
      )}

      {content && <SectionedNarrative content={content} streaming={streaming} />}
    </section>
  );
}
