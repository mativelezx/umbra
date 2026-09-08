'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BrandMark } from './BrandMark';
import { BrandWordmark } from './BrandWordmark';
import { useWorkspaceEntrance } from '@/components/motion/MotionProvider';

export function WorkspaceTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const workspaceEntered = useWorkspaceEntrance();
  const ref = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useEffect(() => { setPortal(document.body); }, []);

  useEffect(() => {
    const node = ref.current;
    const overlay = overlayRef.current;
    if (!node || !overlay || typeof window.matchMedia !== 'function') return;
    // Only the first entrance may cover the viewport. Internal tabs and page
    // remounts share this ref; reduced motion also consumes the entrance.
    if (!workspaceEntered || workspaceEntered.current) return;
    workspaceEntered.current = true;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations: Animation[] = [];

    const cancel = () => {
      node.dataset.workspaceMotion = 'quiet';
      overlay.dataset.transitionState = 'quiet';
      animations.forEach(animation => animation.cancel());
      animations.length = 0;
    };
    const onPreference = () => { if (preference.matches) cancel(); };
    const onVisibility = () => { if (document.visibilityState !== 'visible') cancel(); };

    // The portal covers the viewport without remounting the page or navigation.
    // Any deliberate interaction dismisses it immediately; no timers or requests.
    if (!preference.matches && !window.matchMedia('print').matches
      && document.visibilityState === 'visible' && !node.contains(document.activeElement)
      && typeof overlay.animate === 'function') {
      node.dataset.workspaceMotion = 'ready';
      overlay.dataset.transitionState = 'active';
      try {
        const entrance = overlay.animate([
          { opacity: 0, offset: 0 }, { opacity: 1, offset: .14 },
          { opacity: 1, offset: .54 }, { opacity: 0, offset: 1 },
        ], { duration: 1240, easing: 'ease-in-out', iterations: 1, fill: 'none' });
        animations.push(entrance);
        const mark = overlay.querySelector('.brand-mark');
        const wordmark = overlay.querySelector('.brand-wordmark');
        if (typeof mark?.animate === 'function') animations.push(mark.animate([{ transform: 'rotate(-32deg) scale(.8)' }, { transform: 'rotate(0) scale(1)' }], { duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)' }));
        if (typeof wordmark?.animate === 'function') animations.push(wordmark.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' }));
        entrance.onfinish = cancel;
      }
      catch { cancel(); } // Unsupported animation APIs must never block a page.
    }

    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeprint', cancel);
    node.addEventListener('focusin', cancel);
    document.addEventListener('pointerdown', cancel, true);
    document.addEventListener('keydown', cancel, true);
    return () => {
      cancel();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeprint', cancel);
      node.removeEventListener('focusin', cancel);
      document.removeEventListener('pointerdown', cancel, true);
      document.removeEventListener('keydown', cancel, true);
    };
  }, [pathname, portal, workspaceEntered]);

  return <><div ref={ref} className="workspace-transition" data-workspace-motion="quiet">{children}</div>{portal && createPortal(<div ref={overlayRef} className="workspace-brand-transition" data-transition-state="quiet" aria-hidden="true"><div className="workspace-transition-brand"><BrandMark /><BrandWordmark /></div></div>, portal)}</>;
}
