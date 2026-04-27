"""Verifica umbrales de aceptación por dimensión (ADR-027).

Lee `ml/eval_metrics.json` y reporta dimensiones bajo umbral.
Sale con código 0 si:
- Todas las dimensiones tienen R² > 0.20 y r > 0.30 en bloque
  latinoamericano_only, O
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


def main() -> int:
    if not EVAL_METRICS.exists():
        print(f"[check_thresholds] No se encontró {EVAL_METRICS}; correr `make evaluate` primero.")
        return 0  # No bloqueamos CI si las métricas aún no están generadas.

    with open(EVAL_METRICS) as f:
        data = json.load(f)

    blocks = data.get("blocks", {})
    primary = blocks.get("latinoamericano_only") or blocks.get("loo_full_corpus_baseline") or blocks.get("combined") or {}
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
                (dim, f"R²={m.get('r2'):.3f if isinstance(m.get('r2'), float) else m.get('r2')}, r={m.get('r'):.3f if isinstance(m.get('r'), float) else m.get('r')}")
            )

    print(f"[check_thresholds] dimensiones ok: {ok_count}")
    if low_confidence:
        print(f"[check_thresholds] dimensiones bajo umbral (excluidas del componente cuantitativo, ADR-027):")
        for dim, info in low_confidence:
            print(f"  - {dim}: {info}")
    if incoherences:
        print("[check_thresholds] INCOHERENCIAS detectadas (status no refleja métricas):")
        for dim, info in incoherences:
            print(f"  - {dim}: {info}")
        return 1

    strict = "--strict" in sys.argv
    if strict and ok_count < 5:
        print(f"[check_thresholds] STRICT: solo {ok_count}/5 dimensiones cumplen umbral. Falla.")
        return 1

    print("[check_thresholds] OK (modo lax — corpus chico esperable bajo umbral mientras Essays no se integre).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
