/**
 * Single source of truth for the 5 narrative sections produced by
 * `lib/prompts/generate-narrative.ts`. Used by:
 *
 *   - `components/dashboard/SectionedNarrative.tsx` to emit section IDs
 *     (anchor targets for the TOC) and match iconography by keyword.
 *   - `components/dashboard/NarrativeTOC.tsx` to render sticky anchor
 *     links with scroll-spy.
 *
 * Keep this list in sync with the 5 `## Heading` lines that the narrative
 * prompt enforces. If the prompt changes, update this file AND the match
 * regexes so legacy narratives still resolve.
 */

export interface NarrativeSectionSpec {
  /** Slug used for the DOM id and TOC anchor. */
  slug: string;
  /** Canonical label (matches the prompt exactly). */
  label: string;
  /**
   * Regex to recognize a section header in the streamed markdown. Allows
   * small wording drift without breaking the parser.
   */
  match: RegExp;
}

export const NARRATIVE_SECTIONS: NarrativeSectionSpec[] = [
  {
    slug: 'apertura',
    label: 'Apertura',
    match: /apertura/i,
  },
  {
    slug: 'como-te-moves',
    label: 'Cómo te movés por el mundo',
    match: /cómo te mov|como te mov|movés|movemiento|movimient/i,
  },
  {
    slug: 'lo-que-te-cuesta',
    label: 'Lo que te cuesta',
    match: /cuesta|tens|sombra/i,
  },
  {
    slug: 'lo-que-te-mueve',
    label: 'Lo que te mueve',
    match: /mueve|arquet|valores/i,
  },
  {
    slug: 'lo-que-queda',
    label: 'Lo que queda por explorar',
    match: /explorar|camino|queda/i,
  },
];

/**
 * Resolve a heading string back to its canonical slug. Used by the
 * SectionedNarrative parser so each rendered section gets a stable DOM
 * id that the TOC can target. Falls back to a slugified version of the
 * raw heading when no spec matches.
 */
export function slugFromHeading(heading: string): string {
  for (const spec of NARRATIVE_SECTIONS) {
    if (spec.match.test(heading)) return spec.slug;
  }
  return heading
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
