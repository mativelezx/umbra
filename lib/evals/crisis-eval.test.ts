/**
 * Crisis classifier eval — dataset integrity + metrics computation tests.
 *
 * This test file does NOT call the LLM. The actual recall/precision run
 * lives in `scripts/run-crisis-eval.ts` and is invoked manually via
 * `pnpm exec tsx scripts/run-crisis-eval.ts`, which writes a JSON report to
 * `eval-results/crisis-YYYYMMDD.json`.
 *
 * These unit tests verify:
 *   1. Dataset integrity — 100 cases, 25 per category, valid labels,
 *      all text is non-empty, no accidental duplicates, IDs are unique.
 *   2. Label consistency — real_crisis => expected_is_crisis=true,
 *      idiom/borderline/safe => expected_is_crisis=false.
 *   3. Severity consistency — only real_crisis has non-null severity;
 *      other categories have severity=null.
 *
 * The operational pass criterion (recall >= 0.95, precision >= 0.85) is
 * checked against the committed JSON report in `eval-results/` in a
 * separate CI job, not here — this file is fast and deterministic.
 */

import { describe, it, expect } from 'vitest';
import {
  CRISIS_EVAL_CASES,
  type CrisisEvalCase,
} from './crisis-dataset';

describe('crisis-dataset integrity', () => {
  it('has exactly 100 cases', () => {
    expect(CRISIS_EVAL_CASES).toHaveLength(100);
  });

  it('has 25 cases per category (balanced)', () => {
    const categories = ['real_crisis', 'idiom', 'borderline', 'safe'] as const;
    for (const category of categories) {
      const subset = CRISIS_EVAL_CASES.filter((c) => c.category === category);
      expect(subset).toHaveLength(25);
    }
  });

  it('has unique ids with the expected prefix per category', () => {
    const seen = new Set<string>();
    for (const c of CRISIS_EVAL_CASES) {
      expect(seen.has(c.id)).toBe(false);
      seen.add(c.id);
    }
    const prefixMap: Record<CrisisEvalCase['category'], string> = {
      real_crisis: 'rc-',
      idiom: 'id-',
      borderline: 'bd-',
      safe: 'sf-',
    };
    for (const c of CRISIS_EVAL_CASES) {
      expect(c.id.startsWith(prefixMap[c.category])).toBe(true);
    }
  });

  it('has non-empty text and rationale on every case', () => {
    for (const c of CRISIS_EVAL_CASES) {
      expect(c.text.length).toBeGreaterThanOrEqual(20);
      expect(c.rationale.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('has consistent expected_is_crisis by category', () => {
    for (const c of CRISIS_EVAL_CASES) {
      if (c.category === 'real_crisis') {
        expect(c.expected_is_crisis).toBe(true);
      } else {
        expect(c.expected_is_crisis).toBe(false);
      }
    }
  });

  it('has expected_severity only for real_crisis', () => {
    for (const c of CRISIS_EVAL_CASES) {
      if (c.category === 'real_crisis') {
        expect(c.expected_severity).not.toBe(null);
        expect(['low', 'med', 'high']).toContain(c.expected_severity);
      } else {
        expect(c.expected_severity).toBe(null);
      }
    }
  });

  it('has a severity distribution covering all three levels for real_crisis', () => {
    const reals = CRISIS_EVAL_CASES.filter((c) => c.category === 'real_crisis');
    const severities = new Set(reals.map((c) => c.expected_severity));
    // Must touch all severity levels to be a meaningful dataset
    expect(severities.has('low')).toBe(true);
    expect(severities.has('med')).toBe(true);
    expect(severities.has('high')).toBe(true);
  });

  it('has no obvious near-duplicates (normalized text uniqueness)', () => {
    const normalized = new Set<string>();
    for (const c of CRISIS_EVAL_CASES) {
      const key = c.text.toLowerCase().replace(/\s+/g, ' ').trim();
      expect(normalized.has(key)).toBe(false);
      normalized.add(key);
    }
  });
});
