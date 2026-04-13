'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="font-heading text-xs uppercase tracking-wider text-text-3"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-md bg-umbra-shadow/50 border border-violet-400/20 px-4 py-3 font-body text-text-1 placeholder:text-text-3',
          'focus:outline-none focus:border-violet-400 focus:bg-umbra-mist/30 transition-colors',
          error && 'border-accent-rose/60 focus:border-accent-rose',
          className,
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="font-body text-xs text-accent-rose">
          {error}
        </p>
      )}
    </div>
  );
});
