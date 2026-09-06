'use client';

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { wordCount } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  minWords?: number;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, minWords, showCount, className, id, value, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const count = typeof value === 'string' ? wordCount(value) : 0;
  const meetsMin = minWords === undefined || count >= minWords;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="font-heading text-sm font-medium text-text-2"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        className={cn(
          'w-full rounded-md bg-umbra-shadow/50 border border-violet-400/20 px-4 py-3 font-body text-text-1 placeholder:text-text-3 min-h-[160px]',
          'focus:outline-none focus:border-violet-400 focus:bg-umbra-mist/30 transition-colors resize-y',
          error && 'border-accent-rose/60 focus:border-accent-rose',
          className,
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      <div className="flex items-center justify-between">
        {error ? (
          <p id={`${textareaId}-error`} className="font-body text-xs text-accent-rose">
            {error}
          </p>
        ) : (
          <span />
        )}
        {showCount && (
          <span
            className={cn(
              'font-body text-xs',
              meetsMin ? 'text-accent-emerald' : 'text-text-3',
            )}
          >
            {count} {minWords !== undefined && `/ ${minWords}`} palabras
          </span>
        )}
      </div>
    </div>
  );
});
