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
        className="group flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-white px-5 py-4 text-left text-base font-semibold text-text-1 transition-colors duration-200 hover:bg-umbra-shadow"
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
