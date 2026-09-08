'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ListChecks, CirclesFour, Footprints } from '@phosphor-icons/react';
import { DashboardIntro } from './DashboardIntro';
import styles from './DashboardExperience.module.css';

const SECTIONS = [
  { label: 'Tu cuestionario', description: 'Cómo te describís vos', icon: ListChecks },
  { label: 'Tu lectura', description: 'Un texto para reflexionar', icon: BookOpen },
  { label: 'Otras miradas', description: 'Símbolos y ML experimental', icon: CirclesFour },
] as const;

export function ProfileWorkspace({ questionnaire, reading, measurement, interpretation, firstName }: { questionnaire: ReactNode; reading: ReactNode; measurement: ReactNode; interpretation: ReactNode; firstName?: string }) {
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState([true, false, false]);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const readingPanel = useRef<HTMLDivElement>(null);

  function selectSection(index: number) {
    setActive(index);
    setVisited(previous => previous.map((wasVisited, i) => wasVisited || i === index));
  }

  function enterReading() {
    selectSection(0);
    requestAnimationFrame(() => {
      readingPanel.current?.focus({ preventScroll: true });
      readingPanel.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    });
  }

  return <div className={styles.workspace}>
    <DashboardIntro onRead={enterReading} firstName={firstName} />
    <div className={`profile-tabs ${styles.tabs}`} role="tablist" aria-label="Explorar el resultado">
      {SECTIONS.map(({ label, description, icon: Icon }, index) => <button key={label} type="button" ref={node => { tabs.current[index] = node; }} role="tab" aria-label={label} aria-describedby={`${id}-help-${index}`} id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => selectSection(index)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
        if (next !== null) { event.preventDefault(); selectSection(next); tabs.current[next]?.focus(); }
      }}><Icon size={24} aria-hidden="true" /><span>{label}<span id={`${id}-help-${index}`} className={styles.tabDescription}>{description}</span></span></button>)}
    </div>
    {/* Mount the AI reading only on request, then preserve its state across tabs. */}
    {[questionnaire, reading, <div key="exploration">{interpretation}<details className="activity-rationale mt-8"><summary>Ver el módulo experimental de ML</summary>{measurement}</details></div>].map((content, index) => <div key={index} ref={index === 0 ? readingPanel : undefined} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={active !== index} className={`profile-panel ${styles.panel}`}>{visited[index] ? content : null}</div>)}
    <Link href="/plan" className={styles.next}><Footprints size={30} aria-hidden="true" /><span><strong>Ver actividades</strong><span>Elegí algo que quieras explorar y probá un paso concreto.</span></span><ArrowRight size={24} aria-hidden="true" /></Link>
  </div>;
}
