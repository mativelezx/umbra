'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChartBar, CirclesFour, Footprints } from '@phosphor-icons/react';
import { DashboardIntro } from './DashboardIntro';
import styles from './DashboardExperience.module.css';

const SECTIONS = [
  { label: 'Tu lectura', description: 'Un texto para reflexionar', icon: BookOpen },
  { label: 'Datos del modelo', description: 'Qué se puede estimar', icon: ChartBar },
  { label: 'Lectura simbólica', description: 'Jung y los arquetipos', icon: CirclesFour },
] as const;

export function ProfileWorkspace({ reading, measurement, interpretation, firstName }: { reading: ReactNode; measurement: ReactNode; interpretation: ReactNode; firstName?: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const readingPanel = useRef<HTMLDivElement>(null);

  function enterReading() {
    setActive(0);
    requestAnimationFrame(() => {
      readingPanel.current?.focus({ preventScroll: true });
      readingPanel.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    });
  }

  return <div className={styles.workspace}>
    <DashboardIntro onRead={enterReading} firstName={firstName} />
    <div className={`profile-tabs ${styles.tabs}`} role="tablist" aria-label="Explorar el resultado">
      {SECTIONS.map(({ label, description, icon: Icon }, index) => <button key={label} type="button" ref={node => { tabs.current[index] = node; }} role="tab" aria-label={label} aria-describedby={`${id}-help-${index}`} id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
        if (next !== null) { event.preventDefault(); setActive(next); tabs.current[next]?.focus(); }
      }}><Icon size={24} aria-hidden="true" /><span>{label}<span id={`${id}-help-${index}`} className={styles.tabDescription}>{description}</span></span></button>)}
    </div>
    {[reading, measurement, interpretation].map((content, index) => <div key={index} ref={index === 0 ? readingPanel : undefined} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={active !== index} className={`profile-panel ${styles.panel}`}>{content}</div>)}
    <Link href="/plan" className={styles.next}><Footprints size={30} aria-hidden="true" /><span><strong>Ver actividades</strong><span>Llevá una idea de tu lectura a un paso concreto.</span></span><ArrowRight size={24} aria-hidden="true" /></Link>
  </div>;
}
