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
  vi.unstubAllEnvs();
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
  it('sends the private service key only in the server request header', async () => {
    vi.stubEnv('ML_API_KEY', 'synthetic-test-key');
    globalThis.fetch = mockFetch(503, {});
    await expect(inferBigFive('synthetic QA text')).rejects.toBeInstanceOf(MlApiUnavailableError);
    expect(globalThis.fetch).toHaveBeenCalledWith('http://test.ml/infer', expect.objectContaining({
      headers: { 'Content-Type': 'application/json', 'X-ML-API-Key': 'synthetic-test-key' },
      body: JSON.stringify({ text: 'synthetic QA text' }),
    }));
  });

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

  it.each([250, -50, 'NaN', '50', null, true, undefined])('rejects an invalid score instead of inventing a value: %s', async (score) => {
    globalThis.fetch = mockFetch(200, {
      big_five: {
        openness: score,
        conscientiousness: 55,
        extraversion: 30,
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
      model_version: 'ridge_v1',
      elapsed_ms: 10,
    });
    await expect(inferBigFive('x')).rejects.toBeInstanceOf(MlApiError);
  });

  it.each([{}, [], null, { big_five: [] }, { big_five: {} }])('rejects incomplete response bodies: %j', async (body) => {
    globalThis.fetch = mockFetch(200, body);
    await expect(inferBigFive('x')).rejects.toBeInstanceOf(MlApiError);
  });

  it('classifies invalid JSON as an ML response error', async () => {
    globalThis.fetch = mockFetch(200, '<html>not JSON</html>', 'text/html');
    await expect(inferBigFive('x')).rejects.toBeInstanceOf(MlApiError);
  });

  it.each([{ model_version: '' }, { model_version: null }, { elapsed_ms: -1 }, { elapsed_ms: '5' }, { elapsed_ms: 1.5 }])('rejects invalid response metadata: %j', async (invalid) => {
    globalThis.fetch = mockFetch(200, {
      big_five: { openness: 60, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
      model_version: 'ridge_v1', elapsed_ms: 10, ...invalid,
    });
    await expect(inferBigFive('x')).rejects.toBeInstanceOf(MlApiError);
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
      model_version: 'ridge_v1',
      elapsed_ms: 10,
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
  it('returns true only when the service is alive and its weights are loaded', async () => {
    globalThis.fetch = mockFetch(200, { ok: true, model_loaded: true });
    expect(await isMlApiHealthy()).toBe(true);
  });

  it.each([{ ok: true }, { ok: true, model_loaded: false }, { ok: 'true', model_loaded: true }, { ok: true, model_loaded: 'true' }])('rejects liveness without explicit weight readiness: %j', async (body) => {
    globalThis.fetch = mockFetch(200, body);
    expect(await isMlApiHealthy()).toBe(false);
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
  it('preserva not_applicable sin colapsarlo a low_confidence', async () => {
    globalThis.fetch = mockFetch(200, {
      big_five: {
        openness: 61,
        conscientiousness: 54,
        extraversion: 71,
        agreeableness: 58,
        neuroticism: 33,
      },
      per_dimension_status: {
        openness: 'ok',
        conscientiousness: 'low_confidence',
        extraversion: 'not_applicable',
        agreeableness: 'low_confidence',
        neuroticism: 'not_applicable',
      },
      model_version: 'ridge_v1',
      elapsed_ms: 100,
    });
    const r = await inferBigFive('otro texto');
    expect(r.perDimensionStatus.extraversion).toBe('not_applicable');
    expect(r.perDimensionStatus.neuroticism).toBe('not_applicable');
    expect(r.perDimensionStatus.conscientiousness).toBe('low_confidence');
    expect(r.perDimensionStatus.openness).toBe('ok');
  });
});
