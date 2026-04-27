/**
 * @deprecated DESDE 2026-04-27 (pivot ML, ADR-011 + ADR-020 SUPERSEDED + ADR-026 + ADR-028).
 *
 * Este archivo era el runner H2 — robustez del Pass 1 a paráfrasis
 * generadas por dos modelos Claude (Sonnet + Haiku). La hipótesis
 * tenía sentido cuando la inferencia Big Five era íntegramente Claude.
 * Tras el pivot ML, la robustez del componente analítico se mide sobre
 * el regresor entrenado, no sobre el rewriter; queda absorbida en las
 * métricas estándar de regresión por dimensión (ADR-028).
 *
 * Reemplazo: ver `lib/evals/consistency.ts` (deprecation note idéntica).
 *
 * Los resultados empíricos viejos de H2 quedan preservados en
 * `eval-results/legacy/` como histórico (ver COMMIT_PLAN.md).
 */

export interface H2Summary {
  cases: number;
  paraphrasesPerCase: number;
  passed: boolean;
  note: string;
}

export interface RunH2Options {
  paraphrasesPerCase?: number;
  passCriterion?: number;
}

export async function runH2(_options: RunH2Options = {}): Promise<H2Summary> {
  throw new Error(
    'runH2 está descontinuado desde el pivot ML (2026-04-27). Validación primary ' +
      'del componente analítico = métricas Big Five por dimensión del módulo ML ' +
      '(ADR-028). Correr `cd ml && make all` y leer `ml/eval_metrics.json`.',
  );
}
