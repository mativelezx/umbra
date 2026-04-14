import { ARCHETYPE_INFO } from '@/types';
import { JUNG_LABELS, BIG_FIVE_LABELS } from '@/lib/dimensions/labels';
import type { BigFive, JungFunctions } from '@/types';
import type { ChatShellProfile } from './ChatShell';

interface ContextualGreetingProps {
  profile: ChatShellProfile;
}

/**
 * Contextual greeting that shows the chat is aware of who the user is.
 * Uses plain-spanish labels only — no Ni/Ti/etc jargon.
 */
export function ContextualGreeting({ profile }: ContextualGreetingProps) {
  const archName = ARCHETYPE_INFO[profile.archetype].name;
  const firstName = profile.firstName ?? null;

  const topJungKey = Object.entries(profile.jungFunctions).sort(
    ([, a], [, b]) => b - a,
  )[0][0] as keyof JungFunctions;
  const topJung = JUNG_LABELS[topJungKey];

  const topBf = (
    Object.entries(profile.bigFive) as Array<[keyof BigFive, number]>
  )
    .map(([k, v]) => ({ k, v, delta: Math.abs(v - 50) }))
    .sort((a, b) => b.delta - a.delta)[0];
  const topBfLabel = BIG_FIVE_LABELS[topBf.k];
  const isHigh = topBf.v >= 50;

  return (
    <div className="relative rounded-lg border border-violet-400/10 bg-umbra-shadow/30 p-6 md:p-7">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-3">
        {firstName ? `Hola, ${firstName}` : 'Hola'}
      </p>
      <h2 className="mt-3 font-display text-2xl italic text-text-1 md:text-3xl">
        Tenemos un punto de partida, {archName.toLowerCase()}.
      </h2>
      <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-text-2 md:text-base">
        Tu mente funciona principalmente en modo{' '}
        <span className="text-violet-200">{topJung.label.toLowerCase()}</span>{' '}
        — {topJung.short}. Y tu{' '}
        <span className="text-violet-200">{topBfLabel.label.toLowerCase()}</span>{' '}
        es {isHigh ? 'alta' : 'baja'}: {isHigh ? topBfLabel.highExample : topBfLabel.lowExample}{' '}
        ¿Desde dónde querés empezar hoy?
      </p>
    </div>
  );
}
