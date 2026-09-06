import type { MessageRole } from '@/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  streaming?: boolean;
}

export function MessageBubble({ role, content, streaming = false }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-5 py-3.5',
          isUser
            ? 'bg-text-1 text-white rounded-br-sm'
            : 'bg-umbra-fog text-text-1 rounded-bl-sm',
        )}
      >
        <p className="whitespace-pre-wrap font-body text-sm leading-relaxed md:text-base">
          {content}
          {streaming && (
            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-violet-400 align-middle" />
          )}
        </p>
      </div>
    </div>
  );
}
