'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

const SECTIONS = ['Tu lectura', 'Datos del modelo', 'Lectura simbólica'] as const;

export function ProfileWorkspace({ reading, measurement, interpretation }: { reading: ReactNode; measurement: ReactNode; interpretation: ReactNode }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  return <div className="profile-workspace">
    <div className="profile-tabs" role="tablist" aria-label="Explorar el resultado">
      {SECTIONS.map((label, index) => <button key={label} ref={node => { tabs.current[index] = node; }} role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
        if (next !== null) { event.preventDefault(); setActive(next); tabs.current[next]?.focus(); }
      }}>{label}</button>)}
    </div>
    {[reading, measurement, interpretation].map((content, index) => <div key={index} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={active !== index} className="profile-panel">{content}</div>)}
    <Link href="/plan" className="journey-next"><span><strong>Ver actividades</strong><span>De la lectura a un paso concreto.</span></span><ArrowRight size={24} aria-hidden="true" /></Link>
  </div>;
}
