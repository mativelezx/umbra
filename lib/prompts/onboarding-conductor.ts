import { z } from 'zod';
import type {
  BigFiveDimension,
  JungFunctionKey,
  OnboardingAnswer,
  OnboardingQuestion,
  OnboardingTurn,
  OpenTextQuestion,
  WorkingProfile,
} from '@/types';

export interface ConductorPromptParams {
  priorTurns: OnboardingTurn[];
  workingProfile: WorkingProfile;
  previousAnswer: OnboardingAnswer | null;
  turnNumber: number;
  maxTurns: number;
  confidenceThreshold: number;
}

export const DEFAULT_MAX_TURNS = 8;
export const DEFAULT_CONFIDENCE_THRESHOLD = 75;

const SYSTEM = `Sos un entrevistador conductor para Umbra, una herramienta de autoconocimiento. Tu tarea es guiar una conversación corta (6 a 8 turnos) donde, en cada turno, elegís UNA interacción que maximice la información sobre el perfil psicológico del usuario, triangulando Big Five (IPIP-NEO), funciones cognitivas de Jung (1921) y arquetipos aplicados de Pearson (1991).

Tono: cálido, curioso, sin lenguaje clínico ni diagnóstico. Voseo rioplatense. Nunca decís "tenés un trastorno", "sufrís de", "sos un INTJ". Triangulás señales, no etiquetás personas.

Después de cada respuesta, hacés tres cosas:
1. Extraés señales (bigFive / jung) con dirección y fuerza.
2. Actualizás el perfil de trabajo (estimaciones + confianza).
3. Decidís la próxima interacción que más reduzca incertidumbre, o marcás done.

Devolvés SOLO JSON estricto con la estructura especificada. Sin markdown, sin texto fuera del JSON.`;

const DECISION_RULES = (maxTurns: number, threshold: number): string => `
## Reglas de decisión
- Elegí el tipo de interacción que maximiza information gain dada la incertidumbre actual. Mirá las dimensiones con MENOR confianza primero.
- NO repitas el mismo tipo en turnos consecutivos.
- El primer turno SIEMPRE es open_text (apertura, baseline).
- Variá entre los 6 tipos disponibles (open_text, multi_choice, scenario, ranking, polarity, metaphor). Buscá al menos 4 tipos distintos en ${maxTurns} turnos.
- Para multi_choice / scenario / ranking / metaphor: cada opción DEBE tener un campo "meaning" privado que describa qué señal codifica (ej: "alta Ne + baja Si"). NUNCA se muestran al usuario.
- polarity: dos polos REALES de un eje psicológico, no falsos opuestos.
- Marcá done=true si:
    overallConfidence ≥ ${threshold}, o
    turnNumber >= ${maxTurns}, o
    el arquetipo top tiene confidence ≥ ${threshold + 5} y supera al segundo por al menos 15 puntos.
- Cuando done=true, nextQuestion DEBE ser null.
- insights: hasta 3 frases breves en español (≤80 caracteres c/u), tono de descubrimiento, no diagnóstico. Ejemplo bueno: "Cuando contás cómo decidís, tu Ti aparece marcado." Ejemplo malo: "Sos un INTJ con rasgos depresivos".
`;

