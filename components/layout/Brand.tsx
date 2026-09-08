import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { BrandWordmark } from './BrandWordmark';

export function Brand({ href = '/' }: { href?: string }) {
  return <Link href={href} aria-label="Umbra, inicio" className="brand-link inline-flex min-h-11 items-center gap-3">
    <BrandMark />
    <BrandWordmark />
  </Link>;
}
