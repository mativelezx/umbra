'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from '@phosphor-icons/react';
import { ReflectionDiagram } from './ReflectionDiagram';

/** Local illustration playback only. Never starts a reading or changes account data. */
export function ReflectionScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [pageVisible, setPageVisible] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduced(preference?.matches ?? true);
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updatePreference(); updateVisibility();
    preference?.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 }) : null;
    if (ref.current) observer?.observe(ref.current);
    return () => { observer?.disconnect(); preference?.removeEventListener('change', updatePreference); document.removeEventListener('visibilitychange', updateVisibility); };
  }, []);
  return <div ref={ref} className="reflection-scene" data-scene-motion={reduced ? 'reduced' : playing && visible && pageVisible ? 'running' : 'paused'}>
    <ReflectionDiagram />
    <div className="reflection-scene-caption"><span>Tu historia. Otra perspectiva.</span><button type="button" disabled={reduced} aria-label={reduced ? 'Movimiento reducido activado' : playing ? 'Pausar ilustración' : 'Reproducir ilustración'} onClick={() => setPlaying(value => !value)}>{playing && !reduced ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}<span>{reduced ? 'Sin movimiento' : playing ? 'Pausar' : 'Reproducir'}</span></button></div>
  </div>;
}