const OUTPUT_SCHEMA_DESCRIPTION = `## Formato de respuesta (JSON estricto, sin markdown)

IMPORTANTE sobre el campo "probe":
- Si kind="big_five"  → probe = { "kind": "big_five",  "dimension": "openness|conscientiousness|extraversion|agreeableness|neuroticism" }
- Si kind="jung"      → probe = { "kind": "jung",      "func": "Se|Si|Ne|Ni|Te|Ti|Fe|Fi" }
- Si kind="archetype" → probe = { "kind": "archetype", "candidate": "hero|sage|explorer|creator|caregiver|rebel" }
- Si kind="open"      → probe = { "kind": "open" }
- NUNCA mezclés kinds, NUNCA omitás el campo obligatorio del kind elegido.

IMPORTANTE sobre polarity.axis.dimension:
- Es UNA sola dimensión, NO una etiqueta compuesta tipo "Ti_vs_Fe" o "Ne/Si".
- Los valores válidos son exactamente los mismos del enum de probe: openness, conscientiousness, extraversion, agreeableness, neuroticism, Se, Si, Ne, Ni, Te, Ti, Fe, Fi.
- El "contraste" entre dos polos se expresa en leftPole.meaning y rightPole.meaning, no en el nombre de la dimensión.

IMPORTANTE sobre signalsCaptured[].dimension:
- Solo acepta los 13 valores del enum anterior. NUNCA pongas nombres de arquetipo ("sage", "hero") ni etiquetas MBTI. Los arquetipos viven en updatedProfile.archetypeCandidates, no en signals.

{
  "updatedProfile": {
    "bigFive": {
      "openness": { "value": 0-100, "confidence": 0-100 },
      "conscientiousness": { "value": 0-100, "confidence": 0-100 },
      "extraversion": { "value": 0-100, "confidence": 0-100 },
      "agreeableness": { "value": 0-100, "confidence": 0-100 },
      "neuroticism": { "value": 0-100, "confidence": 0-100 }
    },
    "jungFunctions": {
      "Se": { "value": 0-100, "confidence": 0-100 },
      "Si": { "value": 0-100, "confidence": 0-100 },
      "Ne": { "value": 0-100, "confidence": 0-100 },
      "Ni": { "value": 0-100, "confidence": 0-100 },
      "Te": { "value": 0-100, "confidence": 0-100 },
      "Ti": { "value": 0-100, "confidence": 0-100 },
      "Fe": { "value": 0-100, "confidence": 0-100 },
      "Fi": { "value": 0-100, "confidence": 0-100 }
    },
    "archetypeCandidates": [
      { "key": "hero|sage|explorer|creator|caregiver|rebel", "confidence": 0-100, "rationale": "frase corta" }
    ],
    "evidence": [
      { "text": "quote verbatim o label de opción", "source": "user_text|choice", "questionId": "..." }
    ],
    "turnsAnswered": <int>,
    "overallConfidence": 0-100
  },
  "signalsCaptured": [
    {
      "dimension": "openness|conscientiousness|extraversion|agreeableness|neuroticism|Se|Si|Ne|Ni|Te|Ti|Fe|Fi",
      "direction": "high|low",
      "strength": 0-100,
      "source": { "questionId": "...", "quote": "...", "choiceId": "..." }
    }
  ],
  "insights": [
    { "id": "...", "text": "≤80 chars", "tone": "discovery|tension|resonance" }
  ],
  "nextQuestion": <OnboardingQuestion union> | null,
  "done": <boolean>,
  "rationale": "1-2 frases internas (no se muestran al usuario)"
}

## Shape de nextQuestion (discriminado por "type")

open_text:
  { "id": "...", "turnIndex": <int>, "type": "open_text", "prompt": "...", "helper"?: "...",
    "probe": { "kind": "big_five|jung|archetype|open", ... }, "minWords": <int>, "maxWords": <int>, "placeholder": "..." }

multi_choice:
  { "id": "...", "turnIndex": <int>, "type": "multi_choice", "prompt": "...", "helper"?: "...",
    "probe": {...}, "allowMultiple": <bool>,
    "options": [{ "id": "a", "label": "...", "meaning": "...", "iconHint"?: "..." }, ...] }

scenario:
  { "id": "...", "turnIndex": <int>, "type": "scenario", "prompt": "...", "helper"?: "...",
    "probe": {...}, "scene": "vignette 2-3 frases",
    "options": [{ "id": "a", "label": "...", "meaning": "...", "iconHint"?: "..." }, ...] }

ranking:
  { "id": "...", "turnIndex": <int>, "type": "ranking", "prompt": "...", "helper"?: "...",
    "probe": {...}, "instruction": "...",
    "items": [{ "id": "a", "label": "...", "meaning": "..." }, ...] }  // exactamente 4

polarity:
  { "id": "...", "turnIndex": <int>, "type": "polarity", "prompt": "...", "helper"?: "...",
    "probe": {...}, "axis": { "dimension": "...", "invert"?: <bool> },
    "leftPole":  { "label": "...", "meaning": "..." },
    "rightPole": { "label": "...", "meaning": "..." } }

metaphor:
  { "id": "...", "turnIndex": <int>, "type": "metaphor", "prompt": "...", "helper"?: "...",
    "probe": {...}, "instruction": "...",
    "cards": [{ "id": "a", "title": "...", "description": "...", "iconHint": "...", "meaning": "..." }, ...] }`;

