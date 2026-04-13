import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { TopBar } from './TopBar';

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-60 min-h-screen flex flex-col pb-20 lg:pb-0">
        <TopBar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
      <TabBar />
    </div>
  );
}
