import type { BigFive, DimensionStatus, PerDimensionStatus } from '@/types';

/**
 * Estado de confianza por dimensión que reporta el módulo ML propio.
 * El estado no transfiere resultados de clasificación inglesa a validez
 * individual española. El bundle actual carece de evidencia suficiente.
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
 * Estado conservador del bundle verificado localmente (ridge_v1), usado como
 * respaldo cuando un perfil persistido no trae el bloque `ml` (perfiles
 * anteriores a la incorporación del estado, o datos de demostración).
 * Dos viñetas sintéticas españolas no habilitan valores individuales.
 * Este respaldo no certifica el estado de un despliegue remoto.
 */
export const RIDGE_V1_STATUS: PerDimensionStatus = {
  openness: 'low_confidence',
  conscientiousness: 'low_confidence',
  extraversion: 'low_confidence',
  agreeableness: 'low_confidence',
  neuroticism: 'low_confidence',
};

const VALID: ReadonlySet<string> = new Set(['ok', 'low_confidence', 'not_applicable']);

/**
 * Extrae el estado por dimensión desde `analysis_raw` persistido.
 * Conservador ante datos faltantes o corruptos: cae al estado del
 * bundle verificado. Corrige también estados históricos de ridge_v1
 * que se basaban en la clasificación inglesa.
 */
export function extractPerDimensionStatus(analysisRaw: unknown): PerDimensionStatus {
  const ml =
    analysisRaw && typeof analysisRaw === 'object'
      ? (analysisRaw as Record<string, unknown>).ml
      : undefined;
  if (ml && typeof ml === 'object'
    && (ml as Record<string, unknown>).modelVersion === 'ridge_v1') {
    return { ...RIDGE_V1_STATUS };
  }
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
  ok: 'estimación experimental habilitada',
  low_confidence: 'evidencia insuficiente — sin cifra',
  not_applicable: 'no evaluable — sin valor reportado',
};
