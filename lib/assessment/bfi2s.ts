import { z } from 'zod';
import type { BigFive, BigFiveDimension, BigFiveSelfReport } from '@/types';

export const BFI2S_VERSION = 'bfi-2-s-es-30-v1' as const;
export const BFI2S_SOURCE = 'https://www.colby.edu/wp-content/uploads/2022/07/bfi2s-form-spanish.pdf';
export const BFI2S_ATTRIBUTION = 'BFI-2-S: Oliver P. John y Christopher J. Soto. Versión española: David Gallardo-Pujol, Luís Oceja, Anna Cortijos-Bernabeu y Victor Rouco. Uso académico no comercial.';

// Published Spanish items, in their original order. Do not paraphrase items or
// reorder the scoring key. Copyright remains with the instrument authors.
export const BFI2S_ITEMS = [
  'Compasivo/a, con un gran corazón',
  'Relajado/a, que gestiona bien el estrés',
  'Respetuoso/a, que trata a los demás con respeto',
  'Formal, constante',
  'Que tiende a estar callado/a',
  'Fascinado/a por el arte, la música o la literatura',
  'Dominante, que actúa como líder',
  'Emocionalmente estable, que no se altera con facilidad',
  'Que mantiene todo limpio y ordenado',
  'Lleno/a de energía',
  'Tenaz, que trabaja hasta terminar la tarea',
  'Que tiende a sentirse deprimido/a, melancólico/a',
  'Con poco interés por ideas abstractas',
  'Que piensa bien de la gente',
  'Original, que aporta ideas nuevas',
  'Abierto/a, sociable',
  'Que tiende a ser desorganizado/a',
  'Con pocos intereses artísticos',
  'Que se mantiene optimista después de sufrir un contratiempo',
  'Que siente curiosidad por gran variedad de cosas',
  'Variable, con notables cambios de humor',
  'Que siente poca compasión hacia los demás',
  'A quien le cuesta empezar las tareas',
  'Menos activo/a que otras personas',
  'Que puede ser algo descuidado/a',
  'Con poca creatividad',
  'Que se preocupa mucho',
  'A quien le es difícil influir en los demás',
  'Que a veces es grosero/a con los demás',
  'Que desconfía de las intenciones de los demás',
] as const;

export const BFI2S_CHOICES = ['Muy en desacuerdo', 'Algo en desacuerdo', 'Neutral, sin opinión', 'Algo de acuerdo', 'Muy de acuerdo'] as const;

// Domain key from page 3 of the author-hosted Spanish short form. Negative
// numbers denote reversed items (6 - response). We do not score facets.
export const BFI2S_KEY: Record<BigFiveDimension, readonly number[]> = {
  extraversion: [-5, 7, 10, 16, -24, -28],
  agreeableness: [1, 3, 14, -22, -29, -30],
  conscientiousness: [4, 9, 11, -17, -23, -25],
  neuroticism: [-2, -8, 12, -19, 21, 27],
  openness: [6, -13, 15, -18, 20, -26],
};

export const BFI2S_DOMAINS: { key: BigFiveDimension; label: string; description: string; question: string }[] = [
  { key: 'openness', label: 'Apertura de mente', description: 'Curiosidad, imaginación e interés por ideas y experiencias estéticas.', question: '¿Qué idea o experiencia te gustaría explorar esta semana?' },
  { key: 'conscientiousness', label: 'Responsabilidad', description: 'Organización, constancia y cuidado al llevar adelante tareas.', question: '¿Qué pequeño paso te ayudaría con una tarea que elegiste?' },
  { key: 'extraversion', label: 'Extraversión', description: 'Sociabilidad, energía y disposición a tomar la iniciativa.', question: '¿Qué equilibrio entre compañía y tiempo a solas te resulta cómodo?' },
  { key: 'agreeableness', label: 'Cordialidad', description: 'Compasión, respeto y confianza en el trato con otras personas.', question: '¿En qué vínculo te gustaría practicar escuchar o poner un límite?' },
  { key: 'neuroticism', label: 'Emocionalidad negativa', description: 'Tendencia declarada a experimentar preocupación y cambios emocionales. No evalúa trastornos.', question: '¿Qué situación cotidiana te gustaría observar con más atención, sin juzgarte?' },
];

export const BFI2SAnswersSchema = z.array(z.number().int().min(1).max(5)).length(30);

export function scoreBfi2s(input: unknown): BigFive {
  const answers = BFI2SAnswersSchema.parse(input);
  const score = (key: BigFiveDimension) => BFI2S_KEY[key].reduce((sum, item) => {
    const value = answers[Math.abs(item) - 1];
    return sum + (item < 0 ? 6 - value : value);
  }, 0) / 6;
  return { openness: score('openness'), conscientiousness: score('conscientiousness'), extraversion: score('extraversion'), agreeableness: score('agreeableness'), neuroticism: score('neuroticism') };
}

export function createSelfReport(answers: unknown, completedAt: string): BigFiveSelfReport {
  const parsed = BFI2SAnswersSchema.parse(answers);
  return { instrument: BFI2S_VERSION, source: 'self_report', answers: parsed, scores: scoreBfi2s(parsed), completedAt, scale: '1-5', priorFeedback: 'not_controlled', researchUse: false };
}

const StoredSchema = z.object({ instrument: z.literal(BFI2S_VERSION), source: z.literal('self_report'), answers: BFI2SAnswersSchema, completedAt: z.string().datetime(), scale: z.literal('1-5'), priorFeedback: z.literal('not_controlled'), researchUse: z.literal(false) });

export function extractSelfReport(analysisRaw: unknown): BigFiveSelfReport | null {
  if (!analysisRaw || typeof analysisRaw !== 'object' || !('selfReport' in analysisRaw)) return null;
  const parsed = StoredSchema.safeParse(analysisRaw.selfReport);
  // Recompute on read; never trust a cached score, a model output or a client score.
  return parsed.success ? createSelfReport(parsed.data.answers, parsed.data.completedAt) : null;
}
