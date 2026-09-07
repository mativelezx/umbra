'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react';
import type { DevelopmentArea } from '@/types';
import { ReflectionArt } from '@/components/ui/ReflectionArt';
export interface ActivityWorkspaceProps {
  areas: DevelopmentArea[];
  onToggle: (areaId: string, actionId: string, goalId: string) => void;
  saving?: boolean;
}
export function ActivityWorkspace({ areas, onToggle, saving = false }: ActivityWorkspaceProps) {
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

  if (selected && selectedArea) return <section className="activity-focus" aria-label="Actividad elegida">
    <button className="quiet-button activity-back" onClick={() => {
      setSelectedId(null);
      requestAnimationFrame(() => {
        if (window.scrollY !== returnScroll.current) window.scrollTo({ top: returnScroll.current, behavior: 'auto' });
        entryRefs.current[selected.id]?.focus({ preventScroll: true });
      });
    }}><ArrowLeft size={20} /> Volver a actividades</button>
    <div className="activity-stage" key={selected.id}>
      <div className="activity-scene dark-surface" aria-hidden="true"><ReflectionArt variant="steps" reveal /><span>Un paso.<br />A tu ritmo.</span></div>
      <div className="activity-instructions">
        <h1 ref={headingRef} tabIndex={-1} className="focus-title">{selected.title}</h1>
        <p className="reading-copy mt-5">{selected.description}</p>
        <h3 className="mt-8 text-lg font-semibold">Pasos sugeridos</h3>
        <p className="mt-2 text-sm text-text-3">Podés adaptar la frecuencia o dejar esta propuesta para otro momento.</p>
        <ul className="activity-steps">
          {selected.microGoals.map(goal => <li key={goal.id}>
            <label className="activity-step">
              <input type="checkbox" className="peer sr-only" checked={goal.completed} disabled={saving} onChange={() => onToggle(selectedArea.id, selected.id, goal.id)} />
              <span aria-hidden="true" className={`activity-check ${goal.completed ? 'is-checked' : ''}`}>{goal.completed && <Check size={16} weight="bold" />}</span>
              <span>{goal.text}</span>
            </label>
          </li>)}
        </ul>
        {saving && <p role="status" className="text-sm text-text-3">Guardando el cambio…</p>}
        <details className="activity-rationale"><summary>Por qué aparece esta propuesta</summary><p className="mt-4 text-sm text-text-2">Interpretación orientativa de IA, no una indicación profesional.</p><p className="mt-3 leading-relaxed text-text-2">{selectedArea.rationale}</p></details>
      </div>
    </div>
  </section>;

  return <div className="activity-library">
    {areas.map(area => <section className="activity-group" key={area.id} aria-label={area.name}>
      <h2>{area.name}</h2>
      <div className="activity-options">{area.actions.map(action => <button key={action.id} ref={node => { entryRefs.current[action.id] = node; }} type="button" aria-label={`Abrir ${action.title}`} className="activity-option" onClick={() => { returnScroll.current = window.scrollY; setSelectedId(action.id); }}>
        <span><span className="activity-option-title">{action.title}</span><span className="activity-option-description">{action.description}</span></span>
        <ArrowRight size={24} aria-hidden="true" />
      </button>)}</div>
    </section>)}
  </div>;
}
