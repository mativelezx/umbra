'use client';

import { useState } from 'react';
import {
  Brain,
  Compass,
  Heart,
  Lightning,
  ShieldStar,
  Sparkle,
  X,
} from '@phosphor-icons/react';
import { ARCHETYPE_INFO } from '@/types';
import type { Archetype } from '@/types';
import { ARCHETYPE_COMPARE } from '@/lib/dimensions/archetype-compare';
import { cn } from '@/lib/utils';

interface ArchetypeMapProps {
  userArchetype: Archetype;
}

const ARCHETYPE_ORDER: Archetype[] = [
  'hero',
  'sage',
  'explorer',
  'creator',
  'caregiver',
  'rebel',
];

const ICON_MAP: Record<Archetype, React.ReactNode> = {
  hero: <ShieldStar size={28} weight="duotone" />,
  sage: <Brain size={28} weight="duotone" />,
  explorer: <Compass size={28} weight="duotone" />,
  creator: <Sparkle size={28} weight="duotone" />,
  caregiver: <Heart size={28} weight="duotone" />,
  rebel: <Lightning size={28} weight="duotone" />,
};

/**
 * Grid of the 6 Pearson archetypes. The user's own archetype glows;
 * the other 5 are dimmed. Clicking any card opens a drawer that
 * explains how it compares to the user's archetype — learning by
 * contrast, not by academic definition.
 */
export function ArchetypeMap({ userArchetype }: ArchetypeMapProps) {
  const [selected, setSelected] = useState<Archetype | null>(null);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Los 6 arquetipos
          </p>
          <h2 className="mt-1 font-display text-2xl italic text-text-1 md:text-3xl">
            Quién sos frente a los demás
          </h2>
        </div>
        <p className="max-w-xs text-right font-body text-xs italic text-text-3">
          Tocá cualquier arquetipo para ver cómo se diferencia del tuyo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {ARCHETYPE_ORDER.map((key) => (
          <ArchetypeTile
            key={key}
            archetype={key}
            isUser={key === userArchetype}
            onClick={() => setSelected(key)}
          />
        ))}
      </div>

      {selected && (
        <CompareDrawer
          userArchetype={userArchetype}
          otherArchetype={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

interface ArchetypeTileProps {
  archetype: Archetype;
  isUser: boolean;
  onClick: () => void;
}

function ArchetypeTile({ archetype, isUser, onClick }: ArchetypeTileProps) {
  const info = ARCHETYPE_INFO[archetype];
  const compare = ARCHETYPE_COMPARE[archetype];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border p-5 text-left transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
        isUser
          ? 'border-violet-400/50 bg-violet-400/10 shadow-[0_0_32px_rgba(180,102,255,0.25)] hover:-translate-y-0.5'
          : 'border-violet-400/10 bg-umbra-shadow/40 opacity-70 hover:-translate-y-0.5 hover:border-violet-400/30 hover:opacity-100',
      )}
    >
      {isUser && (
        <span className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-wider text-violet-200">
          Vos
        </span>
      )}
      <span
        className={cn(
          'transition-colors duration-300',
          isUser ? 'text-violet-200' : 'text-text-3 group-hover:text-violet-300',
        )}
      >
        {ICON_MAP[archetype]}
      </span>
      <h3
        className={cn(
          'font-display text-xl italic',
          isUser ? 'text-text-1' : 'text-text-2',
        )}
      >
        {info.name}
      </h3>
      <p className="font-body text-xs leading-relaxed text-text-3">
        {compare.motto}
      </p>
    </button>
  );
}

interface CompareDrawerProps {
  userArchetype: Archetype;
  otherArchetype: Archetype;
  onClose: () => void;
}

function CompareDrawer({
  userArchetype,
  otherArchetype,
  onClose,
}: CompareDrawerProps) {
  const userInfo = ARCHETYPE_INFO[userArchetype];
  const otherInfo = ARCHETYPE_INFO[otherArchetype];
  const otherCompare = ARCHETYPE_COMPARE[otherArchetype];
  const isSelf = userArchetype === otherArchetype;
  const vsYou = otherCompare.comparisonTo[userArchetype];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-umbra-void/80 backdrop-blur-sm md:items-center md:p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-t-2xl border border-violet-400/30 bg-umbra-void shadow-[0_-10px_60px_rgba(0,0,0,0.6)] md:rounded-2xl md:shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-text-3 transition-colors hover:bg-violet-400/10 hover:text-violet-200"
          aria-label="Cerrar comparación"
        >
          <X size={18} weight="bold" />
        </button>

        <div className="flex flex-col gap-6 p-7 md:p-10">
          <header className="flex flex-col gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-3">
              {isSelf ? 'Sos vos' : `${userInfo.name} × ${otherInfo.name}`}
            </p>
            <h2 className="font-display text-3xl italic text-text-1 md:text-4xl">
              {otherInfo.name}
            </h2>
            <p className="font-body text-sm italic text-violet-200">
              {otherCompare.motto}
            </p>
          </header>

          <DrawerRow label="Qué lo mueve" body={otherCompare.drivenBy} />
          <DrawerRow label="En el día a día" body={otherCompare.everyday} />
          <DrawerRow label="Su mayor fuerza" body={otherCompare.strength} />
          <DrawerRow label="Su sombra" body={otherCompare.shadow} />

          <div className="rounded-lg border border-violet-400/30 bg-violet-400/5 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200">
              {isSelf ? 'Vos mismo' : `Frente a ${userInfo.name}`}
            </p>
            <p className="mt-2 font-display text-lg italic leading-snug text-text-1 md:text-xl">
              {vsYou}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawerRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
        {label}
      </p>
      <p className="font-body text-sm leading-relaxed text-text-2">{body}</p>
    </div>
  );
}
