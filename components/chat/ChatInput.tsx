'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Escribí tu reflexión...' }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="glass sticky bottom-20 lg:bottom-6 flex items-end gap-2 rounded-2xl p-3"
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        maxLength={2000}
        className="flex-1 resize-none bg-transparent font-body text-text-1 placeholder:text-text-3 focus:outline-none text-sm md:text-base max-h-40"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all',
          disabled || !value.trim()
            ? 'bg-umbra-shadow text-text-4 cursor-not-allowed'
            : 'bg-violet-400 text-umbra-void hover:bg-violet-300 shadow-[0_0_20px_rgba(180,102,255,0.4)]',
        )}
        aria-label="Enviar mensaje"
      >
        <ArrowUp size={18} weight="bold" />
      </button>
    </form>
  );
}
