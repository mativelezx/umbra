'use client';

import { Textarea } from '@/components/ui/Textarea';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Button } from '@/components/ui/Button';
import { ONBOARDING_AREAS } from '@/types';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { wordCount } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

interface GuidedFlowProps {
  onSubmit: () => void;
  loading?: boolean;
}

const MIN_WORDS = 50;

export function GuidedFlow({ onSubmit, loading }: GuidedFlowProps) {
  const { currentStep, texts, setStep, setAreaText } = useOnboardingStore();
  const area = ONBOARDING_AREAS[currentStep];
  const total = ONBOARDING_AREAS.length;
  const currentText = texts[area.key] ?? '';
  const currentCount = wordCount(currentText);
  const canProceed = currentCount >= MIN_WORDS;

  const next = () => {
    if (currentStep < total - 1) setStep(currentStep + 1);
    else onSubmit();
  };
  const prev = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };

  return (
    <div className="flex flex-col gap-8">
      <ProgressDots current={currentStep} total={total} />

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
          {area.label}
        </p>
        <h2 className="mt-3 font-display text-3xl italic text-text-1 md:text-4xl">
          {area.question}
        </h2>
      </div>

      <Textarea
        value={currentText}
        onChange={(e) => setAreaText(area.key, e.target.value)}
        placeholder={area.placeholder}
        minWords={MIN_WORDS}
        showCount
        maxLength={2000}
        rows={8}
      />

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prev}
          disabled={currentStep === 0}
          type="button"
        >
          <ArrowLeft size={16} /> Anterior
        </Button>

        <Button
          variant="primary"
          onClick={next}
          disabled={!canProceed || loading}
          loading={loading}
          type="button"
        >
          {currentStep === total - 1 ? 'Mostrame lo que ves' : 'Siguiente'}{' '}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
