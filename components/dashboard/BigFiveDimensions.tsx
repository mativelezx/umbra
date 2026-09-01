'use client';

import type { BigFive } from '@/types';
import { BIG_FIVE_LABELS } from '@/lib/dimensions/labels';
import {
  BIG_FIVE_KEYS,
  STATUS_LABEL,
  type PerDimensionStatus,
} from '@/lib/profile/dimension-display';

interface BigFiveDimensionsProps {
  bigFive: BigFive;
  status: PerDimensionStatus;
}

/**
 * Componente cuantitativo del tablero (HU-06 / ADR-027):
 * muestra la cifra y la barra ÚNICAMENTE para las dimensiones cuyo
 * estado de confianza lo respalda (`ok`). Las restantes se declaran
 * con su estado, sin valor numérico — el sistema no muestra lo que
 * no puede sostener.
 */
export function BigFiveDimensions({ bigFive, status }: BigFiveDimensionsProps) {
  return (
    <ul className="flex flex-col gap-4" aria-label="Dimensiones Big Five con su estado de confianza">
      {BIG_FIVE_KEYS.map((key) => {
        const measured = status[key] === 'ok';
        const label = BIG_FIVE_LABELS[key].label;
        const value = bigFive[key];
        return (
          <li key={key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-body text-sm text-text-1">{label}</span>
              {measured ? (
                <span
                  data-testid={`bf-value-${key}`}
                  className="font-mono text-sm tabular-nums text-violet-200"
                >
                  {Math.round(value)}
                  <span className="text-text-4"> / 100</span>
                </span>
              ) : (
                <span
                  data-testid={`bf-status-${key}`}
                  className="rounded-full border border-violet-400/15 bg-umbra-shadow/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-3"
                >
                  {STATUS_LABEL[status[key]]}
                </span>
              )}
            </div>
            {measured ? (
              <div
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-umbra-shadow/70"
                role="progressbar"
                aria-label={`${label}: ${Math.round(value)} sobre 100`}
                aria-valuenow={Math.round(value)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="bf-bar-grow absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-violet-200"
                  style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="h-1.5 w-full rounded-full border border-dashed border-violet-400/15 bg-transparent"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
