'use client';

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * LazyMotion wrapper that tree-shakes the heavy animation bundle —
 * only the DOM animation primitives are loaded (no SVG, no layout
 * fallback). Use `<m.div>` from framer-motion inside child components
 * (not `<motion.div>`) to honor the lazy-loaded feature set.
 *
 * MotionConfig applies a reduced-motion strategy consistent with the
 * rest of Umbra: users who prefer reduced motion get instant
 * transitions instead of animated ones. This is accessibility +
 * Positive Computing autonomy (respecting user agency).
 *
 * Wrap the root layout's children with this provider so every client
 * component under it can use `m.div`, `AnimatePresence`, `useReducedMotion`,
 * etc. Fase 3.2 del IMPLEMENTATION_PLAN.md.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ type: 'spring', damping: 26, stiffness: 320 }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
