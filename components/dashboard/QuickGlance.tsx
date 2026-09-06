import type { BigFive, JungFunctions } from '@/types';
import { BIG_FIVE_LABELS, JUNG_LABELS } from '@/lib/dimensions/labels';
import { quantitativeDimensions, RIDGE_V1_STATUS, type PerDimensionStatus } from '@/lib/profile/dimension-display';

interface QuickGlanceProps {
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  archetypeName: string;
  confidence?: number | null;
  turnsCount?: number | null;
  perDimensionStatus?: PerDimensionStatus;
}

export function QuickGlance({ bigFive, jungFunctions, perDimensionStatus = RIDGE_V1_STATUS }: QuickGlanceProps) {
  const measured = quantitativeDimensions(perDimensionStatus);
  const strongest = [...measured].sort((a, b) => Math.abs(bigFive[b] - 50) - Math.abs(bigFive[a] - 50))[0];
  const topJung = (Object.entries(jungFunctions) as Array<[keyof JungFunctions, number]>).sort(([, a], [, b]) => b - a)[0][0];
  return (
    <section aria-label="Fuentes del resultado" className="grid gap-5 md:grid-cols-2 md:gap-8">
      <div>
        <h2 className="text-base font-bold">Lo que estima el modelo</h2>
        <p className="mt-2 leading-relaxed text-text-2">{strongest ? BIG_FIVE_LABELS[strongest].label : 'Sin dimensión disponible'}{strongest ? `: ${Math.round(bigFive[strongest])} / 100.` : '.'}</p>
        <p className="mt-2 text-sm leading-relaxed text-text-3">Estimación experimental de Big Five mediante ML. No es un percentil ni permite compararte con otras personas. Las dimensiones sin respaldo se muestran sin cifra en el detalle.</p>
      </div>
      <div>
        <h2 className="text-base font-bold">Lo que propone la interpretación</h2>
        <p className="mt-2 leading-relaxed text-text-2">{JUNG_LABELS[topJung].label}.</p>
        <p className="mt-2 text-sm leading-relaxed text-text-3">Interpretación de IA inspirada en funciones de Jung. Es una invitación a explorar cómo te reconocés en el texto.</p>
      </div>
    </section>
  );
}
