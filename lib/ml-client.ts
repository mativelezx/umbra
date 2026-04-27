/**
 * Cliente HTTP para el módulo ML propio (`/ml/`).
 *
 * Punto único de contacto entre el frontend Next.js y el componente
 * analítico independiente del TFG (ADR-026). Toda inferencia Big Five
 * pasa por acá. Jung/arquetipo/razonamiento son responsabilidad de la
 * capa narrativa Claude (Pass 1.5 en `lib/prompts/interpret-narrative.ts`),
 * no de este módulo.
 *
 * Variable de entorno: `ML_API_URL` (default `http://localhost:8000`).
 *
 * Errores tipados: `MlApiUnavailableError` cuando el servicio está caído
 * o el modelo no está cargado (HTTP 503), `MlApiError` para cualquier
 * otra falla. La política de fallback (NO degradar a Claude para Big
 * Five) está documentada en ADR-026.
 */

import type { BigFive, BigFiveDimension } from '@/types';

const DEFAULT_BASE = 'http://localhost:8000';
const INFER_TIMEOUT_MS = 15_000;

export type PerDimensionStatus = Record<BigFiveDimension, 'ok' | 'low_confidence'>;

export interface MlInferResponse {
  bigFive: BigFive;
  perDimensionStatus: PerDimensionStatus;
  modelVersion: string;
  elapsedMs: number;
}

export class MlApiUnavailableError extends Error {
  constructor(public statusCode?: number) {
    super('ml_api_unavailable');
    this.name = 'MlApiUnavailableError';
  }
}

export class MlApiError extends Error {
  constructor(public statusCode: number, public payload: unknown) {
    super('ml_api_error');
    this.name = 'MlApiError';
  }
}

function getBaseUrl(): string {
  const url = process.env.ML_API_URL?.trim();
  return url && url.length > 0 ? url.replace(/\/$/, '') : DEFAULT_BASE;
}

function isBigFiveDimension(key: string): key is BigFiveDimension {
  return (
    key === 'openness' ||
    key === 'conscientiousness' ||
    key === 'extraversion' ||
    key === 'agreeableness' ||
    key === 'neuroticism'
  );
}

function clamp01_100(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 50;
  return Math.min(100, Math.max(0, Math.round(v * 100) / 100));
}

function parseInferPayload(json: unknown): MlInferResponse {
  if (!json || typeof json !== 'object') {
    throw new MlApiError(200, json);
  }
  const j = json as Record<string, unknown>;
  const bf = (j.big_five ?? {}) as Record<string, unknown>;
  const status = (j.per_dimension_status ?? {}) as Record<string, unknown>;
  const dims: BigFiveDimension[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
  ];
  const bigFive = {} as BigFive;
  const perDimensionStatus = {} as PerDimensionStatus;
  for (const dim of dims) {
    bigFive[dim] = clamp01_100(bf[dim]);
    const s = status[dim];
    perDimensionStatus[dim] = s === 'ok' ? 'ok' : 'low_confidence';
  }
  // sanity check: rechazo silencioso de keys desconocidas
  for (const k of Object.keys(bf)) {
    if (!isBigFiveDimension(k)) {
      // eslint-disable-next-line no-console
      console.warn('[ml-client] big_five contiene clave inesperada:', k);
    }
  }
  return {
    bigFive,
    perDimensionStatus,
    modelVersion: typeof j.model_version === 'string' ? j.model_version : 'unknown',
    elapsedMs: typeof j.elapsed_ms === 'number' ? j.elapsed_ms : 0,
  };
}

/**
 * Llama al endpoint POST /infer del módulo ML.
 *
 * - Acepta texto introspectivo único o concatenado.
 * - Timeout fijo (15s) — DistilBERT base + Ridge corre en <1s típico,
 *   pero hay margen para cold start del servicio.
 * - NO hay fallback a Claude: si el módulo ML cae, se propaga el error
 *   y la API route devuelve 503. Tener fallback re-abre la brecha que
 *   este refactor cierra (ADR-002 v2 + ADR-026).
 */
export async function inferBigFive(text: string): Promise<MlInferResponse> {
  const base = getBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), INFER_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${base}/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timeout);
    throw new MlApiUnavailableError();
  }
  clearTimeout(timeout);

  if (res.status === 503 || res.status === 502 || res.status === 504) {
    throw new MlApiUnavailableError(res.status);
  }
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    throw new MlApiError(res.status, body);
  }
  const json = (await res.json()) as unknown;
  return parseInferPayload(json);
}

/** Health check liviano. Devuelve `false` ante cualquier error. */
export async function isMlApiHealthy(): Promise<boolean> {
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/health`, { method: 'GET', signal: AbortSignal.timeout(3_000) });
    if (!res.ok) return false;
    const j = (await res.json()) as { ok?: boolean };
    return Boolean(j?.ok);
  } catch {
    return false;
  }
}
