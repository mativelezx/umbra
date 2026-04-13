'use client';

import { useEffect, useState } from 'react';
import { LoadingDimension } from '@/components/ui/LoadingDimension';

const STEPS = [
  'analizando tus palabras...',
  'explorando tu Big Five',
  'mapeando tus funciones cognitivas',
  'encontrando tu arquetipo',
  'marcando tu evidencia',
] as const;

export function ProgressiveLoad() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-12 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-[ping_3s_ease-out_infinite] rounded-full bg-violet-400/20" />
        <span className="absolute inset-2 animate-[ping_3s_ease-out_infinite_0.6s] rounded-full bg-violet-400/30" />
        <span className="absolute inset-6 rounded-full bg-violet-400 shadow-[0_0_40px_rgba(180,102,255,0.6)]" />
      </div>

      <div className="max-w-md">
        <p className="font-display text-2xl italic text-text-1 transition-all duration-500">
          {STEPS[stepIndex]}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`transition-all duration-500 ${
                i <= stepIndex ? 'opacity-100' : 'opacity-20'
              }`}
            >
              <LoadingDimension />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
