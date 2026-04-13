'use client';

import { SignOut, User as UserIcon } from '@phosphor-icons/react';
import { useAuth } from '@/lib/providers/auth-context';

export function TopBar() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const initials = (user.user_metadata?.full_name ?? user.email ?? '?')
    .split(' ')
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-violet-400/10 bg-umbra-abyss/60 px-6 py-4 backdrop-blur-xl lg:pl-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-400/10 font-heading text-xs text-violet-300">
          {initials}
        </div>
        <div className="hidden md:block">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-4">
            Tu viaje
          </div>
          <div className="font-heading text-sm text-text-2">
            {user.user_metadata?.full_name ?? user.email}
          </div>
        </div>
      </div>
      <button
        onClick={() => signOut()}
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-heading text-xs text-text-3 transition-colors hover:bg-violet-400/5 hover:text-text-1"
      >
        <SignOut size={16} />
        Cerrar sesión
      </button>
    </header>
  );
}
