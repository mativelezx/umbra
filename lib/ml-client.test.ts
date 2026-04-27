import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  inferBigFive,
  isMlApiHealthy,
  MlApiUnavailableError,
  MlApiError,
} from './ml-client';

const ORIGINAL_FETCH = globalThis.fetch;
const ORIGINAL_ENV = process.env.ML_API_URL;

beforeEach(() => {
  process.env.ML_API_URL = 'http://test.ml';
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  process.env.ML_API_URL = ORIGINAL_ENV;
  vi.restoreAllMocks();
});

function mockFetch(
  status: number,
  body: unknown,
  contentType = 'application/json',
): typeof fetch {
  return vi.fn(async () =>
    new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': contentType },
    }),
  ) as unknown as typeof fetch;
}

describe('inferBigFive', () => {
  it('parses a healthy big_five payload + per_dimension_status', async () => {
    globalThis.fetch = mockFetch(200, {
      big_five: {
        openness: 72,
        conscientiousness: 55,
        extraversion: 30,
        agreeableness: 68,
        neuroticism: 48,
      },
      per_dimension_status: {
        openness: 'ok',
        conscientiousness: 'ok',
        extraversion: 'low_confidence',
        agreeableness: 'ok',
        neuroticism: 'low_confidence',
      },
      model_version: 'ridge_v1',
      elapsed_ms: 412,
    });

    const r = await inferBigFive('un texto introspectivo cualquiera');
    expect(r.bigFive.openness).toBe(72);
    expect(r.bigFive.extraversion).toBe(30);
    expect(r.perDimensionStatus.openness).toBe('ok');
    expect(r.perDimensionStatus.extraversion).toBe('low_confidence');
    expect(r.modelVersion).toBe('ridge_v1');
    expect(r.elapsedMs).toBe(412);
  });

  it('clamps values to 0-100', async () => {
    globalThis.fetch = mockFetch(200, {
      big_five: {
        openness: 250,
        conscientiousness: -50,
        extraversion: 'NaN',
        agreeableness: 50,
        neuroticism: 50,
      },
      per_dimension_status: {
        openness: 'ok',
        conscientiousness: 'ok',
        extraversion: 'ok',
        agreeableness: 'ok',
        neuroticism: 'ok',
      },
    });
    const r = await inferBigFive('x');
    expect(r.bigFive.openness).toBe(100);
    expect(r.bigFive.conscientiousness).toBe(0);
    expect(r.bigFive.extraversion).toBe(50); // NaN → default 50
  });

  it('marks dimensions as low_confidence by default if missing', async () => {
    globalThis.fetch = mockFetch(200, {
      big_five: {
        openness: 60,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
      },
      // no per_dimension_status
    });
    const r = await inferBigFive('x');
    expect(r.perDimensionStatus.openness).toBe('low_confidence');
    expect(r.perDimensionStatus.neuroticism).toBe('low_confidence');
  });

  it('throws MlApiUnavailableError on HTTP 503', async () => {
    globalThis.fetch = mockFetch(503, { error: 'model_not_loaded' });
    await expect(inferBigFive('x')).rejects.toBeInstanceOf(MlApiUnavailableError);
  });

  it('throws MlApiUnavailableError on HTTP 502', async () => {
    globalThis.fetch = mockFetch(502, { error: 'gateway' });
    await expect(inferBigFive('x')).rejects.toBeInstanceOf(MlApiUnavailableError);
  });

  it('throws MlApiUnavailableError on network error', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    await expect(inferBigFive('x')).rejects.toBeInstanceOf(MlApiUnavailableError);
  });

  it('throws MlApiError on HTTP 400 with payload preserved', async () => {
    globalThis.fetch = mockFetch(400, { error: 'text_too_short' });
    await expect(inferBigFive('x')).rejects.toBeInstanceOf(MlApiError);
  });
});

describe('isMlApiHealthy', () => {
  it('returns true when /health returns ok:true', async () => {
    globalThis.fetch = mockFetch(200, { ok: true });
    expect(await isMlApiHealthy()).toBe(true);
  });

  it('returns false on HTTP 503', async () => {
    globalThis.fetch = mockFetch(503, { ok: false });
    expect(await isMlApiHealthy()).toBe(false);
  });

  it('returns false on network error', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('connection refused');
    }) as unknown as typeof fetch;
    expect(await isMlApiHealthy()).toBe(false);
  });
});
