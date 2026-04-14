import type {
  InsightPing,
  OnboardingQuestion,
  OnboardingTurn,
  WorkingProfile,
} from '@/types';
import { emptyWorkingProfile } from '@/lib/prompts/onboarding-conductor';

export interface DemoStep {
  question: OnboardingQuestion;
  workingProfile: WorkingProfile;
  insights: InsightPing[];
  done: boolean;
}

function wp(
  overallConfidence: number,
  bigFive: Partial<
    Record<
      keyof WorkingProfile['bigFive'],
      { value: number; confidence: number }
    >
  >,
  jung: Partial<
    Record<
      keyof WorkingProfile['jungFunctions'],
      { value: number; confidence: number }
    >
  >,
  archetypes: WorkingProfile['archetypeCandidates'],
  turnsAnswered: number,
): WorkingProfile {
  const base = emptyWorkingProfile();
  base.overallConfidence = overallConfidence;
  base.turnsAnswered = turnsAnswered;
  for (const [k, v] of Object.entries(bigFive)) {
    base.bigFive[k as keyof WorkingProfile['bigFive']] = v!;
  }
  for (const [k, v] of Object.entries(jung)) {
    base.jungFunctions[k as keyof WorkingProfile['jungFunctions']] = v!;
  }
  base.archetypeCandidates = archetypes;
  return base;
}

