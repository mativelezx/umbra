import { cn } from '@/lib/utils';

export function LoadingDimension({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-umbra-shadow/80" />
        <div className="h-4 w-8 animate-pulse rounded bg-umbra-shadow/80" />
      </div>
      <div className="h-2 w-full animate-pulse rounded-full bg-umbra-shadow/80" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-umbra-shadow/80', className)}
      aria-hidden="true"
    />
  );
}