function serializeAnswer(answer: OnboardingAnswer): string {
  switch (answer.type) {
    case 'open_text':
      return `[open_text] "${answer.text}"`;
    case 'multi_choice':
      return `[multi_choice] ids=${answer.selectedIds.join(',')}`;
    case 'scenario':
      return `[scenario] id=${answer.selectedId}`;
    case 'ranking':
      return `[ranking] order=${answer.orderedIds.join(' > ')}`;
    case 'polarity':
      return `[polarity] value=${answer.value}/100`;
    case 'metaphor':
      return `[metaphor] id=${answer.selectedId}`;
  }
}

function serializeQuestion(q: OnboardingQuestion): string {
  const base = `tipo=${q.type}, prompt="${q.prompt}", probe=${JSON.stringify(q.probe)}`;
  switch (q.type) {
    case 'open_text':
      return `${base}`;
    case 'multi_choice':
    case 'scenario': {
      const opts = q.options
        .map((o) => `${o.id}="${o.label}" (${o.meaning})`)
        .join(' | ');
      const scene = q.type === 'scenario' ? `, escena="${q.scene}"` : '';
      return `${base}${scene}, opciones=[${opts}]`;
    }
    case 'ranking': {
      const items = q.items
        .map((i) => `${i.id}="${i.label}" (${i.meaning})`)
        .join(' | ');
      return `${base}, items=[${items}]`;
    }
    case 'polarity':
      return `${base}, izq="${q.leftPole.label}" (${q.leftPole.meaning}), der="${q.rightPole.label}" (${q.rightPole.meaning})`;
    case 'metaphor': {
      const cards = q.cards
        .map((c) => `${c.id}="${c.title}" (${c.meaning})`)
        .join(' | ');
      return `${base}, cartas=[${cards}]`;
    }
  }
}

function serializeWorkingProfile(wp: WorkingProfile): string {
  const bf = (Object.keys(wp.bigFive) as BigFiveDimension[])
    .map((k) => `${k}=${wp.bigFive[k].value}/c${wp.bigFive[k].confidence}`)
    .join(', ');
  const jf = (Object.keys(wp.jungFunctions) as JungFunctionKey[])
    .map((k) => `${k}=${wp.jungFunctions[k].value}/c${wp.jungFunctions[k].confidence}`)
    .join(', ');
  const arch = wp.archetypeCandidates
    .map((a, i) => `${i + 1}) ${a.key} (${a.confidence}) — ${a.rationale}`)
    .join('; ');
  return `Confianza global: ${wp.overallConfidence}\nBig Five: ${bf}\nJung: ${jf}\nArquetipos: ${arch || 'sin candidatos aún'}`;
}

