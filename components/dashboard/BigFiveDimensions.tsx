'use client';

import { useId } from 'react';
import Link from 'next/link';
import { Compass, Handshake, ListChecks, UsersThree, Waves } from '@phosphor-icons/react';
import type { BigFive } from '@/types';
import { BIG_FIVE_LABELS } from '@/lib/dimensions/labels';
import {
  BIG_FIVE_KEYS,
  type PerDimensionStatus,
} from '@/lib/profile/dimension-display';
import styles from './DashboardExperience.module.css';

interface BigFiveDimensionsProps {
  bigFive: BigFive;
  status: PerDimensionStatus;
  hasSelfReport?: boolean;
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
 * estado de confianza lo respalda (`ok`). Agrupa las restantes por motivo,
 * sin cifras ni cinco tarjetas vacías que parezcan errores del usuario.
 */
export function BigFiveDimensions({ bigFive, status, hasSelfReport = false }: BigFiveDimensionsProps) {
  const id = useId();
  const reportable = BIG_FIVE_KEYS.filter(key => status[key] === 'ok');
  const uncertain = BIG_FIVE_KEYS.filter(key => status[key] === 'low_confidence');
  const unavailable = BIG_FIVE_KEYS.filter(key => status[key] === 'not_applicable');
  return (
    <section className={styles.measurement} aria-label="Sobre el análisis de texto">
      <div className={styles.measurementIntro}>
        <h2 className="focus-title">{reportable.length ? 'El análisis de texto, por separado.' : '¿Por qué el análisis de texto no muestra puntajes?'}</h2>
        <p className="reading-copy mt-5">El aprendizaje automático, o ML, es un modelo que aprende de ejemplos e intenta estimar rasgos de personalidad a partir de lo que escribís. No calcula tu cuestionario.</p>
        {uncertain.length > 0 && <p className="reading-copy mt-4">Las pruebas todavía no muestran precisión suficiente para darte {reportable.length ? 'todas esas cifras' : 'esos números'}. Es un límite del modelo: no significa que hayas respondido mal ni que tengas un resultado bajo.</p>}
        {reportable.length > 0 && <p className="reading-copy mt-4">Sólo se muestran las dimensiones que cumplen los criterios de evaluación del modelo. Son estimaciones experimentales de 0 a 100, no porcentajes de tu personalidad ni comparaciones con otras personas.</p>}
      </div>
      {(uncertain.length > 0 || unavailable.length > 0) && <div className={styles.evidenceDetail}>
        {uncertain.length > 0 && <p><strong>Sin precisión suficiente:</strong> {uncertain.map(key => BIG_FIVE_LABELS[key].label).join(', ')}.</p>}
        {unavailable.length > 0 && <p><strong>No pudieron evaluarse:</strong> {unavailable.map(key => BIG_FIVE_LABELS[key].label).join(', ')}. No hay un valor reportado para estas dimensiones.</p>}
      </div>}
      {reportable.length > 0 && <ul className={styles.dimensions} aria-label="Estimaciones Big Five que cumplen los criterios del modelo">
      {reportable.map((key) => {
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
                <span
                  data-testid={`bf-value-${key}`}
                  className={styles.dimensionValue}
                >
                  {Math.round(value)}
                  <span> / 100</span>
                </span>
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
          </li>
        );
      })}
    </ul>}
      <div className={styles.evidenceNext}>
        <ListChecks size={26} aria-hidden="true" /><div>
          <h3>¿Qué podés hacer con Umbra?</h3>
          {hasSelfReport
            ? <p>Tu cuestionario ya tiene un resultado calculado con tus respuestas. Podés usarlo para reflexionar, contrastar la lectura de IA y elegir una actividad. No depende de estas estimaciones.</p>
            : <><p>Podés completar el cuestionario para ver cómo te describís en cinco aspectos, con una explicación de cada uno. También podés explorar la lectura y las actividades sin completarlo.</p><Link href="/assessment">Completar mi cuestionario</Link></>}
          <p className={styles.dimensionDescription}>No mezclamos los puntajes del cuestionario con el ML ni usamos tus respuestas para entrenarlo. Las actividades son propuestas para explorar, no soluciones de eficacia comprobada para tu perfil.</p>
        </div>
      </div>
    </section>
  );
}
