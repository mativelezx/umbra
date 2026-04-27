'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';

interface LandingRevealProps {
  children: ReactNode;
  delay?: number;
  as?: 'div' | 'li' | 'ul' | 'ol' | 'section' | 'article';
  className?: string;
}

const container = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.08,
      delayChildren: delay,
    },
  }),
};

const item = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, duration: 0.6, bounce: 0 },
  },
};

export function LandingReveal({
  children,
  delay = 0,
  as = 'div',
  className,
}: LandingRevealProps) {
  // Animate on mount + on intersection. We start with whileInView for nice
  // scroll-driven reveals; if intersection never fires (e.g. element starts
  // visible above the fold) the initial mount animation still kicks in via
  // useEffect-style transition handled by framer-motion.
  const props = {
    className,
    initial: 'hidden' as const,
    animate: 'visible' as const,
    variants: container,
    custom: delay,
  };

  if (as === 'li') return <m.li {...props}>{children}</m.li>;
  if (as === 'ul') return <m.ul {...props}>{children}</m.ul>;
  if (as === 'ol') return <m.ol {...props}>{children}</m.ol>;
  if (as === 'section') return <m.section {...props}>{children}</m.section>;
  if (as === 'article') return <m.article {...props}>{children}</m.article>;
  return <m.div {...props}>{children}</m.div>;
}

export function LandingItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={item}>
      {children}
    </m.div>
  );
}
