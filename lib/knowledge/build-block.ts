/**
 * Shared knowledge block helper used by all 4 KB files.
 *
 * Every KB helper should use this so that:
 * 1. Formatting is consistent across the 4 knowledge blocks
 * 2. Empty items (containing the sentinel COMPLETAR marker) are gracefully skipped
 * 3. The prompt degrades gracefully when KB research is incomplete
 *
 * See docs/PROMPT_ARCHITECTURE.md and docs/DECISIONS.md ADR-018.
 */

const COMPLETAR_SENTINEL = '/' + '* COMPLETAR *' + '/';

export interface KnowledgeBlockOptions<T> {
  items: readonly T[];
  render: (item: T) => string;
  separator?: string;
  skipIf?: (item: T) => boolean;
}

const DEFAULT_SEPARATOR = '\n\n---\n\n';

const DEFAULT_SKIP_IF = <T>(item: T): boolean => {
  try {
    return JSON.stringify(item).includes(COMPLETAR_SENTINEL);
  } catch {
    return false;
  }
};

export function buildKnowledgeBlock<T>(opts: KnowledgeBlockOptions<T>): string {
  const { items, render, separator = DEFAULT_SEPARATOR, skipIf = DEFAULT_SKIP_IF } = opts;

  const rendered = items
    .filter((item) => !skipIf(item))
    .map((item) => {
      try {
        return render(item);
      } catch {
        return null;
      }
    })
    .filter((s): s is string => s !== null && s.trim().length > 0);

  return rendered.join(separator);
}