export const DEMO_ONBOARDING_SCRIPT: DemoStep[] = [
  // Turno 1: open_text — apertura
  {
    question: {
      id: 'demo-t1',
      turnIndex: 0,
      type: 'open_text',
      prompt: '¿Qué te pasa cuando todo parece ir bien pero sentís que algo falta?',
      helper: 'No hay respuesta correcta. Escribí lo que te salga.',
      probe: { kind: 'open' },
      minWords: 20,
      maxWords: 200,
      placeholder: 'Lo que vengas pensando...',
    },
    workingProfile: wp(
      15,
      {
        openness: { value: 72, confidence: 35 },
        neuroticism: { value: 55, confidence: 25 },
      },
      { Ni: { value: 60, confidence: 30 } },
      [
        { key: 'sage', confidence: 28, rationale: 'Búsqueda temprana de sentido.' },
      ],
      1,
    ),
    insights: [
      { id: 'i1', text: 'Hay una pregunta abierta debajo de todo.', tone: 'discovery' },
    ],
    done: false,
  },
  // Turno 2: polarity
  {
    question: {
      id: 'demo-t2',
      turnIndex: 1,
      type: 'polarity',
      prompt: '¿Con qué polo te sentís más identificado hoy?',
      probe: { kind: 'big_five', dimension: 'extraversion' },
      axis: { dimension: 'extraversion' },
      leftPole: {
        label: 'Recupero energía a solas',
        meaning: 'baja Extraversion, Introversión dominante',
      },
      rightPole: {
        label: 'Me carga estar con gente',
        meaning: 'alta Extraversion',
      },
    },
    workingProfile: wp(
      28,
      {
        openness: { value: 72, confidence: 38 },
        extraversion: { value: 32, confidence: 55 },
        neuroticism: { value: 55, confidence: 25 },
      },
      {
        Ni: { value: 65, confidence: 40 },
        Ti: { value: 55, confidence: 32 },
      },
      [
        { key: 'sage', confidence: 48, rationale: 'Introversión + apertura + búsqueda de sentido.' },
        { key: 'creator', confidence: 22, rationale: 'Ligera tendencia a la visión interna.' },
      ],
      2,
    ),
    insights: [
      { id: 'i2', text: 'Introversión con mundo interior activo.', tone: 'resonance' },
    ],
    done: false,
  },
  // Turno 3: multi_choice
  {
    question: {
      id: 'demo-t3',
      turnIndex: 2,
      type: 'multi_choice',
      prompt: '¿Cuál de estos te representa más cuando tomás una decisión difícil?',
      probe: { kind: 'jung', func: 'Ti' },
      allowMultiple: false,
      options: [
        {
          id: 'a',
          label: 'Analizo hasta entender la lógica interna del problema',
          meaning: 'alta Ti, búsqueda de coherencia interna',
          iconHint: 'Brain',
        },
        {
          id: 'b',
          label: 'Pido opinión a gente de confianza',
          meaning: 'alta Fe, orientación a consenso',
          iconHint: 'UsersThree',
        },
        {
          id: 'c',
          label: 'Escucho qué se alinea con mis valores',
          meaning: 'alta Fi, criterio interno de valores',
          iconHint: 'Heart',
        },
        {
          id: 'd',
          label: 'Pruebo y ajusto sobre la marcha',
          meaning: 'alta Se, aprendizaje empírico',
          iconHint: 'Lightning',
        },
      ],
    },
    workingProfile: wp(
      42,
      {
        openness: { value: 75, confidence: 55 },
        extraversion: { value: 32, confidence: 60 },
        neuroticism: { value: 52, confidence: 30 },
      },
      {
        Ni: { value: 68, confidence: 50 },
        Ti: { value: 72, confidence: 55 },
        Fe: { value: 35, confidence: 40 },
      },
      [
        { key: 'sage', confidence: 62, rationale: 'Ti dominante + introversión.' },
        { key: 'creator', confidence: 28, rationale: 'Visión interna marcada.' },
      ],
      3,
    ),
    insights: [
      { id: 'i3', text: 'Tu Ti aparece cuando hay un problema complejo.', tone: 'discovery' },
    ],
    done: false,
  },
  // Turno 4: scenario
  {
    question: {
      id: 'demo-t4',
      turnIndex: 3,
      type: 'scenario',
      prompt: 'Imaginate esta situación',
      probe: { kind: 'archetype', candidate: 'sage' },
      scene:
        'Una amiga cercana te cuenta que va a renunciar para emprender algo sin plan claro. Te pide tu opinión sincera. ¿Qué hacés?',
      options: [
        {
          id: 'a',
          label: 'Le señalo los riesgos que veo, sin filtro',
          meaning: 'alta Ti + baja Agreeableness, crítica directa',
          iconHint: 'Eye',
        },
        {
          id: 'b',
          label: 'La bancó emocionalmente antes de opinar',
          meaning: 'alta Fe + Agreeableness, orientación relacional',
          iconHint: 'Heart',
        },
        {
          id: 'c',
          label: 'Le hago preguntas para que lo piense más',
          meaning: 'Ni + Ti, exploración reflexiva',
          iconHint: 'Question',
        },
        {
          id: 'd',
          label: 'Le digo que pruebe, la vida es corta',
          meaning: 'alta Se + Openness, impulso a la acción',
          iconHint: 'Lightning',
        },
      ],
    },
    workingProfile: wp(
      58,
      {
        openness: { value: 78, confidence: 65 },
        conscientiousness: { value: 60, confidence: 55 },
        extraversion: { value: 30, confidence: 68 },
        agreeableness: { value: 62, confidence: 50 },
        neuroticism: { value: 52, confidence: 42 },
      },
      {
        Ni: { value: 75, confidence: 65 },
        Ti: { value: 72, confidence: 60 },
        Fe: { value: 40, confidence: 45 },
        Fi: { value: 58, confidence: 40 },
      },
      [
        { key: 'sage', confidence: 72, rationale: 'Reflexión + Ti + Ni fuerte.' },
        { key: 'creator', confidence: 35, rationale: 'Openness + visión interna.' },
        { key: 'caregiver', confidence: 18, rationale: 'Ligera orientación relacional.' },
      ],
      4,
    ),
    insights: [
      { id: 'i4', text: 'Pensás antes de aconsejar. Clásico del Sabio.', tone: 'resonance' },
      { id: 'i5', text: 'Tu Ni arma el mapa completo de las situaciones.', tone: 'discovery' },
    ],
    done: false,
  },
  // Turno 5: metaphor
  {
    question: {
      id: 'demo-t5',
      turnIndex: 4,
      type: 'metaphor',
      prompt: 'Elegí la imagen que más te represente en este momento de tu vida',
      probe: { kind: 'open' },
      instruction: 'No lo pienses mucho. La primera que resuene.',
      cards: [
        {
          id: 'a',
          title: 'El faro',
          description: 'Fijo, visible a la distancia, con luz propia.',
          iconHint: 'Lighthouse',
          meaning: 'alta Ni + baja Extraversion, referente introspectivo',
        },
        {
          id: 'b',
          title: 'El río',
          description: 'Se adapta, fluye, encuentra siempre un camino.',
          iconHint: 'Waves',
          meaning: 'alta Openness + adaptabilidad',
        },
        {
          id: 'c',
          title: 'El bosque',
          description: 'Raíces profundas, diverso, refugio de muchos.',
          iconHint: 'Tree',
          meaning: 'alta Agreeableness + Si, contención',
        },
        {
          id: 'd',
          title: 'La brújula',
          description: 'Orienta, no da la respuesta, invita a decidir.',
          iconHint: 'Compass',
          meaning: 'alta Ti + Fi, claridad interna',
        },
      ],
    },
    workingProfile: wp(
      68,
      {
        openness: { value: 80, confidence: 72 },
        conscientiousness: { value: 62, confidence: 60 },
        extraversion: { value: 28, confidence: 72 },
        agreeableness: { value: 60, confidence: 58 },
        neuroticism: { value: 50, confidence: 50 },
      },
      {
        Ni: { value: 80, confidence: 72 },
        Ti: { value: 74, confidence: 68 },
        Fi: { value: 62, confidence: 48 },
        Fe: { value: 38, confidence: 50 },
      },
      [
        { key: 'sage', confidence: 80, rationale: 'El faro confirma el patrón reflexivo.' },
        { key: 'creator', confidence: 38, rationale: 'Visión estructurada interna.' },
      ],
      5,
    ),
    insights: [
      { id: 'i6', text: 'El faro: tu imagen refuerza la visión larga.', tone: 'resonance' },
    ],
    done: false,
  },
  // Turno 6: ranking
  {
    question: {
      id: 'demo-t6',
      turnIndex: 5,
      type: 'ranking',
      prompt: 'Ordená estos valores de lo más a lo menos importante para vos',
      probe: { kind: 'big_five', dimension: 'openness' },
      instruction: 'Tocá en el orden que te salga.',
      items: [
        { id: 'a', label: 'Comprender', meaning: 'alta Openness + Ti' },
        { id: 'b', label: 'Cuidar', meaning: 'alta Agreeableness + Fe' },
        { id: 'c', label: 'Crear', meaning: 'alta Openness + Ni' },
        { id: 'd', label: 'Lograr', meaning: 'alta Conscientiousness + Te' },
      ],
    },
    workingProfile: wp(
      74,
      {
        openness: { value: 82, confidence: 78 },
        conscientiousness: { value: 64, confidence: 65 },
        extraversion: { value: 28, confidence: 75 },
        agreeableness: { value: 62, confidence: 62 },
        neuroticism: { value: 50, confidence: 55 },
      },
      {
        Ni: { value: 82, confidence: 78 },
        Ti: { value: 76, confidence: 72 },
        Fi: { value: 64, confidence: 55 },
        Fe: { value: 38, confidence: 55 },
      },
      [
        { key: 'sage', confidence: 85, rationale: '"Comprender" primero consolida el patrón.' },
        { key: 'creator', confidence: 42, rationale: '"Crear" segundo reafirma la visión.' },
      ],
      6,
    ),
    insights: [
      { id: 'i7', text: 'Comprender te mueve más que lograr.', tone: 'discovery' },
    ],
    done: false,
  },
  // Turno 7: multi_choice — test de confirmación
  {
    question: {
      id: 'demo-t7',
      turnIndex: 6,
      type: 'multi_choice',
      prompt: '¿Qué te genera más incomodidad?',
      probe: { kind: 'archetype', candidate: 'sage' },
      allowMultiple: false,
      options: [
        {
          id: 'a',
          label: 'Tener una certeza falsa sin darme cuenta',
          meaning: 'miedo central del Sabio',
          iconHint: 'Eye',
        },
        {
          id: 'b',
          label: 'No poder ayudar a alguien que lo necesita',
          meaning: 'miedo central del Cuidador',
          iconHint: 'Heart',
        },
        {
          id: 'c',
          label: 'Quedarme atrapado en la rutina',
          meaning: 'miedo central del Explorador',
          iconHint: 'Compass',
        },
      ],
    },
    workingProfile: wp(
      82,
      {
        openness: { value: 82, confidence: 82 },
        conscientiousness: { value: 64, confidence: 70 },
        extraversion: { value: 28, confidence: 80 },
        agreeableness: { value: 62, confidence: 65 },
        neuroticism: { value: 50, confidence: 60 },
      },
      {
        Ni: { value: 84, confidence: 82 },
        Ti: { value: 78, confidence: 78 },
        Fi: { value: 65, confidence: 60 },
        Fe: { value: 38, confidence: 60 },
      },
      [
        { key: 'sage', confidence: 90, rationale: 'Miedo central al engaño confirma Sabio.' },
        { key: 'creator', confidence: 44, rationale: 'Arquetipo secundario estable.' },
      ],
      7,
    ),
    insights: [
      { id: 'i8', text: 'El miedo al autoengaño confirma al Sabio.', tone: 'resonance' },
    ],
    done: false,
  },
  // Turno 8: open_text final + done
  {
    question: {
      id: 'demo-t8',
      turnIndex: 7,
      type: 'open_text',
      prompt: '¿Qué pregunta te gustaría poder responder al final de este proceso?',
      helper: 'Última parada.',
      probe: { kind: 'open' },
      minWords: 10,
      maxWords: 150,
      placeholder: 'La que te viene ahora...',
    },
    workingProfile: wp(
      88,
      {
        openness: { value: 84, confidence: 88 },
        conscientiousness: { value: 66, confidence: 78 },
        extraversion: { value: 28, confidence: 85 },
        agreeableness: { value: 62, confidence: 72 },
        neuroticism: { value: 48, confidence: 68 },
      },
      {
        Ni: { value: 86, confidence: 88 },
        Ti: { value: 80, confidence: 84 },
        Fi: { value: 66, confidence: 65 },
        Fe: { value: 38, confidence: 65 },
      },
      [
        { key: 'sage', confidence: 92, rationale: 'Perfil Sabio consolidado.' },
        { key: 'creator', confidence: 48, rationale: 'Arquetipo secundario.' },
      ],
      8,
    ),
    insights: [
      { id: 'i9', text: 'Listo: estamos uniendo todo.', tone: 'resonance' },
    ],
    done: true,
  },
];

export const DEMO_FINAL_TRANSCRIPT_SEED: OnboardingTurn[] = DEMO_ONBOARDING_SCRIPT.map(
  (s) => ({
    question: s.question,
    answer: null,
    signals: [],
    insights: s.insights.map((i) => i.text),
  }),
);
