// lib/research/instruments.ts

import type { MetuxDimension, UsabilityInstrument } from '@/types/research';

type InstrumentFamily = 'umux_lite' | 'metux' | 'cuq' | 'sus';

export interface ScoringInstructions {
  scale: '1-7';
  reverse_scored_item_keys: readonly string[];
  formula: string;
  notes: string;
}

export interface ResearchInstrumentItem {
  itemKey: string;
  instrument: UsabilityInstrument;
  prompt: string;
  reverseScored?: boolean;
  dimension?: MetuxDimension;
}

export interface ResearchInstrumentDefinition {
  family: InstrumentFamily;
  title: string;
  subtitle: string;
  description: string;
  items: readonly ResearchInstrumentItem[];
  scoring: ScoringInstructions;
}

export const METUX_ROW_INSTRUMENTS = [
  'metux_autonomy',
  'metux_competence',
  'metux_relatedness',
] as const satisfies readonly UsabilityInstrument[];

export const LIKERT_7_LABELS = {
  min: 'Muy en desacuerdo',
  mid: 'Ni de acuerdo ni en desacuerdo',
  max: 'Muy de acuerdo',
} as const;

// Lewis (2013), traducido al español latinoamericano para uso in-app.
export const UMUX_LITE_ITEMS = [
  {
    itemKey: 'umux_01_requirements',
    instrument: 'umux_lite',
    prompt: 'Las capacidades de Umbra cumplen con mis necesidades.',
  },
  {
    itemKey: 'umux_02_frustrating',
    instrument: 'umux_lite',
    prompt: 'Usar Umbra me resulta frustrante.',
    reverseScored: true,
  },
] as const satisfies readonly ResearchInstrumentItem[];

// Adaptación breve basada en Positive Computing / SDT para autonomía,
// competencia y relatedness. Se persiste por dimensión para análisis.
export const METUX_ITEMS = [
  {
    itemKey: 'metux_autonomy_01_pace',
    instrument: 'metux_autonomy',
    dimension: 'autonomy',
    prompt: 'Mientras usaba Umbra, sentí que podía avanzar a mi ritmo.',
  },
  {
    itemKey: 'metux_autonomy_02_choice',
    instrument: 'metux_autonomy',
    dimension: 'autonomy',
    prompt: 'Umbra me dejó decidir cómo responder y explorar.',
  },
  {
    itemKey: 'metux_autonomy_03_control',
    instrument: 'metux_autonomy',
    dimension: 'autonomy',
    prompt: 'Sentí que tenía control sobre mi experiencia dentro de Umbra.',
  },
  {
    itemKey: 'metux_competence_01_capable',
    instrument: 'metux_competence',
    dimension: 'competence',
    prompt: 'Umbra me hizo sentir capaz de completar lo que quería hacer.',
  },
  {
    itemKey: 'metux_competence_02_clear_steps',
    instrument: 'metux_competence',
    dimension: 'competence',
    prompt: 'Entendí qué hacer en cada paso sin perderme.',
  },
  {
    itemKey: 'metux_competence_03_recover',
    instrument: 'metux_competence',
    dimension: 'competence',
    prompt: 'Cuando aparecía algo nuevo, sentí que podía resolverlo sin trabarme.',
  },
  {
    itemKey: 'metux_relatedness_01_accompanied',
    instrument: 'metux_relatedness',
    dimension: 'relatedness',
    prompt: 'El tono de Umbra me hizo sentir acompañado, no juzgado.',
  },
  {
    itemKey: 'metux_relatedness_02_respectful',
    instrument: 'metux_relatedness',
    dimension: 'relatedness',
    prompt: 'Sentí que Umbra se dirigía a mí de una forma humana y respetuosa.',
  },
  {
    itemKey: 'metux_relatedness_03_connection',
    instrument: 'metux_relatedness',
    dimension: 'relatedness',
    prompt: 'La experiencia me ayudó a sentirme más conectado conmigo mismo.',
  },
] as const satisfies readonly ResearchInstrumentItem[];

