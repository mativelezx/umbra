'use client';

import { useState } from 'react';
import { ArrowRight, Check } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type {
  MultiChoiceAnswer,
  MultiChoiceOption,
  MultiChoiceQuestion,
} from '@/types';
import { PhosphorIcon } from './PhosphorIcon';

interface MultiChoiceCardProps {
  question: MultiChoiceQuestion;
  onSubmit: (answer: MultiChoiceAnswer) => void;
  submitting: boolean;
}

export function MultiChoiceCard({
  question,
  onSubmit,
  submitting,
}: MultiChoiceCardProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    if (question.allowMultiple) {
      setSelected((curr) =>
        curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
      );
    } else {
      setSelected([id]);
    }
  }

  function handleSubmit() {
    if (selected.length === 0 || submitting) return;
    onSubmit({
      questionId: question.id,
      type: 'multi_choice',
      answeredAt: new Date().toISOString(),
      selectedIds: selected,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-3xl not-italic text-text-1 md:text-4xl">
          {question.prompt}
        </h2>
        {question.helper && (
          <p className="font-body text-sm text-text-3">{question.helper}</p>
        )}
        {question.allowMultiple && (
          <p className="font-body text-xs text-text-3">
            Podés elegir más de una opción.
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {question.options.map((opt) => (
          <OptionButton
            key={opt.id}
            option={opt}
            selected={selected.includes(opt.id)}
            onClick={() => toggle(opt.id)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={selected.length === 0}
          loading={submitting}
        >
          Continuar
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    </div>
  );
}

function OptionButton({
  option,
  selected,
  onClick,
}: {
  option: MultiChoiceOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200',
        selected
          ? 'border-violet-400/80 bg-violet-400/10 '
          : 'border-violet-400/15 bg-umbra-shadow/40 hover:border-violet-400/40 hover:bg-violet-400/5',
      )}
    >
      {option.iconHint && (
        <PhosphorIcon
          name={option.iconHint}
          size={22}
          weight={selected ? 'fill' : 'regular'}
          className={cn(
            'mt-0.5 shrink-0',
            selected ? 'text-violet-200' : 'text-text-3 group-hover:text-violet-300',
          )}
        />
      )}
      <span
        className={cn(
          'font-body text-sm leading-snug',
          selected ? 'text-text-1' : 'text-text-2',
        )}
      >
        {option.label}
      </span>
      {selected && (
        <Check
          size={16}
          weight="bold"
          className="ml-auto shrink-0 text-violet-200"
        />
      )}
    </button>
  );
}
