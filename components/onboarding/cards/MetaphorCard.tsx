'use client';

import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { MetaphorAnswer, MetaphorQuestion } from '@/types';
import { PhosphorIcon } from './PhosphorIcon';

interface MetaphorCardProps {
  question: MetaphorQuestion;
  onSubmit: (answer: MetaphorAnswer) => void;
  submitting: boolean;
}

export function MetaphorCard({ question, onSubmit, submitting }: MetaphorCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSubmit() {
    if (!selected || submitting) return;
    onSubmit({
      questionId: question.id,
      type: 'metaphor',
      answeredAt: new Date().toISOString(),
      selectedId: selected,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-3xl italic text-text-1 md:text-4xl">
          {question.prompt}
        </h2>
        <p className="font-body text-sm text-text-3">{question.instruction}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {question.cards.map((card) => {
          const isSelected = selected === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelected(card.id)}
              aria-pressed={isSelected}
              className={cn(
                'group flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200',
                isSelected
                  ? 'border-violet-400/80 bg-violet-400/10 shadow-[0_0_32px_rgba(180,102,255,0.22)]'
                  : 'border-violet-400/15 bg-umbra-shadow/40 hover:border-violet-400/40 hover:bg-violet-400/5',
              )}
            >
              <PhosphorIcon
                name={card.iconHint}
                size={28}
                weight={isSelected ? 'duotone' : 'thin'}
                className={cn(
                  'transition-colors',
                  isSelected ? 'text-violet-200' : 'text-text-3 group-hover:text-violet-300',
                )}
              />
              <h3
                className={cn(
                  'font-display text-lg italic',
                  isSelected ? 'text-text-1' : 'text-text-2',
                )}
              >
                {card.title}
              </h3>
              <p className="font-body text-xs leading-snug text-text-3">
                {card.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!selected}
          loading={submitting}
        >
          Continuar
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
