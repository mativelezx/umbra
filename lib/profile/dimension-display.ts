import type { BigFive, DimensionStatus, PerDimensionStatus } from '@/types';

/**
 * Estado de confianza por dimensión que reporta el módulo ML propio.
 * Fuente: `per_dimension_status` de la evaluación versionada
 * (ml/eval_metrics.json, lectura de clasificación — ADR-027).
 *
 * - `ok`             → la dimensión superó los umbrales comprometidos y su
 *                      valor integra el componente cuantitativo del perfil.
 * - `low_confidence` → por debajo de los umbrales: el valor NO se muestra
 *                      como cifra; la dimensión se declara con su estado.
 * - `not_applicable` → la evaluación de clasificación no pudo calcularse
 *                      (etiquetas no estrictamente dicotómicas): tampoco
 *                      se muestra cifra.
 */
export type { DimensionStatus, PerDimensionStatus } from '@/types';

export const BIG_FIVE_KEYS: Array<keyof BigFive> = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

/**
 * Estado por dimensión del artefacto en producción (ridge_v1), usado como
 * respaldo cuando un perfil persistido no trae el bloque `ml` (perfiles
 * anteriores a la incorporación del estado, o datos de demostración).
 * Es una propiedad del modelo evaluado — no del usuario — por lo que el
 * respaldo es fiel: coincide con ml/eval_metrics.json del repositorio.
 */
export const RIDGE_V1_STATUS: PerDimensionStatus = {
  openness: 'ok',
  conscientiousness: 'low_confidence',
  extraversion: 'not_applicable',
  agreeableness: 'low_confidence',
  neuroticism: 'not_applicable',
};

const VALID: ReadonlySet<string> = new Set(['ok', 'low_confidence', 'not_applicable']);

/**
 * Extrae el estado por dimensión desde `analysis_raw` persistido.
 * Conservador ante datos faltantes o corruptos: cae al estado del
 * artefacto en producción, nunca a "todo ok".
 */
export function extractPerDimensionStatus(analysisRaw: unknown): PerDimensionStatus {
  const ml =
    analysisRaw && typeof analysisRaw === 'object'
      ? (analysisRaw as Record<string, unknown>).ml
      : undefined;
  const raw =
    ml && typeof ml === 'object'
      ? (ml as Record<string, unknown>).perDimensionStatus
      : undefined;
  if (!raw || typeof raw !== 'object') return { ...RIDGE_V1_STATUS };

  const out = { ...RIDGE_V1_STATUS };
  for (const key of BIG_FIVE_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === 'string' && VALID.has(v)) out[key] = v as DimensionStatus;
  }
  return out;
}

/** Dimensiones cuyo valor numérico puede mostrarse (estado `ok`). */
export function quantitativeDimensions(status: PerDimensionStatus): Array<keyof BigFive> {
  return BIG_FIVE_KEYS.filter((k) => status[k] === 'ok');
}

/** Etiqueta breve del estado, para la interfaz (voseo neutro). */
export const STATUS_LABEL: Record<DimensionStatus, string> = {
  ok: 'medida con confianza',
  low_confidence: 'baja confianza — sin valor reportado',
  not_applicable: 'no evaluable — sin valor reportado',
};
