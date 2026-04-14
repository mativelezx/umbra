'use client';

import { useEffect, useState } from 'react';
import { NARRATIVE_SECTIONS } from '@/lib/dimensions/narrative-sections';

/**
 * Sticky table of contents for the narrative — the 5 section anchors
 * rendered on the left margin at `lg:` breakpoint. Uses IntersectionObserver
 * to scroll-spy and highlight the section currently in view.
 *
 * Hidden on mobile and tablet (the narrative is linear there — a TOC would
 * crowd the scroll). Appears on large screens where the Dashboard has the
 * horizontal room for a sidebar.
 *
 * Intentionally simple: the 5 sections are fixed by the narrative prompt,
 * so the component doesn't need to parse the content itself — it just
 * mirrors `NARRATIVE_SECTIONS` and spies on the matching DOM ids that
 * SectionedNarrative renders.
 */
export function NarrativeTOC() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const slugs = NARRATIVE_SECTIONS.map((s) => s.slug);
    const elements = slugs
      .map((slug) => document.getElementById(slug))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that is
        // currently intersecting. If none are intersecting (gap between
        // sections), fall back to the last one we saw.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first && first.target instanceof HTMLElement) {
          setActiveSlug(first.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Secciones de la narrativa"
      className="sticky top-24 hidden h-fit flex-col gap-2 lg:flex"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-3">
        Tu narrativa
      </p>
      <ul className="flex flex-col gap-1 border-l border-violet-400/15">
        {NARRATIVE_SECTIONS.map((section) => {
          const isActive = activeSlug === section.slug;
          return (
            <li key={section.slug}>
              <a
                href={`#${section.slug}`}
                className={`block border-l-2 pl-3 py-1.5 font-body text-xs leading-tight transition-all duration-200 ${
                  isActive
                    ? 'border-violet-400 text-text-1'
                    : 'border-transparent text-text-3 hover:border-violet-400/30 hover:text-text-2'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