// Basado en CUQ (Ulster University), adaptado a 7 puntos y al contexto de
// Umbra como interfaz conversacional.
export const CUQ_ITEMS = [
  {
    itemKey: 'cuq_01_easy_start',
    instrument: 'cuq',
    prompt: 'Me resultó fácil empezar a usar Umbra.',
  },
  {
    itemKey: 'cuq_02_clear_responses',
    instrument: 'cuq',
    prompt: 'Las respuestas de Umbra me parecieron claras.',
  },
  {
    itemKey: 'cuq_03_next_step',
    instrument: 'cuq',
    prompt: 'Me resultó fácil saber qué podía hacer después.',
  },
  {
    itemKey: 'cuq_04_natural_tone',
    instrument: 'cuq',
    prompt: 'El tono de Umbra me pareció natural.',
  },
  {
    itemKey: 'cuq_05_understood_me',
    instrument: 'cuq',
    prompt: 'Sentí que Umbra entendía lo que yo quería hacer.',
  },
  {
    itemKey: 'cuq_06_easy_recovery',
    instrument: 'cuq',
    prompt: 'Me resultó fácil retomar el hilo si me confundía.',
  },
  {
    itemKey: 'cuq_07_too_much_effort',
    instrument: 'cuq',
    prompt: 'Usar Umbra me llevó más esfuerzo del que esperaba.',
    reverseScored: true,
  },
  {
    itemKey: 'cuq_08_confusing_answers',
    instrument: 'cuq',
    prompt: 'En algunos momentos, Umbra respondió de una forma confusa.',
    reverseScored: true,
  },
  {
    itemKey: 'cuq_09_fluid_interaction',
    instrument: 'cuq',
    prompt: 'La interacción se sintió fluida, sin fricciones innecesarias.',
  },
  {
    itemKey: 'cuq_10_easy_correction',
    instrument: 'cuq',
    prompt: 'Me resultó fácil corregir una respuesta o volver atrás cuando lo necesitaba.',
  },
  {
    itemKey: 'cuq_11_think_too_much',
    instrument: 'cuq',
    prompt: 'Tuve que pensar demasiado para entender cómo seguir.',
    reverseScored: true,
  },
  {
    itemKey: 'cuq_12_reliable',
    instrument: 'cuq',
    prompt: 'Sentí que Umbra fue confiable durante la interacción.',
  },
  {
    itemKey: 'cuq_13_awkward_parts',
    instrument: 'cuq',
    prompt: 'Algunas partes de la experiencia se sintieron torpes o poco naturales.',
    reverseScored: true,
  },
  {
    itemKey: 'cuq_14_clear_intent',
    instrument: 'cuq',
    prompt: 'Me quedó claro qué estaba haciendo Umbra en cada momento importante.',
  },
  {
    itemKey: 'cuq_15_learn_quickly',
    instrument: 'cuq',
    prompt: 'Si quisiera, podría aprender a usar Umbra muy rápido.',
  },
  {
    itemKey: 'cuq_16_satisfying',
    instrument: 'cuq',
    prompt: 'En general, la conversación con Umbra me resultó satisfactoria.',
  },
] as const satisfies readonly ResearchInstrumentItem[];

// Brooke (1996), versión en español latinoamericano tomada del plan de validación.
export const SUS_ITEMS = [
  {
    itemKey: 'sus_01_frequent_use',
    instrument: 'sus',
    prompt: 'Creo que me gustaría usar Umbra con frecuencia.',
  },
  {
    itemKey: 'sus_02_unnecessarily_complex',
    instrument: 'sus',
    prompt: 'Encontré a Umbra innecesariamente complejo.',
    reverseScored: true,
  },
  {
    itemKey: 'sus_03_easy_to_use',
    instrument: 'sus',
    prompt: 'Pensé que Umbra era fácil de usar.',
  },
  {
    itemKey: 'sus_04_need_technical_help',
    instrument: 'sus',
    prompt: 'Creo que necesitaría ayuda técnica para poder usar Umbra.',
    reverseScored: true,
  },
  {
    itemKey: 'sus_05_well_integrated',
    instrument: 'sus',
    prompt: 'Las funciones de Umbra estaban bien integradas entre sí.',
  },
  {
    itemKey: 'sus_06_too_much_inconsistency',
    instrument: 'sus',
    prompt: 'Me pareció que había mucha inconsistencia en Umbra.',
    reverseScored: true,
  },
  {
    itemKey: 'sus_07_learn_fast',
    instrument: 'sus',
    prompt: 'Imagino que la mayoría de la gente aprendería a usar Umbra muy rápido.',
  },
  {
    itemKey: 'sus_08_awkward_to_use',
    instrument: 'sus',
    prompt: 'Encontré a Umbra muy incómodo de usar.',
    reverseScored: true,
  },
  {
    itemKey: 'sus_09_confident',
    instrument: 'sus',
    prompt: 'Me sentí muy seguro usando Umbra.',
  },
  {
    itemKey: 'sus_10_need_to_learn_lot',
    instrument: 'sus',
    prompt: 'Necesité aprender muchas cosas antes de poder empezar a usar Umbra.',
    reverseScored: true,
  },
] as const satisfies readonly ResearchInstrumentItem[];

