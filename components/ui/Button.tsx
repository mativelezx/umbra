'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-heading font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

const variants: Record<Variant, string> = {
  primary:
    'bg-text-1 text-white hover:bg-neutral-700',
  secondary:
    'bg-white text-text-1 border border-violet-400/30 hover:bg-umbra-shadow',
  ghost: 'text-text-2 hover:text-text-1 hover:bg-violet-400/5',
  danger: 'bg-accent-rose/90 text-white hover:bg-accent-rose',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm min-h-11 px-3',
  md: 'text-sm min-h-12 px-5',
  lg: 'text-base h-12 px-7',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
