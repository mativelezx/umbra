/**
 * cn — lightweight className concatenator.
 *
 * No `clsx` or `tailwind-merge` dependency — accepts strings, arrays,
 * and objects; filters falsy; joins with space.
 */
export function cn(
  ...inputs: Array<string | undefined | null | false | Record<string, boolean> | string[]>
): string {
  const parts: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      parts.push(input);
    } else if (Array.isArray(input)) {
      parts.push(...input.filter(Boolean));
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) parts.push(key);
      }
    }
  }
  return parts.join(' ');
}

/**
 * Use the prototype's Argentina timezone consistently in the app and PDF.
 */
export function formatDateEs(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

/**
 * Count words in a string (for onboarding validation).
 * "Word" is any whitespace-delimited token of length > 0.
 */
export function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
