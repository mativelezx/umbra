'use client';

import { cn } from '@/lib/utils';

interface DimensionBarProps {
  label: string;
  value: number;
  maxValue?: number;
  emphasized?: boolean;
  className?: string;
}

export function DimensionBar({
  label,
  value,
  maxValue = 100,
  emphasized = false,
  className,
}: DimensionBarProps) {
  const percent = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'font-heading text-sm',
            emphasized ? 'text-violet-300 font-semibold' : 'text-text-2',
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            'font-mono text-xs tabular-nums',
            emphasized ? 'text-violet-300' : 'text-text-3',
          )}
        >
          {value}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-umbra-shadow/60">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            emphasized
              ? 'bg-gradient-to-r from-violet-500 to-violet-300 shadow-[0_0_16px_rgba(180,102,255,0.5)]'
              : 'bg-gradient-to-r from-violet-600 to-violet-400',
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={label}
        />
      </div>
    </div>
  );
}
