'use client';

import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { wordCount } from '@/lib/utils';
import { ArrowRight } from '@phosphor-icons/react';

const MIN_WORDS = 200;

interface FreeTextInputProps {
  onSubmit: () => void;
  loading?: boolean;
}

export function FreeTextInput({ onSubmit, loading }: FreeTextInputProps) {
  const { freeText, setFreeText } = useOnboardingStore();
  const canProceed = wordCount(freeText) >= MIN_WORDS;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
          Escribí libremente
        </p>
        <h2 className="mt-3 font-display text-3xl italic text-text-1 md:text-4xl">
          Contame sobre vos. Tu historia, tu día, lo que pasa por tu cabeza.
        </h2>
        <p className="mt-4 font-body text-text-2 max-w-2xl">
          No hay preguntas ni estructura. Sólo un espacio donde escribir lo que
          sentís que te describe. Mínimo 200 palabras para que el análisis tenga
          algo con qué trabajar.
        </p>
      </div>

      <Textarea
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        placeholder="Empezá por donde quieras..."
        minWords={MIN_WORDS}
        showCount
        maxLength={5000}
        rows={14}
        className="min-h-[300px]"
      />

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!canProceed || loading}
          loading={loading}
          type="button"
          size="lg"
        >
          Mostrame lo que ves <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
