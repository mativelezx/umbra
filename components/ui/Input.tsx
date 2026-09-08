'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="font-heading text-sm font-medium text-text-2"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-md border border-text-3 bg-umbra-shadow/50 px-4 py-3 font-body text-text-1 placeholder:text-text-3',
          'transition-[border-color,background-color] duration-150 ease-out focus:border-text-1 focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-1',
          error && 'border-accent-rose/60 focus:border-accent-rose',
          className,
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-pretty font-body text-xs leading-relaxed text-text-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-pretty font-body text-xs text-accent-rose">
          {error}
        </p>
      )}
    </div>
  );
});
