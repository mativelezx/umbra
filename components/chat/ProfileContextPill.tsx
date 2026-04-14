import { Sparkle } from '@phosphor-icons/react/dist/ssr';
import { ARCHETYPE_INFO } from '@/types';
import { JUNG_LABELS, BIG_FIVE_LABELS } from '@/lib/dimensions/labels';
import type { ChatShellProfile } from './ChatShell';

interface ProfileContextPillProps {
  profile: ChatShellProfile;
}

/**
 * Compact row showing what Umbra already knows about the user. Uses
 * plain-spanish labels — NO raw Jung codes. The backend still sees
 * the technical data, but the user just sees friendly labels.
 */
export function ProfileContextPill({ profile }: ProfileContextPillProps) {
  const archName = ARCHETYPE_INFO[profile.archetype].name;

  // Top Jung function by value — use plain label
  const topJungKey = Object.entries(profile.jungFunctions).sort(
    ([, a], [, b]) => b - a,
  )[0][0] as keyof typeof profile.jungFunctions;
  const topJungLabel = JUNG_LABELS[topJungKey].label;

  // Biggest Big Five deviation from 50
  const topBf = (
    Object.entries(profile.bigFive) as Array<
      [keyof typeof profile.bigFive, number]
    >
  )
    .map(([k, v]) => ({ k, v, delta: Math.abs(v - 50) }))
    .sort((a, b) => b.delta - a.delta)[0];
  const topBfLabel = BIG_FIVE_LABELS[topBf.k].label;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-violet-400/15 bg-umbra-shadow/40 px-4 py-3">
      <Sparkle size={14} weight="duotone" className="text-violet-300" />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
        Umbra ya sabe de vos:
      </span>
      <span className="font-heading text-xs text-violet-200">{archName}</span>
      <span className="text-text-4">·</span>
      <span className="font-body text-[11px] text-text-2">
        mente {topJungLabel.toLowerCase()}
      </span>
      <span className="text-text-4">·</span>
      <span className="font-body text-[11px] text-text-2">
        {topBfLabel.toLowerCase()} marcada
      </span>
    </div>
  );
}
