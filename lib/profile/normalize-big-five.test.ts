import { expect, it } from 'vitest';
import { normalizeBigFiveForStorage } from './normalize-big-five';

it('adapts validated ML decimals to the existing integer score columns', () => {
  const raw = { openness: 43.94, conscientiousness: 62.1, extraversion: 25.5, agreeableness: 99.99, neuroticism: 0.04 };
  expect(normalizeBigFiveForStorage(raw)).toEqual({ openness: 44, conscientiousness: 62, extraversion: 26, agreeableness: 100, neuroticism: 0 });
  expect(raw.openness).toBe(43.94);
});

it('preserves already integral endpoints and midpoint', () => {
  const scores = { openness: 0, conscientiousness: 100, extraversion: 50, agreeableness: 25, neuroticism: 75 };
  expect(normalizeBigFiveForStorage(scores)).toEqual(scores);
});
