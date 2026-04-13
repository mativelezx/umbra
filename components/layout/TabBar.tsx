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

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación móvil"
      className="lg:hidden fixed inset-x-0 bottom-0 z-20 border-t border-violet-400/10 bg-umbra-abyss/80 backdrop-blur-xl"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-3 transition-colors',
                  active ? 'text-violet-300' : 'text-text-3 hover:text-text-2',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={22} weight={active ? 'fill' : 'regular'} />
                <span className="font-heading text-[10px] uppercase tracking-wider">
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
