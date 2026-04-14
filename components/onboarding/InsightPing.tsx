'use client';

import { useEffect, useState } from 'react';
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
  onExpire: (id: string) => void;
}

export function InsightPing({ ping, onExpire }: InsightPingProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 3600);
    const remove = setTimeout(() => onExpire(ping.id), 4200);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [ping.id, onExpire]);

  return (
    <div
      className={cn(
        'insight-ping-enter flex items-start gap-2 rounded-full border px-3 py-1.5 transition-opacity duration-500',
        TONE_STYLES[ping.tone],
        !visible && 'opacity-0',
      )}
    >
      <Sparkle size={14} weight="fill" className="mt-0.5 shrink-0" />
      <p className="font-body text-xs leading-snug">{ping.text}</p>
    </div>
  );
}
