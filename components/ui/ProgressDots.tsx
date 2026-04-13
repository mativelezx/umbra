import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressDots({ current, total, className }: ProgressDotsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              isActive
                ? 'w-8 bg-violet-400 shadow-[0_0_12px_rgba(180,102,255,0.8)]'
                : isDone
                  ? 'w-4 bg-violet-600'
                  : 'w-4 bg-umbra-shadow',
            )}
            aria-label={`Paso ${i + 1} de ${total}`}
            aria-current={isActive ? 'step' : undefined}
          />
        );
      })}
    </div>
  );
}
