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
        modelVersion: 'explicit-test-model',
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

  it('no habilita cifras cuando falta evidencia para español', () => {
    expect(quantitativeDimensions(extractPerDimensionStatus(null))).toEqual([]);
    expect(quantitativeDimensions(RIDGE_V1_STATUS)).toEqual([]);
  });

  it('no reactiva un ok histórico de ridge_v1 obtenido del corpus inglés', () => {
    const status = extractPerDimensionStatus({ ml: {
      modelVersion: 'ridge_v1',
      perDimensionStatus: { openness: 'ok' },
    } });
    expect(quantitativeDimensions(status)).toEqual([]);
  });
});

describe('quantitativeDimensions (HU-06: el componente cuantitativo solo integra dimensiones ok)', () => {
  it('filtra exclusivamente las dimensiones en estado ok', () => {
    const st = { ...RIDGE_V1_STATUS, conscientiousness: 'ok' as const };
    expect(quantitativeDimensions(st)).toEqual(['conscientiousness']);
  });

  it('devuelve vacío si ninguna dimensión sostiene su valor', () => {
    const none = Object.fromEntries(
      BIG_FIVE_KEYS.map((k) => [k, 'low_confidence' as const]),
    ) as typeof RIDGE_V1_STATUS;
    expect(quantitativeDimensions(none)).toEqual([]);
  });
});

describe('coherencia con la evaluación versionada del repositorio (HU-06)', () => {
  it('la clasificación inglesa no habilita cifras del runtime español', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const evalMetrics = JSON.parse(
      readFileSync(resolve(process.cwd(), 'ml/eval_metrics.json'), 'utf-8'),
    ) as {
      blocks: {
        english_only: {
          n_samples: number;
          per_dimension_classification_status: Record<string, string>;
        };
        latinoamericano_only: { n_samples: number };
      };
    };
    expect(evalMetrics.blocks.english_only.per_dimension_classification_status.openness).toBe('ok');
    expect(evalMetrics.blocks.latinoamericano_only.n_samples).toBe(2);
    expect(quantitativeDimensions(RIDGE_V1_STATUS)).toEqual([]);
  });
});
