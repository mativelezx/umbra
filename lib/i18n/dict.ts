import esAR from '@/messages/es-AR.json';
import en from '@/messages/en.json';

export type Locale = 'es-AR' | 'en';

export const DEFAULT_LOCALE: Locale = 'es-AR';

const DICTS: Record<Locale, typeof esAR> = {
  'es-AR': esAR,
  en: en,
};

/**
 * Get a translation dictionary for a locale. Used in server + client.
 * For i18n-ready without i18n-enforcement — v1 ships ES only, the EN
 * dictionary is a stub ready for v1.5.
 */
export function getDict(locale: Locale = DEFAULT_LOCALE): typeof esAR {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}

/**
 * Simple template substitution: `t('chat.rate_limited', { count: 5 })`
 */
export function t(
  path: string,
  params: Record<string, string | number> = {},
  locale: Locale = DEFAULT_LOCALE,
): string {
  const dict = getDict(locale);
  const parts = path.split('.');
  let current: unknown = dict;
  for (const p of parts) {
    if (current && typeof current === 'object' && p in current) {
      current = (current as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  if (typeof current !== 'string') return path;

  return current.replace(/\{(\w+)\}/g, (_m, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}
