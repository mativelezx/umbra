'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ChatCircle, Path, DownloadSimple, Gear } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: House },
  { href: '/chat', label: 'Chat', Icon: ChatCircle },
  { href: '/plan', label: 'Plan', Icon: Path },
  { href: '/export', label: 'Export', Icon: DownloadSimple },
  { href: '/settings/profile', label: 'Settings', Icon: Gear },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="hidden lg:flex fixed inset-y-0 left-0 z-20 w-60 flex-col border-r border-violet-400/10 bg-umbra-abyss/40 backdrop-blur-xl"
    >
      <div className="px-6 py-8">
        <Link href="/dashboard" className="font-display text-3xl text-text-1">
          Umbra
        </Link>
      </div>
      <ul className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm transition-colors',
                  active
                    ? 'bg-violet-400/10 text-violet-200 shadow-[inset_2px_0_0_rgb(180,102,255)]'
                    : 'text-text-2 hover:text-text-1 hover:bg-violet-400/5',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} weight={active ? 'fill' : 'regular'} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto px-6 py-6">
        <p className="font-mono text-[10px] text-text-4">
          Umbra v0.1 · TFG Siglo 21
        </p>
      </div>
    </nav>
  );
}
