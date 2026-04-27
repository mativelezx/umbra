'use client';

import Link from 'next/link';
import { Phone, LinkSimple, Warning } from '@phosphor-icons/react';
import type { CrisisResource } from '@/lib/chat/crisis-resources';

interface CrisisCardProps {
  resources: CrisisResource[];
  severity: string;
  extraMessage?: string;
}

export function CrisisCard({ resources, severity, extraMessage }: CrisisCardProps) {
  return (
    <div
      role="alert"
      className="relative rounded-lg border-2 border-accent-amber/40 bg-umbra-abyss/90 p-6 md:p-8 backdrop-blur-xl"
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-amber/15">
          <Warning size={26} weight="regular" className="text-accent-amber" />
        </div>
        <div>
          <h2 className="text-balance font-display text-3xl italic text-text-1 md:text-4xl">
            Lo que estás escribiendo me preocupa
          </h2>
          <p className="mt-2 max-w-xl text-pretty font-body leading-relaxed text-text-2">
            Umbra no es terapia y no quiero que pases este momento solo con un sitio web. Hablá con alguien preparado para acompañarte ya.
          </p>
          {extraMessage && (
            <p className="mt-3 text-pretty font-body text-xs italic text-text-3">{extraMessage}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
          Líneas de escucha (Argentina, 24 h)
        </p>
        {resources.map((r) => (
          <a
            key={`${r.type}-${r.value}`}
            href={r.type === 'phone' ? `tel:${r.value.replace(/[^0-9+]/g, '')}` : r.value}
            target={r.type === 'web' ? '_blank' : undefined}
            rel={r.type === 'web' ? 'noopener noreferrer' : undefined}
            className="group flex items-center justify-between gap-4 rounded-md border border-accent-amber/20 bg-accent-amber/5 px-4 py-3 transition-colors hover:border-accent-amber/50 hover:bg-accent-amber/10"
          >
            <div>
              <div className="font-heading text-sm text-text-1 group-hover:text-white">
                {r.label}
              </div>
              {r.region && (
                <div className="mt-0.5 font-mono text-[10px] text-text-3">
                  {r.region} {r.hours && `· ${r.hours}`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 font-mono text-sm text-accent-amber">
              {r.type === 'phone' ? <Phone size={14} /> : <LinkSimple size={14} />}
              {r.value}
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-accent-amber/20 pt-6">
        <p className="font-mono text-[10px] text-text-4">severidad registrada: {severity}</p>
        <Link
          href="/"
          className="rounded-md border border-violet-400/20 px-4 py-2 font-heading text-sm text-text-2 transition-colors hover:bg-violet-400/5 hover:text-text-1"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
