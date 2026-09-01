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
  inputMode: OnboardingMode;
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

// ─── Onboarding (Dynamic) ───
export type OnboardingMode = 'dynamic';

export type InteractionType =
  | 'open_text'
  | 'multi_choice'
  | 'scenario'
  | 'ranking'
  | 'polarity'
  | 'metaphor';

export type BigFiveDimension =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'neuroticism';

export type JungFunctionKey =
  | 'Se'
  | 'Si'
  | 'Ne'
  | 'Ni'
  | 'Te'
  | 'Ti'
  | 'Fe'
  | 'Fi';

export type ProfileDimension = BigFiveDimension | JungFunctionKey;

export type ProbeTarget =
  | { kind: 'big_five'; dimension: BigFiveDimension }
  | { kind: 'jung'; func: JungFunctionKey }
  | { kind: 'archetype'; candidate: Archetype }
  | { kind: 'open' };

interface OnboardingQuestionBase {
  id: string;
  turnIndex: number;
  type: InteractionType;
  prompt: string;
  helper?: string;
  probe: ProbeTarget;
}

export interface OpenTextQuestion extends OnboardingQuestionBase {
  type: 'open_text';
  minWords: number;
  maxWords: number;
  placeholder: string;
}

export interface MultiChoiceOption {
  id: string;
  label: string;
  meaning: string;
  iconHint?: string;
}

export interface MultiChoiceQuestion extends OnboardingQuestionBase {
  type: 'multi_choice';
  options: MultiChoiceOption[];
  allowMultiple: boolean;
}

export interface ScenarioQuestion extends OnboardingQuestionBase {
  type: 'scenario';
  scene: string;
  options: MultiChoiceOption[];
}

export interface RankingItem {
  id: string;
  label: string;
  meaning: string;
}

export interface RankingQuestion extends OnboardingQuestionBase {
  type: 'ranking';
  items: RankingItem[];
  instruction: string;
}

export interface PolarityQuestion extends OnboardingQuestionBase {
  type: 'polarity';
  axis: { dimension: ProfileDimension; invert?: boolean };
  leftPole: { label: string; meaning: string };
  rightPole: { label: string; meaning: string };
}

export interface MetaphorCard {
  id: string;
  title: string;
  description: string;
  iconHint: string;
  meaning: string;
}

export interface MetaphorQuestion extends OnboardingQuestionBase {
  type: 'metaphor';
  cards: MetaphorCard[];
  instruction: string;
}

export type OnboardingQuestion =
  | OpenTextQuestion
  | MultiChoiceQuestion
  | ScenarioQuestion
  | RankingQuestion
  | PolarityQuestion
  | MetaphorQuestion;

interface AnswerBase {
  questionId: string;
  type: InteractionType;
  answeredAt: string;
}

export interface OpenTextAnswer extends AnswerBase {
  type: 'open_text';
  text: string;
}
export interface MultiChoiceAnswer extends AnswerBase {
  type: 'multi_choice';
  selectedIds: string[];
}
export interface ScenarioAnswer extends AnswerBase {
  type: 'scenario';
  selectedId: string;
}
export interface RankingAnswer extends AnswerBase {
  type: 'ranking';
  orderedIds: string[];
}
export interface PolarityAnswer extends AnswerBase {
  type: 'polarity';
  value: number;
}
export interface MetaphorAnswer extends AnswerBase {
  type: 'metaphor';
  selectedId: string;
}

export type OnboardingAnswer =
  | OpenTextAnswer
  | MultiChoiceAnswer
  | ScenarioAnswer
  | RankingAnswer
  | PolarityAnswer
  | MetaphorAnswer;

export interface DimensionEstimate {
  value: number;
  confidence: number;
}

export interface ArchetypeCandidate {
  key: Archetype;
  confidence: number;
  rationale: string;
}

export interface EvidenceQuote {
  text: string;
  source: 'user_text' | 'choice';
  questionId: string;
}

export interface WorkingProfile {
  bigFive: Record<BigFiveDimension, DimensionEstimate>;
  jungFunctions: Record<JungFunctionKey, DimensionEstimate>;
  archetypeCandidates: ArchetypeCandidate[];
  evidence: EvidenceQuote[];
  turnsAnswered: number;
  overallConfidence: number;
}

export interface OnboardingSignal {
  dimension: ProfileDimension;
  direction: 'high' | 'low';
  strength: number;
  source: { questionId: string; quote?: string; choiceId?: string };
}

export interface OnboardingTurn {
  question: OnboardingQuestion;
  answer: OnboardingAnswer | null;
  signals: OnboardingSignal[];
  insights: string[];
}

export type InsightTone = 'discovery' | 'tension' | 'resonance';

export interface InsightPing {
  id: string;
  text: string;
  tone: InsightTone;
}

export type OnboardingSessionStatus =
  | 'in_progress'
  | 'completed'
  | 'abandoned';

export interface OnboardingSessionState {
  sessionId: string;
  status: OnboardingSessionStatus;
  turns: OnboardingTurn[];
  workingProfile: WorkingProfile;
  flags: Record<string, unknown>;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OnboardingNextRequest {
  sessionId: string | null;
  previousAnswer: OnboardingAnswer | null;
}

export interface OnboardingNextResponse {
  sessionId: string;
  turn: OnboardingTurn;
  workingProfile: WorkingProfile;
  insights: InsightPing[];
  done: boolean;
  turnNumber: number;
  maxTurns: number;
}

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

export interface AnalyzeSuccess extends AnalyzeResponse {
  profileId: string;
}

export interface AnalyzeResponse {
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  archetype: Archetype;
  archetypeSecondary: string;
  confidence: number;
  reasoning: string;
  /**
   * Dimension-by-dimension confidence flag from the ML module
   * (ADR-027). Only dimensions in `ok` state show their numeric value
   * in the dashboard's quantitative component; `low_confidence` and
   * `not_applicable` dimensions are declared with their state instead
   * of a figure (see lib/profile/dimension-display.ts).
   */
  perDimensionStatus?: Record<keyof BigFive, 'ok' | 'low_confidence' | 'not_applicable'>;
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
