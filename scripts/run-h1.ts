/**
 * @deprecated DESDE 2026-04-27 (pivot ML, ADR-011 SUPERSEDED).
 *
 * Este script era el runner CLI de la hipótesis H1 (determinismo del Pass 1
 * Claude). Tras el pivot ML (ADR-026 + ADR-028), la validación primary
 * del componente analítico es **MSE / R² / r de Pearson por dimensión Big
 * Five** sobre el regresor entrenado, ejecutada por el módulo Python.
 *
 * Reemplazo:
 *
 *   cd ml
 *   make all                # prepare + baseline + train + evaluate
 *   cat eval_metrics.json   # métricas reproducidas
 *
 * Este stub se conserva para que cualquier referencia residual en
 * documentación o CI no produzca un import roto. Su ejecución sale
 * inmediatamente con un mensaje informativo.
 */

/* eslint-disable no-console */
console.log('[run-h1] DESCONTINUADO (pivot ML, 2026-04-27).');
console.log('[run-h1] Validación primary del componente analítico:');
console.log('[run-h1]   cd ml && make all && cat eval_metrics.json');
console.log('[run-h1] Ver docs/DECISIONS.md (ADR-011 SUPERSEDED, ADR-026, ADR-028).');
process.exit(0);
