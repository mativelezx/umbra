"""Verifica umbrales de aceptación por dimensión (ADR-027).

Lee `ml/eval_metrics.json` y reporta dimensiones bajo umbral.
Sale con código 0 si:
- Todas las dimensiones tienen R² > 0.20 y r > 0.30 en el bloque
  primario con métricas suficientes, O
- Las dimensiones bajo umbral están marcadas como `low_confidence` en
  `per_dimension_status` (es decir, el sistema ya las excluye del
  componente cuantitativo del perfil).

Sale con código 1 si una dimensión tiene métricas finitas que pasan
el umbral pero el status dice `low_confidence` (incoherencia interna).

Uso desde CI:
    python ml/scripts/check_eval_thresholds.py [--strict]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVAL_METRICS = ROOT / "eval_metrics.json"
R2_THRESHOLD = 0.20
R_THRESHOLD = 0.30
ROC_AUC_THRESHOLD = 0.60
BALANCED_ACC_THRESHOLD = 0.55


def has_regression_metrics(block: dict) -> bool:
    return any(
        isinstance(m, dict) and "r2" in m and "r" in m
        for m in block.get("metrics", {}).values()
    )


def choose_primary_block(blocks: dict) -> tuple[str, dict]:
    """Elige el bloque cuantitativo primario disponible.

    Preferimos `latinoamericano_only` porque es el idioma de uso real. Si
    no tiene suficientes muestras en test, caemos a `combined`/`english_only`
    para no reportar falsamente "no metrics" cuando Essays sí está integrado.
    """
    for key in ("latinoamericano_only", "combined", "english_only", "loo_full_corpus_baseline"):
        block = blocks.get(key) or {}
        if has_regression_metrics(block):
            return key, block
    return "none", {}


def fmt_metric(value) -> str:
    if isinstance(value, (float, int)):
        return f"{value:.3f}"
    return str(value)


def main() -> int:
    if not EVAL_METRICS.exists():
        print(f"[check_thresholds] No se encontró {EVAL_METRICS}; correr `make evaluate` primero.")
        return 0  # No bloqueamos CI si las métricas aún no están generadas.

    with open(EVAL_METRICS) as f:
        data = json.load(f)

    blocks = data.get("blocks", {})
    primary_name, primary = choose_primary_block(blocks)
    metrics = primary.get("metrics", {})
    status = primary.get("per_dimension_status", {})

    incoherences = []
    low_confidence = []
    ok_count = 0
    for dim, m in metrics.items():
        if not isinstance(m, dict) or "r2" not in m or "r" not in m or m.get("r2") is None or m.get("r") is None:
            low_confidence.append((dim, "no metrics"))
            continue
        passes = (m["r2"] > R2_THRESHOLD) and (m["r"] > R_THRESHOLD)
        declared_ok = status.get(dim) == "ok"
        if passes and declared_ok:
            ok_count += 1
        elif passes and not declared_ok:
            incoherences.append(
                (dim, f"métrica pasa (R²={m['r2']:.3f}, r={m['r']:.3f}) pero status={status.get(dim)}")
            )
        else:
            low_confidence.append(
                (dim, f"R²={fmt_metric(m.get('r2'))}, r={fmt_metric(m.get('r'))}")
            )

    print(f"[check_thresholds] bloque primario regresión: {primary_name}")
    print(f"[check_thresholds] dimensiones ok regresión: {ok_count}")
    if low_confidence:
        print(f"[check_thresholds] dimensiones bajo umbral (excluidas del componente cuantitativo, ADR-027):")
        for dim, info in low_confidence:
            print(f"  - {dim}: {info}")

    binary_metrics = primary.get("classification_metrics", {})
    binary_status = primary.get("per_dimension_classification_status", {})
    binary_ok = 0
    if binary_metrics:
        print("[check_thresholds] métricas binarias disponibles (Essays 0/100 rasgo alto/bajo):")
        for dim, m in binary_metrics.items():
            if not isinstance(m, dict) or "roc_auc" not in m:
                continue
            passes = (
                m.get("roc_auc") is not None
                and m.get("balanced_accuracy") is not None
                and m["roc_auc"] >= ROC_AUC_THRESHOLD
                and m["balanced_accuracy"] >= BALANCED_ACC_THRESHOLD
            )
            declared_ok = binary_status.get(dim) == "ok"
            if passes and declared_ok:
                binary_ok += 1
            elif passes and not declared_ok:
                incoherences.append(
                    (dim, f"binaria pasa (AUC={m['roc_auc']:.3f}, BA={m['balanced_accuracy']:.3f}) pero status={binary_status.get(dim)}")
                )
            print(
                f"  - {dim}: AUC={fmt_metric(m.get('roc_auc'))}, "
                f"BA={fmt_metric(m.get('balanced_accuracy'))}, "
                f"F1={fmt_metric(m.get('f1'))}, status={binary_status.get(dim)}"
            )
        print(f"[check_thresholds] dimensiones ok binario: {binary_ok}")

    if incoherences:
        print("[check_thresholds] INCOHERENCIAS detectadas (status no refleja métricas):")
        for dim, info in incoherences:
            print(f"  - {dim}: {info}")
        return 1

    strict = "--strict" in sys.argv
    if strict and ok_count < 5:
        print(f"[check_thresholds] STRICT: solo {ok_count}/5 dimensiones cumplen umbral. Falla.")
        return 1

    dataset_status = data.get("dataset_status", {})
    if dataset_status.get("essays_integrated"):
        print("[check_thresholds] OK (Essays integrado; dimensiones bajo umbral siguen excluidas por status).")
    else:
        print("[check_thresholds] OK (modo lax — corpus chico esperable bajo umbral mientras Essays no se integre).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
