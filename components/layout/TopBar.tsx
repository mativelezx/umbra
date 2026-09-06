'use client';

import Link from 'next/link';
import { SignOut, UserCircle } from '@phosphor-icons/react';
import { useAuth } from '@/lib/providers/auth-context';
import { Brand } from './Brand';

export function TopBar() {
  const { user, signOut } = useAuth();
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  return <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">Ir al contenido</a>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-400/15 px-5 py-4 md:px-10">
      <div className="lg:hidden"><Brand href="/dashboard" /></div>
      <p className="hidden text-sm text-text-3 lg:block">Tu espacio de reflexión</p>
      <div className="flex items-center gap-2">
        <Link href="/settings/profile" className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm hover:bg-umbra-shadow"><UserCircle size={22} /><span>Mi cuenta</span></Link>
        {user && <button onClick={() => signOut()} aria-label="Cerrar sesión" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-umbra-shadow"><SignOut size={20} /></button>}
      </div>
    </header>
    {isDemo && <div role="status" className="border-b border-violet-400/15 bg-umbra-fog px-5 py-3 text-sm leading-relaxed text-text-2 md:px-10">Ejemplo local con datos ficticios. No representa un análisis real ni guarda cambios en tu cuenta.</div>}
  </>;
}
