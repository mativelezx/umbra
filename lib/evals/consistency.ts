/**
 * @deprecated DESDE 2026-04-27 (pivot ML, ADR-011 SUPERSEDED + ADR-026 + ADR-028).
 *
 * Este archivo era el runner H1 — determinismo del Pass 1 con
 * `temperature=0` y modelo Claude pinned. La hipótesis tenía sentido
 * cuando la inferencia Big Five era íntegramente Claude. Tras el pivot
 * ML, la inferencia Big Five la realiza un regresor entrenado y
 * determinístico por construcción; H1 dejó de ser una pregunta de
 * investigación.
 *
 * Reemplazo: la validación primary del componente analítico es **MSE / R² /
 * r de Pearson por dimensión Big Five** (ADR-028), reportadas por el
 * módulo ML propio (`/ml/src/evaluate.py`). Reproducción local:
 *
 *   cd ml && make all
 *   cat eval_metrics.json
 *
 * Los resultados empíricos viejos de H1 quedan preservados en
 * `eval-results/legacy/` como histórico (ver COMMIT_PLAN.md). No son
 * evidencia primary del TFG entregado.
 */

export interface H1Summary {
  cases: number;
  runsPerCase: number;
  passed: boolean;
  note: string;
}

export interface RunH1Options {
  runsPerCase?: number;
  passCriterion?: number;
}

export async function runH1(_options: RunH1Options = {}): Promise<H1Summary> {
  throw new Error(
    'runH1 está descontinuado desde el pivot ML (2026-04-27). Validación primary ' +
      'del componente analítico = métricas Big Five por dimensión del módulo ML ' +
      '(ADR-028). Correr `cd ml && make all` y leer `ml/eval_metrics.json`.',
  );
}
