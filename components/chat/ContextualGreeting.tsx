import { ARCHETYPE_INFO } from '@/types';
import { JUNG_LABELS, BIG_FIVE_LABELS } from '@/lib/dimensions/labels';
import type { BigFive, JungFunctions } from '@/types';
import type { ChatShellProfile } from './ChatShell';
import {
  quantitativeDimensions,
  RIDGE_V1_STATUS,
} from '@/lib/profile/dimension-display';

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

  const measured = quantitativeDimensions(profile.perDimensionStatus ?? RIDGE_V1_STATUS);
  const topBf = (
    Object.entries(profile.bigFive) as Array<[keyof BigFive, number]>
  )
    .filter(([k]) => measured.includes(k))
    .map(([k, v]) => ({ k, v, delta: Math.abs(v - 50) }))
    .sort((a, b) => b.delta - a.delta)[0] ?? null;
  const topBfLabel = topBf ? BIG_FIVE_LABELS[topBf.k] : null;
  const isHigh = topBf ? topBf.v >= 50 : false;

  return (
    <div className="relative border-b border-violet-400/15 pb-6">
      <p className="font-body text-sm normal-case tracking-normal text-text-3">
        {firstName ? `Hola, ${firstName}` : 'Hola'}
      </p>
      <h2 className="mt-3 text-balance font-heading font-semibold text-2xl not-italic text-text-1 md:text-3xl">
        Tenemos un punto de partida, {archName.toLowerCase()}.
      </h2>
      <p className="mt-3 max-w-xl text-pretty font-body text-sm leading-relaxed text-text-2 md:text-base">
        Tu mente trabaja sobre todo en modo{' '}
        <span className="text-violet-200">{topJung.label.toLowerCase()}</span>{' '}
        — {topJung.short}.{' '}
        {topBf && topBfLabel ? (
          <>
            Y tu{' '}
            <span className="text-violet-200">{topBfLabel.label.toLowerCase()}</span>{' '}
            está {isHigh ? 'arriba' : 'abajo'}: {isHigh ? topBfLabel.highExample : topBfLabel.lowExample}{' '}
          </>
        ) : null}
        ¿Sobre qué querés pensar hoy?
      </p>
    </div>
  );
}
