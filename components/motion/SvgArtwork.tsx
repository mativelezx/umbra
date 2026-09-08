'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A finite illustrated gesture, paused outside the viewport or hidden tab.
 * No frame timers, network requests, or content hidden pending hydration. */
export function SvgArtwork({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduced(preference.matches);
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updatePreference();
    updateVisibility();
    preference.addEventListener?.('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting), { threshold: 0.08 },
    );
    if (ref.current) observer?.observe(ref.current);
    return () => {
      observer?.disconnect();
      preference.removeEventListener?.('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className={cn('svg-artwork', className)}
    data-art-motion={reduced ? 'reduced' : visible && pageVisible ? 'running' : 'paused'}>{children}</div>;
}
