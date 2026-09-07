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
    <header className="workspace-bar">
      <div className="lg:hidden"><Brand href="/dashboard" /></div>
      <p className="hidden text-sm lg:block">Tu espacio de reflexión</p>
      <div className="flex items-center gap-2">
        <Link href="/settings" className="workspace-account lg:hidden"><UserCircle size={24} /><span>Mi cuenta</span></Link>
        {user && <button onClick={() => signOut()} aria-label="Cerrar sesión" className="workspace-account"><SignOut size={20} /></button>}
      </div>
    </header>
    {isDemo && <div role="status" className="workspace-demo">Ejemplo local · datos ficticios, sin análisis real ni guardado.</div>}
  </>;
}
