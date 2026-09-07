'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
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
  const isDemo = profileId.startsWith('demo-');
  const [draft, setDraft] = useState('');

  const generate = useCallback(
    async (regenerate: boolean) => {
      if (profileId.startsWith('demo-')) return;
      setStreaming(true);
      setError(null);
      setDraft('');
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
        let nextContent = '';
        let completed = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            let event;
            try { event = JSON.parse(line.slice(6)); } catch { continue; }
            if (event.type === 'error') throw new Error('narrative_failed');
            if (event.type === 'done') completed = true;
            if (event.type === 'text' && typeof event.chunk === 'string') {
              nextContent += event.chunk;
              setDraft(nextContent);
            }
          }
        }
        if (!completed || !nextContent.trim()) throw new Error('narrative_incomplete');
        setContent(nextContent);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'unknown');
      } finally {
        setStreaming(false);
        setDraft('');
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
    <section className="narrative-surface" aria-label="Tu lectura">
      <div className={isDemo ? 'sr-only' : 'flex flex-wrap items-center justify-end gap-4'}>
        <h2 className="sr-only">Tu lectura</h2>
        {!isDemo && !streaming && (content || error) && (
          <button
            onClick={() => generate(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-text-2 transition-colors hover:bg-umbra-shadow"
          >
            <ArrowClockwise size={14} />
            {error ? 'Reintentar' : 'Volver a generar'}
          </button>
        )}
      </div>
      <p className="reading-source">{isDemo ? 'Ejemplo de lectura interpretativa de IA. No se genera ni se guarda contenido nuevo.' : 'Interpretación de IA a partir de tus respuestas. Puede equivocarse; elegí qué te sirve.'}</p>
      {streaming && <p role="status" className="mb-4 text-sm text-text-2">Preparando una nueva lectura…</p>}

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
        <p role="alert" className="mb-6 text-sm text-accent-rose">
          No pudimos completar la lectura. {content ? 'Conservamos tu texto anterior. ' : ''}Podés reintentar.
        </p>
      )}

      {(content || draft) && <SectionedNarrative content={content || draft} streaming={streaming} />}
    </section>
  );
}
