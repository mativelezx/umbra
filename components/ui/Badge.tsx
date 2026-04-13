import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'violet' | 'indigo' | 'emerald' | 'rose';

const variants: Record<Variant, string> = {
  default: 'bg-umbra-shadow/50 text-text-2 border border-violet-400/10',
  violet: 'bg-violet-400/10 text-violet-200 border border-violet-400/30',
  indigo: 'bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/30',
  emerald: 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30',
  rose: 'bg-accent-rose/10 text-accent-rose border border-accent-rose/30',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 font-heading text-xs',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
