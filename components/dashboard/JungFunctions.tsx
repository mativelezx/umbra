import { DimensionBar } from '@/components/ui/DimensionBar';
import type { JungFunctions as JungFunctionsType } from '@/types';

interface JungFunctionsProps {
  jungFunctions: JungFunctionsType;
}

const PERCEIVING: Array<keyof JungFunctionsType> = ['Se', 'Si', 'Ne', 'Ni'];
const JUDGING: Array<keyof JungFunctionsType> = ['Te', 'Ti', 'Fe', 'Fi'];

const LABELS: Record<keyof JungFunctionsType, string> = {
  Se: 'Sensación extravertida',
  Si: 'Sensación introvertida',
  Ne: 'Intuición extravertida',
  Ni: 'Intuición introvertida',
  Te: 'Pensamiento extravertido',
  Ti: 'Pensamiento introvertido',
  Fe: 'Sentimiento extravertido',
  Fi: 'Sentimiento introvertido',
};

export function JungFunctions({ jungFunctions }: JungFunctionsProps) {
  // Identify top 2 functions by score
  const sorted = Object.entries(jungFunctions).sort(([, a], [, b]) => b - a);
  const top2 = new Set(sorted.slice(0, 2).map(([k]) => k));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3 mb-4">
          Percepción
        </p>
        <div className="flex flex-col gap-4">
          {PERCEIVING.map((key) => (
            <DimensionBar
              key={key}
              label={`${key} · ${LABELS[key]}`}
              value={jungFunctions[key]}
              emphasized={top2.has(key)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3 mb-4">
          Juicio
        </p>
        <div className="flex flex-col gap-4">
          {JUDGING.map((key) => (
            <DimensionBar
              key={key}
              label={`${key} · ${LABELS[key]}`}
              value={jungFunctions[key]}
              emphasized={top2.has(key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
