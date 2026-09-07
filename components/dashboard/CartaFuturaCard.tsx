'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Lock, Envelope, X } from '@phosphor-icons/react';
import { formatDateEs } from '@/lib/utils';
import type { Archetype, JungFunctions } from '@/types';
import { ARCHETYPE_INFO } from '@/types';

interface CartaFuturaCardProps {
  example?: boolean;
  letter: {
    id: string;
    content: string;
    unlock_at: string;
    written_at: string;
  };
  snapshot: {
    archetype: Archetype;
    jungFunctions: JungFunctions;
  };
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CartaFuturaCard({ letter, snapshot, example = false }: CartaFuturaCardProps) {
  const [open, setOpen] = useState(false);
  const unlockDate = new Date(letter.unlock_at);
  const isUnlocked = unlockDate <= new Date();
  const daysLeft = Math.ceil((unlockDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const topJung = Object.entries(snapshot.jungFunctions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      openerRef.current?.focus();
      return;
    }
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      // Focus trap: cycle Tab / Shift+Tab between the first and last
      // focusable elements inside the dialog so keyboard users cannot
      // escape behind the modal while it's open.
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('aria-hidden'));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !dialog.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <>
      <section className="glass rounded-lg p-6 md:p-8">
        <div className="flex items-start gap-4">
          {isUnlocked || example ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-violet-400/20 text-violet-200">
              <Envelope size={22} weight="regular" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-umbra-shadow text-text-3">
              <Lock size={20} weight="regular" />
            </div>
          )}
          <div className="flex-1">
            {example ? (
              <>
                <h3 className="font-heading font-semibold text-2xl not-italic text-text-1">
                  Ejemplo de carta al futuro
                </h3>
                <p className="mt-2 font-body text-sm text-text-2">
                  Una nota para volver a leer más adelante. En este ejemplo no se guardó una carta tuya ni se programó una apertura.
                </p>
              </>
            ) : isUnlocked ? (
              <>
                <h3 className="font-heading font-semibold text-2xl not-italic text-text-1">
                  Tu carta al futuro está lista.
                </h3>
                <p className="mt-2 font-body text-sm text-text-2">
                  Escribiste esto hace {formatDateEs(letter.written_at)}. Tu yo de
                  entonces te dejó un mensaje.
                </p>
                <button
                  ref={openerRef}
                  type="button"
                  onClick={() => setOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-violet-400/30 bg-violet-400/10 px-4 py-2 font-heading text-sm text-violet-200 transition-colors hover:bg-violet-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-umbra-void"
                >
                  Leer tu carta →
                </button>
              </>
            ) : (
              <>
                <h3 className="font-heading font-semibold text-2xl not-italic text-text-1">
                  Tu carta se abre el {formatDateEs(unlockDate)}
                </h3>
                <p className="mt-2 font-body text-sm text-text-2">
                  Faltan {daysLeft} {daysLeft === 1 ? 'día' : 'días'}.
                  {' '}
                  Escribiste una nota para tu vos del futuro. Vas a poder leerla cuando
                  llegue esa fecha.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="fixed inset-0 z-50 flex items-center justify-center bg-umbra-void/80 p-4 "
          onClick={close}
        >
          <div
            ref={dialogRef}
            className="card-glow relative max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg p-8 md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar carta"
              className="absolute right-4 top-4 rounded-md p-2 text-text-3 transition-colors hover:bg-violet-400/10 hover:text-text-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <X size={18} weight="bold" />
            </button>
            <p
              id={titleId}
              className="font-body text-sm normal-case tracking-normal text-text-3"
            >
              Carta escrita el {formatDateEs(letter.written_at)}
            </p>
            <article
              id={descriptionId}
              className="mt-6 font-heading font-semibold text-xl not-italic leading-relaxed text-text-1 md:text-2xl md:leading-[1.7]"
            >
              {letter.content.split('\n\n').map((p, i) => (
                <p key={i} className={i > 0 ? 'mt-4' : ''}>
                  {p}
                </p>
              ))}
            </article>
            <div className="mt-10 rounded-md bg-umbra-shadow/50 p-4 font-body text-sm text-text-2">
              <p className="font-heading text-xs normal-case tracking-normal text-text-3 mb-2">
                Cuando escribiste esto eras
              </p>
              <p>
                {ARCHETYPE_INFO[snapshot.archetype].name} · funciones dominantes:{' '}
                <span className="font-body">{topJung.join(', ')}</span>
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              className="mt-8 rounded-md border border-violet-400/20 px-4 py-2 font-heading text-sm text-text-2 transition-colors hover:bg-violet-400/5 hover:text-text-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-umbra-void"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
