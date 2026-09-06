'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowRight, Pause, Play, Footprints } from '@phosphor-icons/react';
import { FluidField } from './FluidField';
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
      <FluidField />
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

        {/* Excerpts from lib/demo/onboarding-script.ts and lib/demo/seed.ts.
            Static demonstration content, never a submitted or generated result. */}
        <div role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} tabIndex={0} hidden={selected !== 0} className={styles.examplePanel}>
          <div>
            <p className={styles.sampleQuestion}>¿Qué te pasa cuando todo parece ir bien pero sentís que algo falta?</p>
            <p className={styles.sampleHelper}>No hay respuesta correcta. Escribí lo que te salga.</p>
          </div>
          <p className={styles.sampleNote}>Una pregunta del recorrido. Tus respuestas empiezan después del consentimiento.</p>
        </div>
        <div role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} tabIndex={0} hidden={selected !== 1} className={styles.examplePanel}>
          <div>
            <p className={styles.readingTitle}>Una lectura para seguir pensando.</p>
            <p className={styles.readingSource}>Interpretación de ejemplo</p>
            <blockquote className={styles.readingExcerpt}>¿Qué pasaría si, una vez por semana, dejaras que una cosa te sorprendiera sin intentar decodificarla en el mismo momento?</blockquote>
          </div>
          <p className={styles.sampleNote}>Fragmento de la muestra local. La interpretación de IA puede equivocarse.</p>
        </div>
        <div role="tabpanel" id={`${id}-panel-2`} aria-labelledby={`${id}-tab-2`} tabIndex={0} hidden={selected !== 2} className={styles.examplePanel}>
          <div>
            <Footprints size={30} weight="light" aria-hidden="true" className={styles.activityIcon} />
            <p className={styles.readingTitle}>Caminata sin destino</p>
            <p className={styles.activityDescription}>Caminá 20 minutos sin música, sin podcast, sin destino. Solo observando lo que hay alrededor: texturas, olores, luz. No lo analices.</p>
          </div>
          <p className={styles.sampleNote}>Actividad de la muestra local. En la app podés elegir una propuesta y marcar sus pasos.</p>
        </div>
        <div className={styles.exampleFooter} aria-hidden="true">
          <span>De una pregunta a una próxima acción.</span>
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
