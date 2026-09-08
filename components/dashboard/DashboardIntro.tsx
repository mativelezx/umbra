'use client';

import { ArrowDown } from '@phosphor-icons/react';
import styles from './DashboardExperience.module.css';
import { ReflectionScene } from './ReflectionScene';

interface DashboardIntroProps {
  onRead: () => void;
  firstName?: string;
}

export function DashboardIntro({ onRead, firstName }: DashboardIntroProps) {
  return <section className={styles.personalIntro} aria-label="Cómo recorrer tu resultado"><div><h2>{firstName ? `${firstName}, acá` : 'Acá'} cuenta<br /><em>lo que vos respondés.</em></h2><p>El cuestionario resume cómo te describís en cinco aspectos. Después, una lectura de IA y actividades te ayudan a explorar lo que contaste. Cada parte muestra de dónde sale.</p><button className={styles.readButton} type="button" onClick={onRead}>Ver mi cuestionario <ArrowDown size={20} aria-hidden="true" /></button></div><ReflectionScene /></section>;
}
