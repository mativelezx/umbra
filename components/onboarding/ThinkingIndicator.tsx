'use client';

import { GlassCard } from '@/components/ui/Card';

export function ThinkingIndicator() {
  return (
    <GlassCard className="onboarding-card-enter p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 font-body text-sm normal-case tracking-normal text-text-3">
          <span>Pensando</span>
          <span className="flex items-center gap-1">
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-violet-300" />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-violet-300" />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-violet-300" />
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="skeleton-line h-8 w-3/4 rounded-md" />
          <div className="skeleton-line h-4 w-full rounded-md" />
          <div className="skeleton-line h-4 w-5/6 rounded-md" />
        </div>
      </div>
    </GlassCard>
  );
}
