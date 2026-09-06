'use client';

import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { PolarityAnswer, PolarityQuestion } from '@/types';

interface PolarityCardProps {
  question: PolarityQuestion;
  onSubmit: (answer: PolarityAnswer) => void;
  submitting: boolean;
}

function snap(value: number): number {
  const ticks = [0, 25, 50, 75, 100];
  let best = ticks[0];
  let bestDist = Math.abs(value - best);
  for (const t of ticks) {
    const d = Math.abs(value - t);
    if (d < bestDist) {
      best = t;
      bestDist = d;
    }
  }
  return best;
}

export function PolarityCard({ question, onSubmit, submitting }: PolarityCardProps) {
  const [value, setValue] = useState<number>(50);
  const [touched, setTouched] = useState(false);

  function handleRelease() {
    setValue((v) => snap(v));
    setTouched(true);
  }

  function handleSubmit() {
    if (submitting) return;
    onSubmit({
      questionId: question.id,
      type: 'polarity',
      answeredAt: new Date().toISOString(),
      value,
    });
  }

  const leftActive = value < 40;
  const rightActive = value > 60;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-3xl not-italic text-text-1 md:text-4xl">
          {question.prompt}
        </h2>
        {question.helper && (
          <p className="font-body text-sm text-text-3">{question.helper}</p>
        )}
      </header>

      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex-1 font-body text-sm transition-colors',
            leftActive ? 'text-violet-200' : 'text-text-3',
          )}
        >
          {question.leftPole.label}
        </div>
        <div
          className={cn(
            'flex-1 text-right font-body text-sm transition-colors',
            rightActive ? 'text-violet-200' : 'text-text-3',
          )}
        >
          {question.rightPole.label}
        </div>
      </div>

      <div className="px-1">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          onKeyUp={handleRelease}
          className={cn(
            'w-full cursor-pointer appearance-none rounded-full bg-umbra-shadow/70',
            'h-2 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full',
            '[&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-violet-600 [&::-webkit-slider-runnable-track]:to-violet-400',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:-mt-1.5',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-200 [&::-webkit-slider-thumb]:',
            '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet-200',
          )}
          aria-label={question.prompt}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        />
        <div className="mt-2 flex items-center justify-between font-body text-sm normal-case tracking-normal text-text-3">
          <span>{question.leftPole.label.split(' ').slice(0, 2).join(' ')}</span>
          <span className="text-violet-300">{value}</span>
          <span>{question.rightPole.label.split(' ').slice(0, 2).join(' ')}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!touched && value === 50}
          loading={submitting}
        >
          Continuar
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
