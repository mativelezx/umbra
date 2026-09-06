'use client';

import { useState, useEffect, useId, useRef } from 'react';
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mt-1 font-heading font-semibold text-2xl not-italic text-text-1 md:text-3xl">
            Explorá otros arquetipos
          </h2>
        </div>
        <p className="max-w-xs font-body text-sm text-text-3">
          Son figuras simbólicas. Tocá una para leer sus diferencias, sin compararte con otras personas.
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
          ? 'border-violet-400/50 bg-violet-400/10  hover:-translate-y-0.5'
          : 'border-violet-400/10 bg-white hover:border-violet-400/30',
      )}
    >
      {isUser && (
        <span className="absolute right-3 top-3 font-body text-sm normal-case tracking-normal text-violet-200">
          Tu lectura
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
          'font-heading font-semibold text-xl not-italic',
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Native modal top layer provides focus containment and makes the
    // background inert. Explicit focus keeps the opening action predictable.
    dialog?.showModal();
    closeRef.current?.focus();
    return () => {
      dialog?.close();
      trigger?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-violet-400/30 bg-white p-0 text-text-1 backdrop:bg-text-1/30 md:inset-0 md:m-auto md:rounded-2xl"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-text-3 transition-colors hover:bg-violet-400/10 hover:text-violet-200"
          aria-label="Cerrar comparación"
        >
          <X size={18} weight="bold" />
        </button>

        <div className="flex flex-col gap-6 p-7 md:p-10">
          <header className="flex flex-col gap-2 pr-10">
            <p className="font-body text-sm normal-case tracking-normal text-text-3">
              {isSelf ? 'Arquetipo de tu lectura' : `${userInfo.name} y ${otherInfo.name}`}
            </p>
            <h2 id={titleId} className="font-heading font-semibold text-3xl not-italic text-text-1 md:text-4xl">
              {otherInfo.name}
            </h2>
            <p className="font-body text-sm not-italic text-violet-200">
              {otherCompare.motto}
            </p>
          </header>

          <DrawerRow label="Qué lo mueve" body={otherCompare.drivenBy} />
          <DrawerRow label="En el día a día" body={otherCompare.everyday} />
          <DrawerRow label="Su mayor fuerza" body={otherCompare.strength} />
          <DrawerRow label="Su sombra" body={otherCompare.shadow} />

          <div className="rounded-lg border border-violet-400/30 bg-violet-400/5 p-5">
            <p className="font-body text-sm normal-case tracking-normal text-violet-200">
              {isSelf ? 'Vos mismo' : `Frente a ${userInfo.name}`}
            </p>
            <p className="mt-2 font-heading font-semibold text-lg not-italic leading-snug text-text-1 md:text-xl">
              {vsYou}
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function DrawerRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-body text-sm normal-case tracking-normal text-text-3">
        {label}
      </p>
      <p className="font-body text-sm leading-relaxed text-text-2">{body}</p>
    </div>
  );
}
