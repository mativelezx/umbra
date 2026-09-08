'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ListChecks } from '@phosphor-icons/react';
import type { DevelopmentArea } from '@/types';
import styles from './ActivityExperience.module.css';
import { ActivityIllustration } from './ActivityIllustration';
import { ExplainedText } from '@/components/ui/ExplainedText';

export interface ActivityWorkspaceProps {
  areas: DevelopmentArea[];
  onToggle: (areaId: string, actionId: string, goalId: string) => void;
  saving?: boolean;
}
export function ActivityWorkspace({ areas, onToggle, saving = false }: ActivityWorkspaceProps) {
  const id = useId();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const entryRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnScroll = useRef(0);
  const selectedArea = areas.find(area => area.actions.some(action => action.id === selectedId));
  const selected = selectedArea?.actions.find(action => action.id === selectedId);

  useEffect(() => {
    if (selectedId && headingRef.current) {
      const heading = headingRef.current;
      heading.focus({ preventScroll: true });
      const bounds = heading.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > window.innerHeight - 96) heading.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    }
  }, [selectedId]);

  if (selected && selectedArea) return <section className={`activity-focus ${styles.focus}`} aria-label="Actividad elegida">
    <button className="quiet-button activity-back" onClick={() => {
      setSelectedId(null);
      requestAnimationFrame(() => {
        if (window.scrollY !== returnScroll.current) window.scrollTo({ top: returnScroll.current, behavior: 'auto' });
        entryRefs.current[selected.id]?.focus({ preventScroll: true });
      });
    }}><ArrowLeft size={20} aria-hidden="true" /> Volver a actividades</button>
    <div className={`activity-stage ${styles.stage}`} key={selected.id}>
      <div className={styles.scene} aria-hidden="true"><ActivityIllustration title={selected.title} completed={selected.microGoals.filter(goal => goal.completed).length} total={selected.microGoals.length} /><span>Un paso.<br />A tu ritmo.</span></div>
      <div className={`activity-instructions ${styles.instructions}`}>
        <h1 ref={headingRef} tabIndex={-1} className="focus-title">{selected.title}</h1>
        <p className="reading-copy mt-5"><ExplainedText text={selected.description} /></p>
        <div className={styles.stepsHeading}><h2>Pasos sugeridos</h2><span>{selected.microGoals.filter(goal => goal.completed).length} de {selected.microGoals.length} completados</span></div>
        <p className="mt-2 text-sm text-text-3">Podés adaptar la frecuencia o dejar esta propuesta para otro momento.</p>
        <ul className={`activity-steps ${styles.steps}`}>
          {selected.microGoals.map(goal => <li key={goal.id}>
            <label className="activity-step">
              <input type="checkbox" className="peer sr-only" checked={goal.completed} disabled={saving} onChange={() => onToggle(selectedArea.id, selected.id, goal.id)} />
              <span aria-hidden="true" className={`activity-check ${goal.completed ? 'is-checked' : ''}`}>{goal.completed && <Check size={16} weight="bold" />}</span>
              <span><ExplainedText text={goal.text} document /></span>
            </label>
          </li>)}
        </ul>
        {saving && <p role="status" className="text-sm text-text-3">Guardando el cambio…</p>}
        <details className="activity-rationale"><summary>Por qué aparece esta propuesta</summary><p className="mt-4 text-sm text-text-2">Este fundamento fue generado por IA. Si menciona funciones «altas», «bajas» o «débiles», se refiere a asociaciones simbólicas del sistema: no a capacidades medidas ni a defectos tuyos. Tocá las siglas subrayadas para entenderlas.</p><p className="mt-3 leading-relaxed text-text-2"><ExplainedText text={selectedArea.rationale} /></p></details>
      </div>
    </div>
  </section>;

  return <div className={styles.library}>
    {areas.map((area, areaIndex) => <section className={styles.group} key={area.id} aria-label={area.name}>
      <div className={styles.groupHeading}><h2>{area.name}</h2><span>{area.actions.length} {area.actions.length === 1 ? 'propuesta' : 'propuestas'}</span></div>
      <div className={styles.options}>{area.actions.map((action, actionIndex) => {
        const completed = action.microGoals.filter(goal => goal.completed).length;
        const countId = `${id}-${areaIndex}-${actionIndex}-count`;
        const variant = areas.slice(0, areaIndex).reduce((count, item) => count + item.actions.length, 0) + actionIndex;
        return <button key={action.id} ref={node => { entryRefs.current[action.id] = node; }} type="button" aria-label={`Abrir ${action.title}`} aria-describedby={countId} className={styles.option} onClick={() => { returnScroll.current = window.scrollY; setSelectedId(action.id); }}>
          <span className={styles.thumbnail} data-tone={variant % 2 === 0 ? 'dark' : 'light'}><ActivityIllustration title={action.title} completed={completed} total={action.microGoals.length} /></span>
          <span className={styles.optionCopy}><span className={styles.optionTitle}>{action.title}</span><span className={styles.optionDescription}>{action.description}</span><span className={styles.optionFooter}><span id={countId}><ListChecks size={18} aria-hidden="true" />{completed} de {action.microGoals.length} pasos completados</span><ArrowRight size={20} aria-hidden="true" /></span></span>
        </button>;
      })}</div>
    </section>)}
  </div>;
}
