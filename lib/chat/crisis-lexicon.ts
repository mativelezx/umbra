/**
 * Crisis lexicon for Umbra chat safety pipeline.
 *
 * Sources:
 * - Centro de Asistencia al Suicida (Argentina) public materials
 * - DSM-5 suicidal ideation markers adapted to Spanish
 * - LIWC Spanish clinical corpus (paraphrased patterns)
 *
 * Versioned: bump LEXICON_VERSION when patterns change.
 * Tested by lib/chat/crisis-lexicon.test.ts.
 */

export const LEXICON_VERSION = '1.0.0';

export type CrisisSeverity = 'none' | 'low' | 'med' | 'high';

/**
 * Pre-filter: if any substring match, skip CRISIS_PATTERNS entirely.
 * Known Argentine idioms that look like crisis markers but aren't.
 */
export const IDIOM_PRE_FILTER: readonly string[] = [
  'me quiero matar estudiando',
  'me quiero matar laburando',
  'me quiero matar corriendo',
  'me quiero matar con esto',
  'me quiero matar trabajando',
  'me cago de risa',
  'me muero de risa',
  'me muero de hambre',
  'me muero de frío',
  'me muero de calor',
  'me muero de sueño',
  'me muero de ganas',
  'me mata la cabeza',
  'me mata este trabajo',
  'no aguanto más la rutina',
  'no aguanto más estudiar',
];

export interface CrisisPattern {
  pattern: RegExp;
  severity: 'low' | 'med' | 'high';
  tag: string;
}

export const CRISIS_PATTERNS: readonly CrisisPattern[] = [
  // Explicit suicidal ideation
  { pattern: /\bsuicid(?:arme|ar|io|arse|arnos)\b/i, severity: 'high', tag: 'suicide_word' },
  { pattern: /\bquitarme la vida\b/i, severity: 'high', tag: 'take_my_life' },
  { pattern: /\bmatarme\b(?! (?:estudiando|laburando|corriendo|trabajando|con))/i, severity: 'high', tag: 'kill_myself' },
  { pattern: /\bno quiero (?:vivir|existir|estar)\b/i, severity: 'high', tag: 'dont_want_live' },
  { pattern: /\bpienso en (?:morir|suicid)\w*/i, severity: 'high', tag: 'thinking_die' },
  { pattern: /\bpastillas (?:para morir|para terminar|de m[aá]s)\b/i, severity: 'high', tag: 'pills_plan' },

  // Self-harm active
  { pattern: /\bautolesion\w*/i, severity: 'high', tag: 'self_harm' },
  { pattern: /\bcortarme\b(?! el pelo| las u[nñ]as)/i, severity: 'high', tag: 'cutting' },
  { pattern: /\bme (?:hago|hice) da[nñ]o\b/i, severity: 'med', tag: 'hurt_myself' },

  // Hopelessness with intent
  { pattern: /\bno (?:puedo|aguanto) m[aá]s\b/i, severity: 'med', tag: 'cant_anymore' },
  { pattern: /\bmi vida no (?:tiene|vale) nada\b/i, severity: 'med', tag: 'life_nothing' },
  { pattern: /\bdesaparecer para siempre\b/i, severity: 'med', tag: 'disappear_forever' },
  { pattern: /\b(?:todo|nada) tiene sentido\b/i, severity: 'low', tag: 'meaninglessness' },

  // Active psychosis markers (rare, kept narrow)
  { pattern: /\b(?:voces|voz) que me (?:dice|dicen)\b/i, severity: 'med', tag: 'voices' },
];

export interface ClassifyResult {
  severity: CrisisSeverity;
  hits: string[];
  matched_patterns: string[];
}

/**
 * Classify a message using the crisis lexicon. Idiom pre-filter short-circuits
 * before the main patterns fire. Returns severity='none' for safe messages.
 *
 * This function is pure, fast (< 1ms), and 100% offline. It is the first line
 * of defense in the chat safety pipeline — the Claude classifier is called
 * AFTER this function returns a non-'none' severity OR with 1% random sampling.
 */
export function classifyMessage(message: string): ClassifyResult {
  const lower = message.toLowerCase();

  // Idiom pre-filter: short-circuit on known safe phrases
  if (IDIOM_PRE_FILTER.some((s) => lower.includes(s))) {
    return { severity: 'none', hits: [], matched_patterns: [] };
  }

  // Main pass: collect all matches, take max severity
  const hits: string[] = [];
  const matched: string[] = [];
  const rank = { none: 0, low: 1, med: 2, high: 3 } as const;
  let max: CrisisSeverity = 'none';

  for (const { pattern, severity, tag } of CRISIS_PATTERNS) {
    if (pattern.test(message)) {
      hits.push(tag);
      matched.push(pattern.source);
      if (rank[severity] > rank[max]) {
        max = severity;
      }
    }
  }

  return { severity: max, hits, matched_patterns: matched };
}
