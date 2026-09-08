'use client';

import { ArrowDown, BookOpen, Footprints, ListChecks } from '@phosphor-icons/react';
import styles from './DashboardExperience.module.css';
import { ReflectionScene } from './ReflectionScene';

interface DashboardIntroProps {
  onRead: () => void;
  firstName?: string;
}

export function DashboardIntro({ onRead, firstName }: DashboardIntroProps) {
  return <section aria-label="Cómo recorrer tu resultado">
    <div className={styles.personalIntro}><div>
      <h2>{firstName ? `${firstName}, tu resultado` : 'Tu resultado'},<br /><em>paso a paso.</em></h2>
      <p>Un lugar para poner en palabras cómo sos, relacionarlo con tu día a día y elegir algo que quieras probar. No necesitás saber de psicología: acá te explicamos cada parte.</p>
      <button className={styles.readButton} type="button" onClick={onRead}>Ver mi cuestionario <ArrowDown size={20} aria-hidden="true" /></button>
    </div><ReflectionScene /></div>
    <ol className={styles.route} aria-label="Tres formas de usar Umbra">
      <li><ListChecks size={26} aria-hidden="true" /><span><strong>1. Conocé tus respuestas</strong><span>El cuestionario resume cómo te describís. No hay una personalidad ideal ni una nota que aprobar.</span></span></li>
      <li><BookOpen size={26} aria-hidden="true" /><span><strong>2. Llevá la lectura a tu vida</strong><span>La IA propone una interpretación de lo que contaste. Buscá ejemplos: ¿qué te representa y qué no?</span></span></li>
      <li><Footprints size={26} aria-hidden="true" /><span><strong>3. Elegí algo para probar</strong><span>En «Actividades», elegí una propuesta que tenga sentido para vos. Probala y observá qué te aportó.</span></span></li>
    </ol>
  </section>;
}
