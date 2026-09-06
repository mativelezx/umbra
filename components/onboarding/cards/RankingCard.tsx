'use client';

import { useState } from 'react';
import { ArrowRight, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { RankingAnswer, RankingQuestion } from '@/types';

interface RankingCardProps {
  question: RankingQuestion;
  onSubmit: (answer: RankingAnswer) => void;
  submitting: boolean;
}

export function RankingCard({ question, onSubmit, submitting }: RankingCardProps) {
  const [ordered, setOrdered] = useState<string[]>([]);
  const remaining = question.items.filter((i) => !ordered.includes(i.id));
  const complete = ordered.length === question.items.length;

  function pick(id: string) {
    if (ordered.includes(id)) return;
    setOrdered((curr) => [...curr, id]);
  }

  function reset() {
    setOrdered([]);
  }

  function handleSubmit() {
    if (!complete || submitting) return;
    onSubmit({
      questionId: question.id,
      type: 'ranking',
      answeredAt: new Date().toISOString(),
      orderedIds: ordered,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-3xl not-italic text-text-1 md:text-4xl">
          {question.prompt}
        </h2>
        <p className="font-body text-sm text-text-3">{question.instruction}</p>
      </header>

      {ordered.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm normal-case tracking-normal text-text-3">
              Tu orden
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 font-body text-xs text-text-3 hover:text-violet-300"
            >
              <ArrowCounterClockwise size={12} /> reiniciar
            </button>
          </div>
          <ol className="flex flex-col gap-2">
            {ordered.map((id, idx) => {
              const item = question.items.find((i) => i.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-violet-400/40 bg-violet-400/10 px-4 py-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-400/20 font-body text-xs text-violet-200">
                    {idx + 1}
                  </span>
                  <span className="font-body text-sm text-text-1">{item?.label}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {remaining.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-body text-sm normal-case tracking-normal text-text-3">
            {ordered.length === 0 ? 'Tocá en orden' : 'Disponibles'}
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {remaining.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pick(item.id)}
                className={cn(
                  'rounded-lg border border-violet-400/15 bg-umbra-shadow/40 px-4 py-3 text-left font-body text-sm text-text-2 transition-all duration-200',
                  'hover:border-violet-400/40 hover:bg-violet-400/5 hover:text-text-1',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!complete}
          loading={submitting}
        >
          Continuar
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
