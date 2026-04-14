'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface InfoPopoverProps {
  title: string;
  body: string;
  example?: string;
  className?: string;
}

/**
 * Small "?" button that opens a popover with a plain-language explanation
 * of whatever dimension it's next to. Core to the "no jargon" UX: every
 * technical term in the dashboard is one click away from a friendly
 * explanation + everyday example.
 */
export function InfoPopover({ title, body, example, className }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        aria-label={`¿Qué es ${title}?`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded-full text-text-3 transition-colors duration-200',
          'hover:bg-violet-400/10 hover:text-violet-200',
          open && 'bg-violet-400/15 text-violet-200',
        )}
      >
        <Info size={12} weight="bold" />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-1/2 top-6 z-30 w-64 -translate-x-1/2 rounded-lg border border-violet-400/30 bg-umbra-void/95 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm md:w-72"
        >
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-violet-200">
            {title}
          </p>
          <p className="mt-2 font-body text-xs leading-relaxed text-text-2">
            {body}
          </p>
          {example && (
            <p className="mt-3 border-t border-violet-400/15 pt-2 font-body text-[11px] italic leading-relaxed text-text-3">
              Ejemplo: {example}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
