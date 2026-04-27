/**
 * @deprecated DESDE 2026-04-27 (pivot ML, ADR-011 + ADR-020 SUPERSEDED).
 *
 * Este script era el runner CLI de la hipótesis H2 (robustez a paráfrasis
 * intra-vendor del Pass 1 Claude). Tras el pivot ML (ADR-026 + ADR-028),
 * la validación primary se mide sobre el regresor entrenado.
 *
 * Reemplazo:
 *
 *   cd ml
 *   make all
 *   cat eval_metrics.json
 *
 * Stub conservado para evitar imports rotos.
 */

/* eslint-disable no-console */
console.log('[run-h2] DESCONTINUADO (pivot ML, 2026-04-27).');
console.log('[run-h2] Validación primary del componente analítico:');
console.log('[run-h2]   cd ml && make all && cat eval_metrics.json');
console.log('[run-h2] Ver docs/DECISIONS.md (ADR-011 + ADR-020 SUPERSEDED, ADR-026, ADR-028).');
process.exit(0);
