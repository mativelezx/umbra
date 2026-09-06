'use client';

import { cn } from '@/lib/utils';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface DimensionInfo {
  title: string;
  body: string;
  example?: string;
}

interface DimensionBarProps {
  label: string;
  value: number;
  maxValue?: number;
  emphasized?: boolean;
  className?: string;
  /**
   * Optional InfoPopover content. When provided, a small "?" button is
   * rendered next to the label that reveals a plain-spanish explanation
   * of the dimension. Core PAIR Explainability heuristic — every
   * technical term on screen should be one click from a friendly
   * explanation.
   */
  info?: DimensionInfo;
}

export function DimensionBar({
  label,
  value,
  maxValue = 100,
  emphasized = false,
  className,
  info,
}: DimensionBarProps) {
  const percent = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'font-heading text-sm',
              emphasized ? 'text-violet-300 font-semibold' : 'text-text-2',
            )}
          >
            {label}
          </span>
          {info && <InfoPopover {...info} />}
        </div>
        <span
          className={cn(
            'font-body text-xs tabular-nums',
            emphasized ? 'text-violet-300' : 'text-text-3',
          )}
        >
          {value}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-umbra-shadow/60">
        <div
          className="h-full rounded-full bg-violet-400 transition-all duration-200 ease-out"
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
