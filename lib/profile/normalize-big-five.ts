import type { BigFive } from '@/types';

/** ML validates the 0–100 range; the existing profile columns store integers.
 * Rounding here adapts persistence, without changing the model or its confidence.
 */
export function normalizeBigFiveForStorage(scores: BigFive): BigFive {
  return {
    openness: Math.round(scores.openness),
    conscientiousness: Math.round(scores.conscientiousness),
    extraversion: Math.round(scores.extraversion),
    agreeableness: Math.round(scores.agreeableness),
    neuroticism: Math.round(scores.neuroticism),
  };
}
