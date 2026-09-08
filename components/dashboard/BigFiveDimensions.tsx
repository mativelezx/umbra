'use client';

import { useId } from 'react';
import { Compass, Handshake, ListChecks, UsersThree, Waves } from '@phosphor-icons/react';
import type { BigFive } from '@/types';
import { BIG_FIVE_LABELS } from '@/lib/dimensions/labels';
import {
  BIG_FIVE_KEYS,
  STATUS_LABEL,
  type PerDimensionStatus,
} from '@/lib/profile/dimension-display';
import styles from './DashboardExperience.module.css';

interface BigFiveDimensionsProps {
  bigFive: BigFive;
  status: PerDimensionStatus;
}

const DIMENSION_GUIDE = {
  openness: { icon: Compass, description: 'La disposición a explorar ideas, experiencias y formas nuevas de ver las cosas.' },
  conscientiousness: { icon: ListChecks, description: 'La forma de organizar tareas, sostener compromisos y dar continuidad a lo que empezás.' },
  extraversion: { icon: UsersThree, description: 'La tendencia a buscar interacción social, actividad y estímulos del entorno.' },
  agreeableness: { icon: Handshake, description: 'La disposición a cooperar, considerar a otras personas y cuidar los vínculos.' },
  neuroticism: { icon: Waves, description: 'La tendencia a experimentar emociones intensas ante la tensión y la incertidumbre.' },
} as const;

/**
 * Componente cuantitativo del tablero (HU-06 / ADR-027):
 * muestra la cifra y la barra ÚNICAMENTE para las dimensiones cuyo
 * estado de confianza lo respalda (`ok`). Las restantes se declaran
 * con su estado, sin valor numérico — el sistema no muestra lo que
 * no puede sostener.
 */
export function BigFiveDimensions({ bigFive, status }: BigFiveDimensionsProps) {
  const id = useId();
  return (
    <ul className={styles.dimensions} aria-label="Dimensiones Big Five con su estado de confianza">
      {BIG_FIVE_KEYS.map((key) => {
        const measured = status[key] === 'ok';
        const label = BIG_FIVE_LABELS[key].label;
        const value = bigFive[key];
        const { icon: Icon, description } = DIMENSION_GUIDE[key];
        return (
          <li key={key} className={styles.dimension} aria-labelledby={`${id}-${key}-label`} aria-describedby={`${id}-${key}-description`}>
            <Icon size={28} aria-hidden="true" />
            <div>
              <span className={styles.dimensionLabel} id={`${id}-${key}-label`}>{label}</span>
              <p className={styles.dimensionDescription} id={`${id}-${key}-description`}>{description}</p>
            </div>
              {measured ? (
                <span
                  data-testid={`bf-value-${key}`}
                  className={styles.dimensionValue}
                >
                  {Math.round(value)}
                  <span> / 100</span>
                </span>
              ) : (
                <span
                  data-testid={`bf-status-${key}`}
                  className={styles.dimensionStatus}
                >
                  {STATUS_LABEL[status[key]]}
                </span>
              )}
            {measured && (
              <div
                className={styles.dimensionBar}
                role="progressbar"
                aria-label={`${label}: ${Math.round(value)} sobre 100`}
                aria-valuenow={Math.round(value)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
