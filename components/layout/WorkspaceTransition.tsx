'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function WorkspaceTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className="workspace-transition">{children}</div>;
}
