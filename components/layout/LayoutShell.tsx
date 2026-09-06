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
        <main id="main-content" className="flex-1 px-5 py-8 md:px-10 md:py-12 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
      <TabBar />
    </div>
  );
}
