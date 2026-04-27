'use client';

import { useState, type ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardDepthProps {
  children: ReactNode;
  /**
   * Label shown on the toggle button when the deep section is collapsed.
   * Default: "Ver perfil completo". PAIR cap. 5 Feedback + Control.
   */
  collapsedLabel?: string;
  /**
   * Label shown when the deep section is expanded.
   * Default: "Ocultar vista profunda".
   */
  expandedLabel?: string;
  /**
   * If true, starts expanded. Default false (progressive disclosure —
   * the user actively chooses to go deeper). PAIR cap. 3 Mental Models.
   */
  defaultOpen?: boolean;
}

/**
 * Progressive disclosure wrapper for the dashboard's "deep" sections
 * (BigFiveRadar + JungAxisView + ArchetypeMap + Carta Futura). The
 * default view shows only the header + archetype hero + QuickGlance
 * + narrative; the user clicks this toggle to reveal the deeper
 * visualizations.
 *
 * Rationale: los productos asistidos por IA con muchas features se
 * benefician de revelar la complejidad gradualmente — la primera
 * carga muestra el 10 % que ancla el modelo mental del usuario, y
 * la exploración del detalle queda como acción opt-in.
 */
export function DashboardDepth({
  children,
  collapsedLabel = 'Ver perfil completo',
  expandedLabel = 'Ocultar vista profunda',
  defaultOpen = false,
}: DashboardDepthProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group mx-auto flex items-center gap-3 rounded-full border border-violet-400/20 bg-umbra-shadow/30 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-text-2 transition-all duration-200 hover:border-violet-400/50 hover:bg-violet-400/10 hover:text-text-1"
      >
        <span>{open ? expandedLabel : collapsedLabel}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={cn(
            'text-violet-300 transition-transform duration-300',
            open ? 'rotate-180' : 'rotate-0',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="depth"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="flex flex-col gap-10 overflow-hidden md:gap-12"
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}
