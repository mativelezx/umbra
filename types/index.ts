// ═══════════════════════════════════════
// UMBRA — Tipos centralizados
// ═══════════════════════════════════════

// ─── Big Five ───
export interface BigFive {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// ─── Jung Cognitive Functions ───
export interface JungFunctions {
  Se: number;
  Si: number;
  Ne: number;
  Ni: number;
  Te: number;
  Ti: number;
  Fe: number;
  Fi: number;
}

// ─── Archetype ───
export type Archetype =
  | 'hero'
  | 'sage'
  | 'explorer'
  | 'creator'
  | 'caregiver'
  | 'rebel';

// ─── Psychological Profile ───
export interface PsychologicalProfile {
  id: string;
  userId: string;
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  archetype: Archetype;
  archetypeSecondary: string;
  analysisRaw?: Record<string, unknown>;
  inputMode: 'guided' | 'freetext';
  inputTexts: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Narrative ───
export interface Narrative {
  id: string;
  userId: string;
  profileId: string;
  content: string;
  createdAt: string;
}

// ─── Chat ───
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  profileSnapshot: PsychologicalProfile | null;
  messages: Message[];
  createdAt: string;
}

// ─── Development Plan ───
export interface MicroGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  microGoals: MicroGoal[];
}

export interface DevelopmentArea {
  id: string;
  name: string;
  rationale: string;
  actions: Action[];
}

export interface DevelopmentPlan {
  id: string;
  userId: string;
  profileId: string;
  areas: DevelopmentArea[];
  createdAt: string;
}

// ─── User Profile (Supabase) ───
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Onboarding ───
export type OnboardingMode = 'guided' | 'freetext';

export interface OnboardingArea {
  key: string;
  label: string;
  question: string;
  placeholder: string;
  icon: string;
}

export const ONBOARDING_AREAS: OnboardingArea[] = [
  {
    key: 'valores',
    label: 'Valores y creencias',
    question:
      '¿Qué principios guían tus decisiones más importantes? ¿Qué es innegociable para vos?',
    placeholder: 'Contame sobre lo que realmente te importa...',
    icon: 'Compass',
  },
  {
    key: 'fortalezas',
    label: 'Fortalezas y talentos',
    question:
      '¿En qué actividades sentís que entrás en flow? ¿Qué te sale naturalmente?',
    placeholder: 'Pensá en momentos donde todo fluye...',
    icon: 'Lightning',
  },
  {
    key: 'relaciones',
    label: 'Relaciones y conexión',
    question:
      '¿Cómo te relacionás con los demás? ¿Te energiza la gente o necesitás recargarte a solas?',
    placeholder: 'Describí tu forma de conectar...',
    icon: 'User',
  },
  {
    key: 'desafios',
    label: 'Desafíos y sombras',
    question:
      '¿Qué patrones repetís que te gustaría cambiar? ¿Qué te cuesta reconocer de vos?',
    placeholder: 'Sé honesto, esto es para vos...',
    icon: 'Eye',
  },
  {
    key: 'aspiraciones',
    label: 'Aspiraciones y futuro',
    question: '¿Quién querés ser en 5 años? ¿Qué versión de vos te inspira?',
    placeholder: 'Imaginá tu mejor versión...',
    icon: 'Path',
  },
];

// ─── Archetype descriptions (UI reference) ───
export const ARCHETYPE_INFO: Record<
  Archetype,
  { name: string; description: string; icon: string }
> = {
  hero: {
    name: 'El Héroe',
    description:
      'Orientado a superar desafíos y probar su valor a través de la acción.',
    icon: 'ShieldStar',
  },
  sage: {
    name: 'El Sabio',
    description:
      'En búsqueda constante de verdad, conocimiento y comprensión profunda.',
    icon: 'Brain',
  },
  explorer: {
    name: 'El Explorador',
    description:
      'Impulsado por el descubrimiento, la libertad y las nuevas experiencias.',
    icon: 'Compass',
  },
  creator: {
    name: 'El Creador',
    description:
      'Necesita dar forma a algo con significado, transformar ideas en realidad.',
    icon: 'Sparkle',
  },
  caregiver: {
    name: 'El Cuidador',
    description:
      'Encuentra propósito en el servicio, la protección y el cuidado de otros.',
    icon: 'Heart',
  },
  rebel: {
    name: 'El Rebelde',
    description:
      'Desafía el status quo y busca transformar lo que no funciona.',
    icon: 'Lightning',
  },
};

// ─── API Payloads ───
export interface AnalyzeRequest {
  texts: string[];
  mode: OnboardingMode;
  areas?: string[];
}

export interface AnalyzeResponse {
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  archetype: Archetype;
  archetypeSecondary: string;
  confidence: number;
  reasoning: string;
}

export interface NarrativeRequest {
  profileId: string;
}

export interface NarrativeResponse {
  narrative: string;
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
}

export interface PlanRequest {
  profileId: string;
}

export interface PlanResponse {
  areas: DevelopmentArea[];
}
