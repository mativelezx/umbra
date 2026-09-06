import Link from 'next/link';

export function Brand({ href = '/' }: { href?: string }) {
  return <Link href={href} aria-label="Umbra, inicio" className="inline-flex min-h-11 items-center gap-3 text-2xl font-semibold tracking-tight">
    <svg width="30" height="34" viewBox="0 0 30 34" fill="none" aria-hidden="true">
      <path d="M4 3V19C4 25.075 8.925 30 15 30C21.075 30 26 25.075 26 19V3" stroke="currentColor" strokeWidth="5" />
      <path d="M15 3V18" stroke="currentColor" strokeWidth="5" opacity=".3" />
    </svg>
    umbra
  </Link>;
}
