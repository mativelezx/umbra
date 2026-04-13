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
  'inline-flex items-center justify-center gap-2 rounded-md font-heading font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-umbra-void';

const variants: Record<Variant, string> = {
  primary:
    'bg-violet-400 text-umbra-void hover:bg-violet-300 shadow-glow hover:shadow-[0_0_80px_rgba(180,102,255,0.2)]',
  secondary:
    'glass text-text-1 hover:text-white border border-violet-400/20 hover:border-violet-400/40',
  ghost: 'text-text-2 hover:text-text-1 hover:bg-violet-400/5',
  danger: 'bg-accent-rose/90 text-white hover:bg-accent-rose',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs h-8 px-3',
  md: 'text-sm h-10 px-5',
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