const UMUX_LITE_DEFINITION: ResearchInstrumentDefinition = {
  family: 'umux_lite',
  title: 'UMUX-Lite',
  subtitle: 'Usabilidad percibida',
  description: 'Dos ítems breves para medir utilidad y fricción general.',
  items: UMUX_LITE_ITEMS,
  scoring: {
    scale: '1-7',
    reverse_scored_item_keys: ['umux_02_frustrating'],
    formula:
      'Invertí el ítem negativo y promediá ambos ítems. Si querés un score 0-100: ((Q1 - 1) + (7 - Q2)) * (100 / 12).',
    notes:
      'Útil como pulso corto post-tarea. Más alto = mejor usabilidad percibida.',
  },
};

const METUX_DEFINITION: ResearchInstrumentDefinition = {
  family: 'metux',
  title: 'METUX',
  subtitle: 'Autonomía, competencia y relatedness',
  description:
    'Nueve ítems para captar necesidad psicológica satisfecha por la experiencia.',
  items: METUX_ITEMS,
  scoring: {
    scale: '1-7',
    reverse_scored_item_keys: [],
    formula:
      'Calculá el promedio por dimensión (3 ítems cada una) y, si necesitás un índice global, promediá las tres medias.',
    notes:
      'Se recomienda reportar autonomía, competencia y relatedness por separado antes que un solo score agregado.',
  },
};

const CUQ_DEFINITION: ResearchInstrumentDefinition = {
  family: 'cuq',
  title: 'CUQ',
  subtitle: 'Usabilidad conversacional',
  description:
    'Dieciséis ítems sobre claridad, fluidez, recuperación y naturalidad de la interacción.',
  items: CUQ_ITEMS,
  scoring: {
    scale: '1-7',
    reverse_scored_item_keys: [
      'cuq_07_too_much_effort',
      'cuq_08_confusing_answers',
      'cuq_11_think_too_much',
      'cuq_13_awkward_parts',
    ],
    formula:
      'Invertí los ítems negativos, luego calculá el promedio total. Si necesitás normalizar, llevá la media de 1-7 a 0-100.',
    notes:
      'Esta adaptación usa 7 puntos para alinearse con el resto del módulo de investigación in-app.',
  },
};

const SUS_DEFINITION: ResearchInstrumentDefinition = {
  family: 'sus',
  title: 'SUS',
  subtitle: 'System Usability Scale',
  description: 'Diez ítems clásicos de usabilidad general.',
  items: SUS_ITEMS,
  scoring: {
    scale: '1-7',
    reverse_scored_item_keys: [
      'sus_02_unnecessarily_complex',
      'sus_04_need_technical_help',
      'sus_06_too_much_inconsistency',
      'sus_08_awkward_to_use',
      'sus_10_need_to_learn_lot',
    ],
    formula:
      'En la versión clásica 1-5: impares = score - 1, pares = 5 - score, total * 2.5. En esta adaptación 1-7, invertí pares y reportá media 1-7 o una normalización explícita.',
    notes:
      'Si lo usás en tesis, dejá documentado que esta captura in-app está adaptada a escala de 7 puntos.',
  },
};

export function isMetuxInstrument(instrument: UsabilityInstrument): boolean {
  // METUX_ROW_INSTRUMENTS is typed `as const satisfies readonly UsabilityInstrument[]`
  // which gives a narrower element type than UsabilityInstrument. We widen
  // the array type at the includes() call-site so any UsabilityInstrument
  // can be tested for membership without TypeScript rejecting the union.
  return (METUX_ROW_INSTRUMENTS as readonly UsabilityInstrument[]).includes(instrument);
}

export function getUsabilityDefinition(
  instrument: UsabilityInstrument,
): ResearchInstrumentDefinition {
  if (instrument === 'umux_lite') return UMUX_LITE_DEFINITION;
  if (instrument === 'cuq') return CUQ_DEFINITION;
  if (instrument === 'sus') return SUS_DEFINITION;
  return METUX_DEFINITION;
}

export function getUsabilityItems(
  instrument: UsabilityInstrument,
): readonly ResearchInstrumentItem[] {
  return getUsabilityDefinition(instrument).items;
}

export function getUsabilityItemMap(
  instrument: UsabilityInstrument,
): ReadonlyMap<string, ResearchInstrumentItem> {
  return new Map(getUsabilityItems(instrument).map((item) => [item.itemKey, item]));
}