export function buildOnboardingConductorPrompt(params: ConductorPromptParams): {
  system: string;
  prompt: string;
} {
  const {
    priorTurns,
    workingProfile,
    previousAnswer,
    turnNumber,
    maxTurns,
    confidenceThreshold,
  } = params;

  const sections: string[] = [];

  // Compact reference only — the full knowledge blocks live in lib/knowledge/
  // and are injected into the analyzer prompt, not the conductor. The
  // conductor just needs shared vocabulary so the JSON probe fields align.
  sections.push(
    [
      '## Referencia rápida (vocabulario compartido)',
      '',
      'Big Five (IPIP-NEO): openness, conscientiousness, extraversion, agreeableness, neuroticism — escala 0-100.',
      '',
      'Funciones de Jung (1921): Se/Si (sensorial ext/int), Ne/Ni (intuición ext/int), Te/Ti (pensar ext/int), Fe/Fi (sentir ext/int) — escala 0-100 por función.',
      '',
      'Arquetipos aplicados (Pearson): hero, sage, explorer, creator, caregiver, rebel — confianza 0-100.',
    ].join('\n'),
  );

  sections.push(
    `## Perfil de trabajo actual (turno ${turnNumber} de ${maxTurns})\n\n${serializeWorkingProfile(workingProfile)}`,
  );

  if (priorTurns.length === 0) {
    sections.push('## Turnos previos\n\n(ninguno — este es el turno de apertura)');
  } else {
    const history = priorTurns
      .map((t, i) => {
        const q = serializeQuestion(t.question);
        const a = t.answer ? serializeAnswer(t.answer) : '(sin respuesta)';
        const signals = t.signals.length
          ? t.signals
              .map(
                (s) =>
                  `${s.dimension} ${s.direction} str=${s.strength}`,
              )
              .join(', ')
          : '(sin señales)';
        return `### Turno ${i + 1}\n${q}\nRespuesta: ${a}\nSeñales: ${signals}`;
      })
      .join('\n\n');
    sections.push(`## Turnos previos\n\n${history}`);
  }

  if (previousAnswer) {
    sections.push(
      `## Respuesta más reciente a procesar\n\n${serializeAnswer(previousAnswer)}\n\nExtraé señales de esta respuesta y reflejalas en updatedProfile y signalsCaptured.`,
    );
  }

  sections.push(DECISION_RULES(maxTurns, confidenceThreshold));
  sections.push(OUTPUT_SCHEMA_DESCRIPTION);
  sections.push(
    `## Tu tarea ahora\n\nEstás en el turno ${turnNumber} de un máximo de ${maxTurns}. ${
      turnNumber === 1
        ? 'Este es el turno de apertura — nextQuestion DEBE ser open_text. No evalúes respuesta previa (no hay).'
        : 'Procesá la respuesta más reciente, actualizá el perfil y decidí la próxima interacción (o marcá done).'
    }\n\nDevolvé SOLO el JSON.`,
  );

  return {
    system: SYSTEM,
    prompt: sections.join('\n\n'),
  };
}

// ─── Zod schemas for validation ───

const ProbeTargetSchema = z.union([
  z.object({
    kind: z.literal('big_five'),
    dimension: z.enum([
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
    ]),
  }),
  z.object({
    kind: z.literal('jung'),
    func: z.enum(['Se', 'Si', 'Ne', 'Ni', 'Te', 'Ti', 'Fe', 'Fi']),
  }),
  z.object({
    kind: z.literal('archetype'),
    candidate: z.enum(['hero', 'sage', 'explorer', 'creator', 'caregiver', 'rebel']),
  }),
  z.object({ kind: z.literal('open') }),
]);

const MultiChoiceOptionSchema = z.object({
  id: z.string().min(1).max(16),
  label: z.string().min(1).max(240),
  meaning: z.string().min(1).max(240),
  iconHint: z.string().max(40).optional(),
});

const RankingItemSchema = z.object({
  id: z.string().min(1).max(16),
  label: z.string().min(1).max(240),
  meaning: z.string().min(1).max(240),
});

const MetaphorCardSchema = z.object({
  id: z.string().min(1).max(16),
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(240),
  iconHint: z.string().min(1).max(40),
  meaning: z.string().min(1).max(240),
});

const QuestionBaseFields = {
  id: z.string().min(1).max(64),
  turnIndex: z.number().int().min(0).max(32),
  prompt: z.string().min(1).max(600),
  helper: z.string().max(240).optional(),
  probe: ProbeTargetSchema,
};

const OpenTextQuestionSchema = z.object({
  ...QuestionBaseFields,
  type: z.literal('open_text'),
  minWords: z.number().int().min(0).max(200),
  maxWords: z.number().int().min(1).max(500),
  placeholder: z.string().max(240),
});

const MultiChoiceQuestionSchema = z.object({
  ...QuestionBaseFields,
  type: z.literal('multi_choice'),
  allowMultiple: z.boolean(),
  options: z.array(MultiChoiceOptionSchema).min(2).max(6),
});

const ScenarioQuestionSchema = z.object({
  ...QuestionBaseFields,
  type: z.literal('scenario'),
  scene: z.string().min(10).max(800),
  options: z.array(MultiChoiceOptionSchema).min(2).max(6),
});

const RankingQuestionSchema = z.object({
  ...QuestionBaseFields,
  type: z.literal('ranking'),
  instruction: z.string().min(1).max(240),
  items: z.array(RankingItemSchema).min(3).max(6),
});

