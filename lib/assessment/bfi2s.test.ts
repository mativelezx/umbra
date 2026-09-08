import { describe, expect, it } from 'vitest';
import { BFI2S_ITEMS, BFI2S_KEY, createSelfReport, extractSelfReport, scoreBfi2s } from './bfi2s';

describe('published Spanish BFI-2-S domain scoring', () => {
  it('covers each of the 30 items exactly once, with six items per domain', () => {
    expect(BFI2S_ITEMS).toHaveLength(30);
    Object.values(BFI2S_KEY).forEach(key => expect(key).toHaveLength(6));
    expect(Object.values(BFI2S_KEY).flat().map(Math.abs).sort((a,b) => a-b)).toEqual(Array.from({length:30}, (_,i) => i+1));
  });
  it('keeps neutral answers at 3 without treating them as missing', () => {
    expect(Object.values(scoreBfi2s(Array(30).fill(3)))).toEqual([3,3,3,3,3]);
  });
  it.each([1,5])('handles polarity for every domain at endpoint %i', endpoint => {
    const answers = Array<number>(30).fill(3);
    for (const items of Object.values(BFI2S_KEY)) for (const item of items) answers[Math.abs(item)-1] = item < 0 ? 6-endpoint : endpoint;
    expect(Object.values(scoreBfi2s(answers))).toEqual(Array(5).fill(endpoint));
  });
  it('uses the published key for an asymmetric hand-calculated example', () => {
    const scores = scoreBfi2s(Array.from({length:30}, (_,i) => i%5+1));
    // Example Extraversion: 6-5 + 2 + 5 + 1 + (6-4) + (6-3) = 14.
    expect(scores).toEqual({ openness: 22/6, conscientiousness: 17/6, extraversion: 14/6, agreeableness: 15/6, neuroticism: 14/6 });
  });
  it.each([[], Array(29).fill(3), Array(31).fill(3), Array(30).fill(0), Array(30).fill(6), Array(30).fill(2.5), Array(30).fill('3'), Array(30).fill(NaN), Array(30).fill(null)])('rejects invalid or incomplete responses', answers => {
    expect(() => scoreBfi2s(answers)).toThrow();
  });
  it('keeps self-report separate and recomputes stored scores', () => {
    const report = createSelfReport(Array(30).fill(3), '2026-09-07T00:00:00.000Z');
    const raw = { ml: { modelVersion: 'ridge_v1' }, selfReport: { ...report, scores: { openness: 99 } } };
    expect(extractSelfReport(raw)?.scores.openness).toBe(3);
    expect(extractSelfReport(raw)?.researchUse).toBe(false);
    expect(raw.ml.modelVersion).toBe('ridge_v1');
    expect(extractSelfReport({ selfReport: { ...report, instrument: 'invented' } })).toBeNull();
  });
});
