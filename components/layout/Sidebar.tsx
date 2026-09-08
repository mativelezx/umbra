'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ChatCircle, Path, DownloadSimple, Gear } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Brand } from './Brand';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Mi resultado', description: 'Leé y explorá tu devolución', Icon: House },
  { href: '/plan', label: 'Actividades', description: 'Elegí un paso para probar', Icon: Path },
  { href: '/chat', label: 'Chat', description: 'Conversá sobre tu lectura', Icon: ChatCircle },
  { href: '/export', label: 'Informe', description: 'Llevate tu perfil en PDF', Icon: DownloadSimple },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="workspace-sidebar"
    >
      <div className="px-6 py-9">
        <Brand href="/dashboard" />
      </div>
      <ul className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, description, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'workspace-nav-item',
                  active
                    ? 'is-active'
                    : '',
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                aria-describedby={`nav-help-${href.slice(1)}`}
              >
                <Icon size={24} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                <span><strong>{label}</strong><span id={`nav-help-${href.slice(1)}`} className="workspace-nav-description">{description}</span></span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto px-6 py-6">
        <Link href="/settings" className="workspace-account" aria-current={pathname.startsWith('/settings') ? 'page' : undefined}><Gear size={22} /> Mi cuenta</Link>
        <p className="mt-6 text-xs">De lo que contás<br />a lo que podés hacer.</p>
      </div>
    </nav>
  );
}
