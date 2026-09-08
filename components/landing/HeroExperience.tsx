'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowRight, Pause, Play } from '@phosphor-icons/react';
import { StoryScene } from './StoryScene';
import styles from './Landing.module.css';

const tabs = ['Preguntas', 'Lectura', 'Actividades'] as const;

export function HeroExperience() {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const regionRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updatePreference();
    updateVisibility();
    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    // Without visibility observation the field stays still; the example still works.
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    if (regionRef.current) observer?.observe(regionRef.current);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  const motion = reducedMotion ? 'reduced' : !paused && inView && pageVisible ? 'running' : 'paused';

  return (
    <div ref={regionRef} role="region" aria-label="Vista de ejemplo de Umbra" className={styles.experience} data-motion={motion}>
      <StoryScene selected={selected} />
      <div className={styles.example}>
        <div className={styles.exampleHeader}>
          <span>Vista de ejemplo</span>
          <span aria-hidden="true" className={styles.exampleNumber}>{selected + 1} / 3</span>
        </div>
        <div role="tablist" aria-label="Explorar el recorrido" className={styles.tabs}>
          {tabs.map((label, index) => (
            <button
              key={label}
              ref={(element) => { tabRefs.current[index] = element; }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-panel-${index}`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >{label}</button>
          ))}
        </div>

        {/* A fictional situation connects the three steps. These are illustrative
            examples, not a testimonial or a generated result about the visitor. */}
        <div role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} tabIndex={0} hidden={selected !== 0} className={styles.examplePanel}>
          <div>
            <div className={styles.exampleLead}>
              <p className={styles.sampleQuestion}>¿Qué decisión venís postergando? ¿Qué te cuesta de dar ese paso?</p>
            </div>
            <p className={styles.sampleHelper}>Puede ser algo del trabajo, una relación o un proyecto que te importa.</p>
          </div>
          <p className={styles.sampleNote}>Pregunta ilustrativa. Para responder, primero creás tu cuenta y revisás el uso de tus datos.</p>
        </div>
        <div role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} tabIndex={0} hidden={selected !== 1} className={styles.examplePanel}>
          <div>
            <div className={styles.exampleLead}>
              <p className={styles.readingTitle}>Otra forma de mirar esa decisión.</p>
            </div>
            <p className={styles.readingSource}>Interpretación de ejemplo</p>
            <blockquote className={styles.readingExcerpt}>Contás que buscás estar seguro antes de decidir. ¿Qué necesitás saber y qué podrías probar sin tener todas las respuestas?</blockquote>
          </div>
          <p className={styles.sampleNote}>Ejemplo ficticio, no una conclusión sobre vos. Podés cuestionar la lectura de IA.</p>
        </div>
        <div role="tabpanel" id={`${id}-panel-2`} aria-labelledby={`${id}-tab-2`} tabIndex={0} hidden={selected !== 2} className={styles.examplePanel}>
          <div>
            <div className={styles.exampleLead}>
              <p className={styles.readingTitle}>Probá un paso pequeño</p>
            </div>
            <p className={styles.activityDescription}>Anotá esa decisión. Separá lo que depende de vos de lo que no. Elegí una acción pequeña que puedas intentar esta semana.</p>
          </div>
          <p className={styles.sampleNote}>Actividad ilustrativa. En tu cuenta recibís sugerencias según tus respuestas; vos elegís si hacerlas.</p>
        </div>
        <div className={styles.exampleFooter} aria-hidden="true">
          <span>Una situación. Una mirada. Un paso posible.</span>
          <ArrowRight size={19} />
        </div>
      </div>
      <button type="button" className={styles.motionControl} disabled={reducedMotion} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
        {paused || reducedMotion ? <Play size={14} weight="fill" aria-hidden="true" /> : <Pause size={14} weight="fill" aria-hidden="true" />}
        {reducedMotion ? 'Movimiento reducido' : paused ? 'Reanudar movimiento' : 'Pausar movimiento'}
      </button>
    </div>
  );
}
