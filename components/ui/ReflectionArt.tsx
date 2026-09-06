import { cn } from '@/lib/utils';

interface ReflectionArtProps {
  variant?: 'mirror' | 'dialogue' | 'pages' | 'steps';
  className?: string;
  reveal?: boolean;
}

/** Original Umbra geometry: an aperture, a divided plane and its reflection.
 * Decorative only; controls keep the existing Phosphor icon vocabulary. */
export function ReflectionArt({ variant = 'mirror', className, reveal = false }: ReflectionArtProps) {
  return (
    <div aria-hidden="true" className={cn('reflection-art text-text-1', reveal && 'reflection-reveal', className)}>
      {variant === 'mirror' ? (
        <svg viewBox="0 0 480 540" fill="none" aria-hidden="true" focusable="false" className="h-auto w-full">
          <path d="M74 399V197a148 148 0 0 1 296 0v202" stroke="currentColor" strokeWidth="1.5" />
          <path d="M107 417V196a141 141 0 0 1 282 0v221H107Z" fill="currentColor" />
          <path d="M125 401V196a123 123 0 0 1 246 0v205H125Z" fill="var(--art-paper, #f7f7f4)" />
          <path d="M143 385V199a105 105 0 0 1 210 0v186" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="248" cy="248" r="89" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="1.5" />
          <path d="M248 159a89 89 0 0 1 0 178V159Z" fill="currentColor" />
          <path d="M248 159v178" stroke="currentColor" strokeWidth="1.5" />
          <path d="M125 371h246M32 417h416" stroke="currentColor" strokeWidth="1.5" />
          <path d="M107 432h282l-34 65H141l-34-65Z" fill="currentColor" fillOpacity=".07" />
          <ellipse cx="248" cy="457" rx="89" ry="20" stroke="currentColor" strokeWidth="1.5" />
          <path d="M248 437c49 0 89 9 89 20s-40 20-89 20v-40Z" fill="currentColor" />
          <path d="M139 498h218M161 514h174" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 160 160" fill="none" aria-hidden="true" focusable="false" className="h-auto w-full">
          {variant === 'dialogue' && <>
            <path d="M24 113V68a42 42 0 0 1 84 0v45H24Z" fill="currentColor" />
            <path d="M54 130V84a42 42 0 0 1 84 0v46H54Z" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="2" />
            <path d="M67 117V84a29 29 0 0 1 58 0v33" stroke="currentColor" strokeWidth="2" />
            <path d="M13 139h134" stroke="currentColor" strokeWidth="2" />
          </>}
          {variant === 'pages' && <>
            <path d="M39 20h83v108H39z" fill="currentColor" />
            <path d="M25 34h82v108H25z" fill="var(--art-paper, #f7f7f4)" stroke="currentColor" strokeWidth="2" />
            <circle cx="66" cy="79" r="26" stroke="currentColor" strokeWidth="2" />
            <path d="M66 53a26 26 0 0 1 0 52V53Z" fill="currentColor" />
            <path d="M39 121h54M39 132h35" stroke="currentColor" strokeWidth="2" />
          </>}
          {variant === 'steps' && <>
            <path d="M22 130V99h37V69h37V39h37v91H22Z" fill="currentColor" />
            <path d="M15 142h130M39 87h15M76 57h15M112 26h15" stroke="currentColor" strokeWidth="2" />
            <path d="M37 112h22M74 82h22M111 52h22" stroke="var(--art-paper, #f7f7f4)" strokeWidth="2" />
          </>}
        </svg>
      )}
    </div>
  );
}
