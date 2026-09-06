import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        'card-lift rounded-lg p-6',
        glow ? 'card-glow' : 'bg-white',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl bg-white p-6 md:p-8', className)}>{children}</div>;
}
