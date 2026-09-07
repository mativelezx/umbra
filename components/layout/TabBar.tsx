'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ChatCircle, Path, DownloadSimple } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Mi resultado', Icon: House },
  { href: '/plan', label: 'Actividades', Icon: Path },
  { href: '/chat', label: 'Chat', Icon: ChatCircle },
  { href: '/export', label: 'Informe', Icon: DownloadSimple },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación móvil"
      className="workspace-tabbar"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-3 transition-colors',
                  active ? 'is-active' : '',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="flex h-7 w-10 items-center justify-center rounded-full"><Icon size={22} weight={active ? 'fill' : 'regular'} /></span>
                <span className="font-heading text-xs">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
