'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SignOut, UserCircle, LockSimple } from '@phosphor-icons/react';
import { useAuth } from '@/lib/providers/auth-context';
import { Brand } from './Brand';

export function TopBar() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  async function leaveAccount() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      await signOut();
      // A full navigation discards private React state and cached route content.
      window.location.replace('/login');
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }
  return <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">Ir al contenido</a>
    <header className="workspace-bar">
      <div className="lg:hidden"><Brand href="/dashboard" /></div>
      <p className="workspace-context hidden text-sm lg:flex"><LockSimple size={16} aria-hidden="true" /> Tu espacio de reflexión</p>
      <div className="flex items-center gap-2">
        <Link href="/settings" className="workspace-account lg:hidden"><UserCircle size={24} /><span>Mi cuenta</span></Link>
        {user && <button onClick={() => void leaveAccount()} disabled={signingOut} aria-label="Cerrar sesión" className="workspace-account"><SignOut size={20} /></button>}
      </div>
    </header>
    {signOutError && <p role="alert" className="px-6 py-3 text-sm text-accent-rose">No pudimos cerrar la sesión. Comprobá la conexión y volvé a intentar.</p>}
    {isDemo && <div role="status" className="workspace-demo">Ejemplo local · datos ficticios, sin análisis real ni guardado.</div>}
  </>;
}
