'use client';

import { useEffect, useRef } from 'react';

/** Scroll position, not a claim that someone read or understood the text. */
export function ReadingPosition({ revision }: { revision: string }) {
  const ref = useRef<HTMLProgressElement>(null);
  useEffect(() => {
    const progress = ref.current;
    const passage = progress?.parentElement?.parentElement?.querySelector('.reading-passage');
    if (!progress || !passage) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = passage.getBoundingClientRect();
        const position = Math.max(0, Math.min(100, ((window.innerHeight - 100 - bounds.top) / Math.max(1, bounds.height)) * 100));
        progress.value = Math.round(position);
        progress.parentElement?.style.setProperty('--reading-position', `${position}%`);
      });
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(passage);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [revision]);
  return <div className="reading-position"><span>Posición en la lectura</span><progress ref={ref} max={100} defaultValue={0} aria-label="Posición de desplazamiento en la lectura" /><svg className="reading-bookmark" viewBox="0 0 16 22" aria-hidden="true" focusable="false"><path d="M2 1h12v19l-6-4-6 4Z" fill="currentColor" /><path d="M5 6h6M5 9h6" stroke="#f4f3ec" strokeWidth="1" /></svg></div>;
}
