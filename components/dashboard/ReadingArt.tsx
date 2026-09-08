import { SvgArtwork } from '@/components/motion/SvgArtwork';

/** Semantic chapter diagrams, not scores or representations of a reader's mind. */
export function ReadingArt({ chapter = 0 }: { chapter?: number }) {
  return <SvgArtwork className={`chapter-artwork chapter-artwork-${chapter % 5}`}><svg className="reading-art" viewBox="0 0 240 160" fill="none" aria-hidden="true" focusable="false">
    {chapter % 5 === 0 ? <>
      <path className="reading-art-reveal" d="M25 123V29C68 25 100 38 120 53c20-15 52-28 95-24v94c-41-5-73 7-95 22-22-15-54-27-95-22Z" fill="#dedfd4" />
      <path d="M120 53V145M25 29c43-4 75 9 95 24 20-15 52-28 95-24" stroke="currentColor" strokeWidth="2" />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M43 ${51 + i * 16}q32-1 59 15m36 0q27-16 59-15`} stroke="currentColor" strokeWidth="1.5" />)}
    </> : chapter % 5 === 1 ? <>
      <path d="M21 126C78 137 68 41 125 42s54 99 95 42" stroke="currentColor" strokeWidth="2" strokeDasharray="4 7" />
      <path className="reading-art-reveal" d="m125 7 28 71-28-16-28 16Z" fill="currentColor" />
      <circle cx="21" cy="126" r="7" fill="currentColor" /><circle cx="220" cy="84" r="7" stroke="currentColor" strokeWidth="2" />
    </> : chapter % 5 === 2 ? <>
      <path d="M20 113H220M65 36V126M175 36V126M65 50H175" stroke="currentColor" strokeWidth="2" />
      <path className="reading-art-reveal" d="M65 50C75 145 165 145 175 50" stroke="currentColor" strokeWidth="6" />
      <circle cx="120" cy="30" r="14" fill="#dedfd4" /><path d="M30 145H95m50 0h65" stroke="currentColor" />
    </> : chapter % 5 === 3 ? <>
      <path d="M120 145 34 61 67 20H173l33 41Z" fill="#dedfd4" />
      <path className="reading-art-reveal" d="M120 145 34 61 67 20H173l33 41ZM34 61H206M67 20l53 125 53-125M95 61l25-41 25 41" stroke="currentColor" strokeWidth="1.5" />
    </> : <>
      <path d="M23 136H217M62 136V77a58 58 0 0 1 116 0v59M78 136V77a42 42 0 0 1 84 0v59" stroke="currentColor" strokeWidth="2" />
      <path className="reading-art-reveal" d="M119 136V82h42v54Z" fill="#dedfd4" /><path d="M113 106h29m-9-9 9 9-9 9" stroke="currentColor" strokeWidth="2" />
    </>}
  </svg></SvgArtwork>;
}
