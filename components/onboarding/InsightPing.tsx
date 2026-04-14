'use client';

import { Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { InsightPing as InsightPingType } from '@/types';

const TONE_STYLES: Record<InsightPingType['tone'], string> = {
  discovery: 'text-violet-200 border-violet-400/40 bg-violet-400/10',
  tension: 'text-accent-rose border-accent-rose/40 bg-accent-rose/10',
  resonance: 'text-accent-emerald border-accent-emerald/40 bg-accent-emerald/10',
};

interface InsightPingProps {
  ping: InsightPingType;
  /**
   * Deprecated. Retained for backward compatibility with existing callers.
   * Insights no longer auto-expire — they persist in a collapsible list
   * inside LiveProfilePanel so the user can re-read them during the
   * onboarding flow (PAIR Feedback + Control heuristic).
   */
  onExpire?: (id: string) => void;
}

export function InsightPing({ ping }: InsightPingProps) {
  return (
    <div
      className={cn(
        'insight-ping-enter flex items-start gap-2 rounded-full border px-3 py-1.5',
        TONE_STYLES[ping.tone],
      )}
    >
      <Sparkle size={14} weight="fill" className="mt-0.5 shrink-0" />
      <p className="font-body text-xs leading-snug">{ping.text}</p>
    </div>
  );
}
