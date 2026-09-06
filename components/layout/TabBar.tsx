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
      className="lg:hidden fixed inset-x-0 bottom-0 z-20 border-t border-violet-400/10 bg-umbra-abyss/80 "
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
                  active ? 'bg-umbra-shadow font-semibold text-text-1' : 'text-text-3 hover:text-text-2',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={22} weight={active ? 'fill' : 'regular'} />
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
