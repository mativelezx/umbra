'use client';

import { useState } from 'react';
import { ArrowRight, Check } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type {
  MultiChoiceOption,
  ScenarioAnswer,
  ScenarioQuestion,
} from '@/types';
import { PhosphorIcon } from './PhosphorIcon';

interface ScenarioCardProps {
  question: ScenarioQuestion;
  onSubmit: (answer: ScenarioAnswer) => void;
  submitting: boolean;
}

export function ScenarioCard({ question, onSubmit, submitting }: ScenarioCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSubmit() {
    if (!selected || submitting) return;
    onSubmit({
      questionId: question.id,
      type: 'scenario',
      answeredAt: new Date().toISOString(),
      selectedId: selected,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <p className="font-body text-sm normal-case tracking-normal text-text-3">
          {question.prompt}
        </p>
        <h2 className="font-heading font-bold text-2xl not-italic leading-snug text-text-1 md:text-3xl">
          {question.scene}
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {question.options.map((opt) => (
          <OptionButton
            key={opt.id}
            option={opt}
            selected={selected === opt.id}
            onClick={() => setSelected(opt.id)}
          />
        ))}
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
        'answer-choice group relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200',
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
