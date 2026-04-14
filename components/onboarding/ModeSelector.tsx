'use client';

import { ArrowRight, ChatCircle, Sparkle } from '@phosphor-icons/react';
import { GlassCard } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export type OnboardingEntryMode = 'dynamic' | 'chatgpt-seed';

interface ModeSelectorProps {
  onPick: (mode: OnboardingEntryMode) => void;
}

export function ModeSelector({ onPick }: ModeSelectorProps) {
  return (
    <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16 md:px-10 md:py-24">
      <header className="flex flex-col gap-3 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
          Empezá como prefieras
        </p>
        <h1 className="font-display text-5xl italic text-text-1 md:text-6xl">
          ¿Por dónde te gusta entrar?
        </h1>
        <p className="mx-auto max-w-2xl font-body text-base text-text-2">
          Podés conversar con Umbra desde cero, o traerte un punto de partida
          desde una herramienta que ya te conoce.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ModeCard
          icon={<ChatCircle size={28} weight="duotone" />}
          label="Opción A"
          title="Conversemos"
          description="6 a 8 preguntas adaptativas. Umbra elige la próxima según lo que va descubriendo. Llevá tu tiempo."
          meta="~8 minutos · empezás de cero"
          onClick={() => onPick('dynamic')}
        />
        <ModeCard
          icon={<Sparkle size={28} weight="duotone" />}
          label="Opción B"
          title="Traelo desde ChatGPT"
          description="Si ya venís charlando con ChatGPT, llevá esta lente ahí y pegá la respuesta acá. Umbra arranca con un retrato rico."
          meta="~3 minutos · trae historia previa"
          onClick={() => onPick('chatgpt-seed')}
          accent
        />
      </div>

      <p className="mx-auto max-w-xl text-center font-body text-xs italic text-text-3">
        Las dos rutas llegan al mismo lugar: tu perfil integrado, la narrativa y
        el plan. Elegí la que te resuene más.
      </p>
    </div>
  );
}

interface ModeCardProps {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  meta: string;
  onClick: () => void;
  accent?: boolean;
}

function ModeCard({
  icon,
  label,
  title,
  description,
  meta,
  onClick,
  accent = false,
}: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group text-left transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-umbra-void',
        'rounded-lg',
      )}
    >
      <GlassCard
        className={cn(
          'relative flex h-full flex-col gap-5 p-7 transition-all duration-300',
          'border border-violet-400/10',
          'group-hover:-translate-y-0.5 group-hover:border-violet-400/40',
          accent &&
            'shadow-[0_0_48px_rgba(180,102,255,0.18)] group-hover:shadow-[0_0_64px_rgba(180,102,255,0.28)]',
        )}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            {label}
          </p>
          <span
            className={cn(
              'text-text-3 transition-colors duration-300',
              'group-hover:text-violet-200',
            )}
          >
            {icon}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl italic text-text-1">{title}</h2>
          <p className="font-body text-sm leading-relaxed text-text-2">
            {description}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-3">
            {meta}
          </p>
          <span
            className={cn(
              'flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider',
              'text-text-3 transition-colors duration-300',
              'group-hover:text-violet-200',
            )}
          >
            Elegir
            <ArrowRight
              size={14}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </GlassCard>
    </button>
  );
}
