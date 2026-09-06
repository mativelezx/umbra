'use client';

import type { InsightPing as InsightPingType, WorkingProfile } from '@/types';
import { InsightPing } from './InsightPing';

interface LiveProfilePanelProps {
  workingProfile: WorkingProfile | null;
  insights: InsightPingType[];
  turnNumber: number;
  maxTurns: number;
  onExpireInsight?: (id: string) => void;
}

export function LiveProfilePanel({ insights }: LiveProfilePanelProps) {
  return <aside className="space-y-6">
    <p className="text-sm leading-relaxed text-text-3">Durante la conversación pueden aparecer ideas provisorias de IA. El resultado experimental se presenta al terminar.</p>
    {insights.length > 0 && <details className="border-t border-violet-400/20 pt-4"><summary className="cursor-pointer py-2 text-sm font-medium">Ver ideas de la conversación ({insights.length})</summary><div className="mt-4 space-y-3">{insights.map(ping => <InsightPing key={ping.id} ping={ping} />)}</div></details>}
  </aside>;
}

export type { LiveProfilePanelProps };
