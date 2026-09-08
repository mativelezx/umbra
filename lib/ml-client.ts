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

import type { PerDimensionStatus } from '@/types';
import type { BigFive, BigFiveDimension } from '@/types';

const DEFAULT_BASE = 'http://localhost:8000';
const INFER_TIMEOUT_MS = 15_000;

export type { PerDimensionStatus } from '@/types';

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseInferPayload(json: unknown): MlInferResponse {
  if (!isRecord(json) || !isRecord(json.big_five)) {
    throw new MlApiError(200, json);
  }
  const j = json;
  const bf = json.big_five;
  const status = isRecord(j.per_dimension_status) ? j.per_dimension_status : {};
  const dims: BigFiveDimension[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
  ];
  if (Object.keys(bf).length !== dims.length
    || typeof j.model_version !== 'string' || j.model_version.trim().length === 0
    || typeof j.elapsed_ms !== 'number' || !Number.isSafeInteger(j.elapsed_ms) || j.elapsed_ms < 0) {
    throw new MlApiError(200, json);
  }
  const bigFive = {} as BigFive;
  const perDimensionStatus = {} as PerDimensionStatus;
  for (const dim of dims) {
    const value = bf[dim];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
      throw new MlApiError(200, json);
    }
    bigFive[dim] = value;
    const s = status[dim];
    perDimensionStatus[dim] =
      s === 'ok' || s === 'not_applicable' ? s : 'low_confidence';
  }
  return {
    bigFive,
    perDimensionStatus,
    modelVersion: j.model_version,
    elapsedMs: j.elapsed_ms,
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
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.ML_API_KEY ? { 'X-ML-API-Key': process.env.ML_API_KEY } : {}),
      },
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
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new MlApiError(res.status, { error: 'invalid_ml_response_json' });
  }
  return parseInferPayload(json);
}

/** Checks liveness and loaded weights, not successful inference or model validity. */
export async function isMlApiHealthy(): Promise<boolean> {
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/health`, { method: 'GET', signal: AbortSignal.timeout(3_000) });
    if (!res.ok) return false;
    const j: unknown = await res.json();
    return isRecord(j) && j.ok === true && j.model_loaded === true;
  } catch {
    return false;
  }
}
