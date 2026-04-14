// types/research.ts

export type UsabilityInstrument =
  | 'umux_lite'
  | 'metux_autonomy'
  | 'metux_competence'
  | 'metux_relatedness'
  | 'cuq'
  | 'sus';

export type MetuxDimension = 'autonomy' | 'competence' | 'relatedness';

export interface UsabilityResponse {
  id: string;
  user_id: string;
  instrument: UsabilityInstrument;
  item_key: string;
  score: number;
  free_text: string | null;
  shown_at: string;
  answered_at: string;
  pepper_version: number;
}

export interface UsabilityResponsePayload {
  instrument: UsabilityInstrument;
  responses: Array<{
    item_key: string;
    score: number;
    free_text?: string;
  }>;
  shown_at: string;
  answered_at: string;
}
