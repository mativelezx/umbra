import { describe, it, expect } from 'vitest';
import {
  extractPerDimensionStatus,
  quantitativeDimensions,
  RIDGE_V1_STATUS,
  BIG_FIVE_KEYS,
} from './dimension-display';

describe('extractPerDimensionStatus', () => {
  it('lee el estado persistido en analysis_raw.ml.perDimensionStatus', () => {
    const raw = {
      confidence: 80,
      ml: {
        modelVersion: 'ridge_v1',
        perDimensionStatus: {
          openness: 'ok',
          conscientiousness: 'low_confidence',
          extraversion: 'not_applicable',
          agreeableness: 'low_confidence',
          neuroticism: 'not_applicable',
        },
      },
    };
    expect(extractPerDimensionStatus(raw)).toEqual({
      openness: 'ok',
      conscientiousness: 'low_confidence',
      extraversion: 'not_applicable',
      agreeableness: 'low_confidence',
      neuroticism: 'not_applicable',
    });
  });

  it('cae al estado del artefacto en producción cuando falta el bloque ml (perfiles previos)', () => {
    expect(extractPerDimensionStatus({ confidence: 70 })).toEqual(RIDGE_V1_STATUS);
    expect(extractPerDimensionStatus(null)).toEqual(RIDGE_V1_STATUS);
    expect(extractPerDimensionStatus(undefined)).toEqual(RIDGE_V1_STATUS);
  });

  it('nunca degrada a "todo ok" ante valores corruptos', () => {
    const raw = {
      ml: { perDimensionStatus: { openness: 'yes', agreeableness: 42 } },
    };
    const st = extractPerDimensionStatus(raw);
    expect(st).toEqual(RIDGE_V1_STATUS);
  });

  it('el respaldo del artefacto solo tiene apertura en estado ok (coherente con eval_metrics.json)', () => {
    expect(quantitativeDimensions(RIDGE_V1_STATUS)).toEqual(['openness']);
  });
});

describe('quantitativeDimensions (HU-06: el componente cuantitativo solo integra dimensiones ok)', () => {
  it('filtra exclusivamente las dimensiones en estado ok', () => {
    const st = { ...RIDGE_V1_STATUS, conscientiousness: 'ok' as const };
    expect(quantitativeDimensions(st)).toEqual(['openness', 'conscientiousness']);
  });

  it('devuelve vacío si ninguna dimensión sostiene su valor', () => {
    const none = Object.fromEntries(
      BIG_FIVE_KEYS.map((k) => [k, 'low_confidence' as const]),
    ) as typeof RIDGE_V1_STATUS;
    expect(quantitativeDimensions(none)).toEqual([]);
  });
});
