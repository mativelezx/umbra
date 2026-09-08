'use client';

import { ArrowDown } from '@phosphor-icons/react';
import styles from './DashboardExperience.module.css';
import { ReflectionScene } from './ReflectionScene';

interface DashboardIntroProps {
  onRead: () => void;
  firstName?: string;
}

export function DashboardIntro({ onRead, firstName }: DashboardIntroProps) {
  return <section className={styles.personalIntro} aria-label="Cómo recorrer tu resultado"><div><h2>{firstName ? `${firstName}, empezá` : 'Empezá'} por leer.<br /><em>Después, elegí un paso.</em></h2><p>Esta lectura de IA parte de tus respuestas. Mirá qué coincide con tu experiencia y qué no; después podés elegir una actividad o seguir en el chat.</p><button className={styles.readButton} type="button" onClick={onRead}>Leer mi resultado <ArrowDown size={20} aria-hidden="true" /></button></div><ReflectionScene /></section>;
}
