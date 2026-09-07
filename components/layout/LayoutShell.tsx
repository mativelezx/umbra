import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { TopBar } from './TopBar';
import { WorkspaceTransition } from './WorkspaceTransition';

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="workspace">
      <Sidebar />
      <div className="workspace-body">
        <TopBar />
        <main id="main-content" className="app-content workspace-content">
          <WorkspaceTransition>{children}</WorkspaceTransition>
        </main>
      </div>
      <TabBar />
    </div>
  );
}