const PolarityQuestionSchema = z.object({
  ...QuestionBaseFields,
  type: z.literal('polarity'),
  axis: z.object({
    dimension: z.enum([
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
      'Se',
      'Si',
      'Ne',
      'Ni',
      'Te',
      'Ti',
      'Fe',
      'Fi',
    ]),
    invert: z.boolean().optional(),
  }),
  leftPole: z.object({ label: z.string().min(1).max(120), meaning: z.string().min(1).max(240) }),
  rightPole: z.object({ label: z.string().min(1).max(120), meaning: z.string().min(1).max(240) }),
});

const MetaphorQuestionSchema = z.object({
  ...QuestionBaseFields,
  type: z.literal('metaphor'),
  instruction: z.string().min(1).max(240),
  cards: z.array(MetaphorCardSchema).min(2).max(6),
});

export const OnboardingQuestionSchema = z.discriminatedUnion('type', [
  OpenTextQuestionSchema,
  MultiChoiceQuestionSchema,
  ScenarioQuestionSchema,
  RankingQuestionSchema,
  PolarityQuestionSchema,
  MetaphorQuestionSchema,
]);

const DimensionEstimateSchema = z.object({
  value: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
});

const BigFiveWPSchema = z.object({
  openness: DimensionEstimateSchema,
  conscientiousness: DimensionEstimateSchema,
  extraversion: DimensionEstimateSchema,
  agreeableness: DimensionEstimateSchema,
  neuroticism: DimensionEstimateSchema,
});

const JungWPSchema = z.object({
  Se: DimensionEstimateSchema,
  Si: DimensionEstimateSchema,
  Ne: DimensionEstimateSchema,
  Ni: DimensionEstimateSchema,
  Te: DimensionEstimateSchema,
  Ti: DimensionEstimateSchema,
  Fe: DimensionEstimateSchema,
  Fi: DimensionEstimateSchema,
});

const ArchetypeCandidateSchema = z.object({
  key: z.enum(['hero', 'sage', 'explorer', 'creator', 'caregiver', 'rebel']),
  confidence: z.number().min(0).max(100),
  rationale: z.string().min(1).max(400),
});

const EvidenceQuoteSchema = z.object({
  text: z.string().min(1).max(600),
  source: z.enum(['user_text', 'choice']),
  questionId: z.string().min(1).max(64),
});

export const WorkingProfileSchema = z.object({
  bigFive: BigFiveWPSchema,
  jungFunctions: JungWPSchema,
  archetypeCandidates: z.array(ArchetypeCandidateSchema).max(6),
  evidence: z.array(EvidenceQuoteSchema).max(40),
  turnsAnswered: z.number().int().min(0).max(32),
  overallConfidence: z.number().min(0).max(100),
});

export const OnboardingSignalSchema = z.object({
  dimension: z.enum([
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
    'Se',
    'Si',
    'Ne',
    'Ni',
    'Te',
    'Ti',
    'Fe',
    'Fi',
  ]),
  direction: z.enum(['high', 'low']),
  strength: z.number().min(0).max(100),
  source: z.object({
    questionId: z.string().min(1).max(96),
    quote: z.string().max(600).optional(),
    choiceId: z.string().max(96).optional(),
  }),
});

export const InsightPingSchema = z.object({
  id: z.string().min(1).max(64),
  text: z.string().min(1).max(160),
  tone: z.enum(['discovery', 'tension', 'resonance']),
});

export const ConductorResponseSchema = z.object({
  updatedProfile: WorkingProfileSchema,
  signalsCaptured: z.array(OnboardingSignalSchema).max(20),
  insights: z.array(InsightPingSchema).max(3),
  nextQuestion: OnboardingQuestionSchema.nullable(),
  done: z.boolean(),
  rationale: z.string().max(800).optional(),
});

export type ConductorResponse = z.infer<typeof ConductorResponseSchema>;

/**
 * Best-effort repair of the raw JSON Claude emits before it hits Zod.
 * Targets the most common conductor misses:
 *   - probe.kind set but the required sibling field missing or wrong.
 *   - done=true but nextQuestion is still a non-null object.
 *   - nextQuestion.turnIndex missing.
 * Everything else still fails loudly through Zod so we can see it.
 */
