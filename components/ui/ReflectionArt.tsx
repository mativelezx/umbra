import { cn } from '@/lib/utils';

interface ReflectionArtProps {
  variant?: 'mirror' | 'dialogue' | 'pages' | 'steps';
  className?: string;
  reveal?: boolean;
}

/** Original ink-and-paper scenes of writing, reading and taking a small step.
 * Decorative only; controls keep the existing Phosphor icon vocabulary. */
export function ReflectionArt({ variant = 'mirror', className, reveal = false }: ReflectionArtProps) {
  return (
    <div aria-hidden="true" className={cn('reflection-art text-text-1', reveal && 'reflection-reveal', className)}>
      {variant === 'mirror' ? (
        <svg viewBox="0 0 180 200" fill="none" aria-hidden="true" focusable="false" className="h-auto w-full">
          <path d="M45 177c-7-26-4-50 12-65V94c-10-8-15-20-12-34 4-21 26-34 45-25 13 6 16 18 15 31l12 17-13 4v15H88v14c22 12 31 32 29 61H45Z" fill="currentColor" fillOpacity=".13" />
          <path d="M27 181c-3-28 2-47 20-59l8-4v-16c-12-8-19-21-17-37 2-22 21-36 42-30 16 4 23 17 22 34l9 14-11 4v15H84v17c18 8 26 26 28 62H27Z" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M37 71c-8-16-2-38 17-44 21-7 43 5 45 21-9 5-25 3-33-4 4 20-1 36-12 45L37 71ZM54 116l22 15 13-11c22 14 28 34 28 61H22c0-33 9-54 32-65Z" fill="currentColor" />
          <path d="M70 54c-8 1-13 7-13 17m24 4h6m-3 20h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="m108 99 42-9 13 67-43 10-12-68Z" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="m120 112 23-5m-21 15 23-5m-20 15 17-4" stroke="currentColor" strokeWidth="2" />
          <path d="m72 150 25 13 31-20c5-3 11-2 12 2 1 3-4 6-7 8l-29 25c-5 4-11 4-16 1l-30-16" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 182h149" stroke="currentColor" strokeWidth="2" />
        </svg>
      ) : (
        <svg viewBox="0 0 160 160" fill="none" aria-hidden="true" focusable="false" className="h-auto w-full">
          {variant === 'dialogue' && <>
            <path d="M14 56c22-7 43-4 63 7 21-11 43-14 65-7v79c-24-6-46-3-65 9-20-12-41-15-63-9V56Z" fill="currentColor" />
            <path d="M19 48c24-4 42 1 58 12 19-13 39-16 59-12v79c-22-3-41 1-59 12-18-11-38-15-58-12V48Z" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M77 61v75M29 69c12 0 23 3 34 8M29 83c12 0 23 3 34 8M29 97c8 0 16 2 24 5M89 96l29-8m-29 21 22-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="m96 69 33-48 9 6-33 48-13 8 4-14Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="m99 69 6 4m23-46 4 3-27 38m-9 7-3 6" stroke="var(--art-paper, #f7f7f4)" strokeWidth="2" />
            <path d="m73 138 4 12 6-11" fill="currentColor" />
          </>}
          {variant === 'pages' && <>
            <path d="m53 14 78 15-21 111-78-15L53 14Z" fill="currentColor" />
            <path d="M26 27h66l27 27v90H26V27Z" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M92 27v27h27" fill="currentColor" />
            <path d="M40 72h63M40 83h63M40 94h42M40 119h54M40 130h33" stroke="currentColor" strokeWidth="2" />
            <path d="M40 42v13a8 8 0 0 0 16 0V42" stroke="currentColor" strokeWidth="3" />
            <path d="m115 107 19 7-14 36-19-7 14-36Z" fill="currentColor" />
            <path d="m114 120 3 6 9-6" stroke="var(--art-paper, #f7f7f4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>}
          {variant === 'steps' && <>
            <circle cx="123" cy="35" r="18" stroke="currentColor" strokeWidth="2" />
            <path d="M123 17a18 18 0 0 1 0 36V17Z" fill="currentColor" />
            <path d="M10 139c39-17 89-19 136 1M20 149c38-15 78-13 108-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M78 38c8-1 14 4 14 11 0 8-5 13-12 13-7 0-12-5-12-12 0-6 4-11 10-12Z" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="2" />
            <path d="M67 49c-3-11 8-21 19-16 6 3 10 8 8 14l-27 2ZM70 65c8-5 17-1 19 7l9 27-24 8-10-25c-3-7 0-13 6-17Z" fill="currentColor" />
            <path d="m76 76-15 19-15 3m39-24 13 12 14-7" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m77 102-12 23-18 8m44-32 3 18 16 12" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m44 134 10 2m52-2 11-1" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M20 128v-16m0 8-7-6m7 2 7-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>}
        </svg>
      )}
    </div>
  );
}
