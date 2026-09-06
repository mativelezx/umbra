'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ChatCircle, Path, DownloadSimple, Gear } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Brand } from './Brand';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Mi resultado', Icon: House },
  { href: '/plan', label: 'Actividades', Icon: Path },
  { href: '/chat', label: 'Chat', Icon: ChatCircle },
  { href: '/export', label: 'Informe', Icon: DownloadSimple },
  { href: '/settings', label: 'Mi cuenta', Icon: Gear },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="hidden lg:flex fixed inset-y-0 left-0 z-20 w-60 flex-col border-r border-violet-400/10 bg-umbra-void"
    >
      <div className="px-6 py-8">
        <Brand href="/dashboard" />
      </div>
      <ul className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-md px-3 py-3 font-heading text-sm transition-colors',
                  active
                    ? 'font-bold text-text-1'
                    : 'text-text-2 hover:text-text-1 hover:bg-violet-400/5',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', active && 'bg-text-1 text-white')}><Icon size={18} weight={active ? 'fill' : 'regular'} /></span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto px-6 py-6">
        <p className="font-body text-sm text-text-4">
          Umbra v0.1 · TFG Siglo 21
        </p>
      </div>
    </nav>
  );
}