const VALID_DIMENSIONS = new Set<string>([
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
  'Se',
  'Si',
  'Ne',
  'Ni',
  'Te',
  'Ti',
  'Fe',
  'Fi',
]);

function coerceDimension(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (VALID_DIMENSIONS.has(value)) return value;
  // Claude sometimes invents MBTI-style axes like "Ti_vs_Fe" or "Ne/Si".
  // Pick the first token that matches a real dimension.
  const parts = value.split(/[_\/\-\s]+/);
  for (const p of parts) {
    if (VALID_DIMENSIONS.has(p)) return p;
  }
  return null;
}

export function normalizeConductorJson(raw: unknown, turnNumber: number): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const obj = raw as Record<string, unknown>;

  // signalsCaptured — Claude sometimes emits direction:"moderate" / "neutral"
  // or puts an archetype key ("sage") in the dimension field. Drop anything
  // that doesn't match the strict schema instead of failing the whole turn.
  if (Array.isArray(obj.signalsCaptured)) {
    obj.signalsCaptured = obj.signalsCaptured
      .map((s: unknown) => {
        if (!s || typeof s !== 'object') return null;
        const rec = s as Record<string, unknown>;
        const dir = rec.direction;
        if (dir !== 'high' && dir !== 'low') return null;
        const dim = coerceDimension(rec.dimension);
        if (!dim) return null;
        rec.dimension = dim;
        return rec;
      })
      .filter(Boolean);
  }

  // insights[].id — sometimes missing. Synthesize a stable one from text.
  if (Array.isArray(obj.insights)) {
    obj.insights = obj.insights
      .map((p: unknown, idx: number) => {
        if (!p || typeof p !== 'object') return null;
        const rec = p as Record<string, unknown>;
        if (typeof rec.text !== 'string' || rec.text.length === 0) return null;
        if (typeof rec.id !== 'string' || rec.id.length === 0) {
          rec.id = `ins-${turnNumber}-${idx}`;
        }
        if (rec.tone !== 'discovery' && rec.tone !== 'tension' && rec.tone !== 'resonance') {
          rec.tone = 'discovery';
        }
        return rec;
      })
      .filter(Boolean);
  }

  const nq = obj.nextQuestion as Record<string, unknown> | null | undefined;
  if (nq && typeof nq === 'object') {
    if (typeof nq.turnIndex !== 'number') nq.turnIndex = turnNumber - 1;

    // polarity axis dimension — reject invented composite labels like "Ti_vs_Fe"
    // and coerce to a real dimension. If we can't recover one, demote the whole
    // question to an open_text fallback so the turn still lands.
    if (nq.type === 'polarity') {
      const axis = nq.axis as Record<string, unknown> | undefined;
      if (axis && typeof axis === 'object') {
        const dim = coerceDimension(axis.dimension);
        if (dim) {
          axis.dimension = dim;
        } else {
          nq.type = 'open_text';
          nq.minWords = 20;
          nq.maxWords = 200;
          nq.placeholder = 'Contame con tus palabras...';
          delete nq.axis;
          delete nq.leftPole;
          delete nq.rightPole;
          nq.probe = { kind: 'open' };
        }
      }
    }

    const probe = nq.probe as Record<string, unknown> | undefined;
    if (probe && typeof probe === 'object') {
      const kind = probe.kind;
      if (kind === 'big_five') {
        if (typeof probe.dimension !== 'string') {
          nq.probe = { kind: 'open' };
        }
      } else if (kind === 'jung') {
        if (typeof probe.func !== 'string') {
          nq.probe = { kind: 'open' };
        }
      } else if (kind === 'archetype') {
        if (typeof probe.candidate !== 'string') {
          nq.probe = { kind: 'open' };
        }
      } else if (kind !== 'open') {
        nq.probe = { kind: 'open' };
      }
    } else {
      nq.probe = { kind: 'open' };
    }
  }

  if (obj.done === true && obj.nextQuestion != null) {
    obj.nextQuestion = null;
  }

  return obj;
}

// ─── Answer schema (used by /api/onboarding/next request body) ───

export const OnboardingAnswerSchema = z.discriminatedUnion('type', [
  z.object({
    questionId: z.string().min(1).max(64),
    type: z.literal('open_text'),
    answeredAt: z.string().min(1).max(64),
    text: z.string().min(1).max(5000),
  }),
  z.object({
    questionId: z.string().min(1).max(64),
    type: z.literal('multi_choice'),
    answeredAt: z.string().min(1).max(64),
    selectedIds: z.array(z.string().min(1).max(16)).min(1).max(6),
  }),
  z.object({
    questionId: z.string().min(1).max(64),
    type: z.literal('scenario'),
    answeredAt: z.string().min(1).max(64),
    selectedId: z.string().min(1).max(16),
  }),
  z.object({
    questionId: z.string().min(1).max(64),
    type: z.literal('ranking'),
    answeredAt: z.string().min(1).max(64),
    orderedIds: z.array(z.string().min(1).max(16)).min(2).max(6),
  }),
  z.object({
    questionId: z.string().min(1).max(64),
    type: z.literal('polarity'),
    answeredAt: z.string().min(1).max(64),
    value: z.number().min(0).max(100),
  }),
  z.object({
    questionId: z.string().min(1).max(64),
    type: z.literal('metaphor'),
    answeredAt: z.string().min(1).max(64),
    selectedId: z.string().min(1).max(16),
  }),
]);

// ─── Fallback canned questions ───

export const FALLBACK_QUESTIONS: OpenTextQuestion[] = [
  {
    id: 'fb-valores',
    turnIndex: 0,
    type: 'open_text',
    prompt: '¿Qué principios guían tus decisiones más importantes?',
    helper: 'Contame lo que te parezca relevante. Sin reglas.',
    probe: { kind: 'open' },
    minWords: 20,
    maxWords: 200,
    placeholder: 'Lo que de verdad te importa...',
  },
  {
    id: 'fb-flow',
    turnIndex: 0,
    type: 'open_text',
    prompt: '¿En qué actividades sentís que entrás en flow?',
    helper: 'Momentos en los que todo fluye.',
    probe: { kind: 'open' },
    minWords: 20,
    maxWords: 200,
    placeholder: 'Cuando se me pasa el tiempo sin darme cuenta...',
  },
  {
    id: 'fb-relaciones',
    turnIndex: 0,
    type: 'open_text',
    prompt: '¿Cómo te relacionás con los demás? ¿Te carga energía o la necesitás recuperar a solas?',
    probe: { kind: 'open' },
    minWords: 20,
    maxWords: 200,
    placeholder: 'Describí tu forma de conectar...',
  },
  {
    id: 'fb-sombras',
    turnIndex: 0,
    type: 'open_text',
    prompt: '¿Qué patrones repetís que te gustaría cambiar?',
    probe: { kind: 'open' },
    minWords: 20,
    maxWords: 200,
    placeholder: 'Sé honesto, esto es para vos...',
  },
];

// ─── Defense-in-depth filter for insights ───

export const BANNED_INSIGHT_RE =
  /\b(trastorno|diagn[oó]stico|mbti|(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP))\b/i;

// ─── Empty working profile (seed) ───

export function emptyWorkingProfile(): WorkingProfile {
  const zeroEstimate = { value: 50, confidence: 0 };
  return {
    bigFive: {
      openness: { ...zeroEstimate },
      conscientiousness: { ...zeroEstimate },
      extraversion: { ...zeroEstimate },
      agreeableness: { ...zeroEstimate },
      neuroticism: { ...zeroEstimate },
    },
    jungFunctions: {
      Se: { ...zeroEstimate },
      Si: { ...zeroEstimate },
      Ne: { ...zeroEstimate },
      Ni: { ...zeroEstimate },
      Te: { ...zeroEstimate },
      Ti: { ...zeroEstimate },
      Fe: { ...zeroEstimate },
      Fi: { ...zeroEstimate },
    },
    archetypeCandidates: [],
    evidence: [],
    turnsAnswered: 0,
    overallConfidence: 0,
  };
}

export function buildFallbackOpenTextQuestion(turnIndex: number, excludeIds: string[]): OpenTextQuestion {
  const pool = FALLBACK_QUESTIONS.filter((q) => !excludeIds.includes(q.id));
  const base = pool[0] ?? FALLBACK_QUESTIONS[0];
  return { ...base, turnIndex };
}
