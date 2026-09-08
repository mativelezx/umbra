"""Predictor: une extractor + bundle Ridge + status por dimensión.

Usado por el FastAPI server (api_server.py) para servir inferencia en
runtime. Carga lazy de los artefactos. Devuelve scores + per_dimension_status
calculado contra los umbrales en eval_metrics.json (ADR-027).
"""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Dict, Optional

import joblib
import numpy as np

from .extract_embeddings import EmbeddingExtractor, MODEL_NAME, MODEL_REVISION

logging.basicConfig(level=logging.INFO, format="[predict] %(message)s")
log = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "models"
EVAL_METRICS = ROOT / "eval_metrics.json"
BIG_FIVE_DIMS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]

# Operational minimum, not a statistical power calculation or validation claim.
MIN_BLOCK_N = 30


def _load_status_from_eval_metrics(path: Path = EVAL_METRICS) -> Dict[str, str]:
    """Read Spanish regression evidence for the Spanish-facing score contract.

    English/combined binary discrimination remains an offline research result;
    it cannot promote the validity of individual Spanish scores. Missing or
    insufficient per-dimension evidence fails conservatively. The n=30 guard
    is operational and does not by itself establish psychometric validity.
    """
    default = {dim: "low_confidence" for dim in BIG_FIVE_DIMS}
    if not path.exists():
        log.warning("eval_metrics.json no encontrado — status default low_confidence")
        return default
    try:
        with open(path) as f:
            data = json.load(f)
    except Exception as e:
        log.warning("eval_metrics.json no parseable (%s) — status default low_confidence", e)
        return default

    blocks = data.get("blocks", {}) if isinstance(data, dict) else {}
    block = blocks.get("latinoamericano_only", {}) if isinstance(blocks, dict) else {}
    if not isinstance(block, dict):
        return default
    metrics = block.get("metrics", {})
    status = block.get("per_dimension_status", {})
    if not isinstance(metrics, dict) or not isinstance(status, dict):
        return default
    for dim in BIG_FIVE_DIMS:
        metric = metrics.get(dim, {})
        n = metric.get("n") if isinstance(metric, dict) else None
        if type(n) is int and n >= MIN_BLOCK_N and status.get(dim) == "ok":
            default[dim] = "ok"
    return default


class Predictor:
    """Servicio de inferencia. Carga lazy del bundle y del extractor."""

    def __init__(self, bundle_path: Optional[Path] = None):
        self.bundle_path = bundle_path or (MODELS_DIR / "ridge_v1.joblib")
        self._bundle = None
        self._extractor = None
        self._status = _load_status_from_eval_metrics()

    def _ensure_loaded(self):
        if self._bundle is None:
            log.info("Loading bundle from %s", self.bundle_path)
            self._bundle = joblib.load(self.bundle_path)
        if self._extractor is None:
            self._extractor = EmbeddingExtractor(
                model_name=self._bundle.get("model_name", MODEL_NAME),
                revision=self._bundle.get("model_revision", MODEL_REVISION),
            )

    def model_version(self) -> str:
        if self._bundle is None:
            return "unloaded"
        return self._bundle.get("version", "unknown")

    def load(self) -> None:
        """Load both the trained regressors and frozen embedding weights."""
        self._ensure_loaded()
        self._extractor._ensure_loaded()

    def is_loaded(self) -> bool:
        """Weight readiness; this does not assert a successful inference."""
        return (self._bundle is not None and self._extractor is not None
                and self._extractor._model is not None)

    def per_dimension_status(self) -> Dict[str, str]:
        return dict(self._status)

    def reload_status(self):
        """Recargar status desde eval_metrics.json (útil tras re-entrenar)."""
        self._status = _load_status_from_eval_metrics()

    def predict(self, text: str) -> Dict:
        self._ensure_loaded()
        t0 = time.time()
        emb = self._extractor.encode([text])
        scores = {}
        for dim in BIG_FIVE_DIMS:
            model = self._bundle["models"].get(dim)
            if model is None:
                raise ValueError(f"Missing regressor for {dim}")
            raw = float(model.predict(emb.reshape(1, -1))[0])
            scores[dim] = float(np.clip(round(raw, 2), 0.0, 100.0))
        elapsed_ms = int((time.time() - t0) * 1000)
        return {
            "big_five": scores,
            "per_dimension_status": self.per_dimension_status(),
            "model_version": self.model_version(),
            "elapsed_ms": elapsed_ms,
        }


_DEFAULT_PREDICTOR: Predictor | None = None


def get_default_predictor() -> Predictor:
    global _DEFAULT_PREDICTOR
    if _DEFAULT_PREDICTOR is None:
        _DEFAULT_PREDICTOR = Predictor()
    return _DEFAULT_PREDICTOR


def main():
    """CLI ad-hoc."""
    import sys

    text = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else \
        "Soy una persona curiosa que disfruta probar cosas nuevas."
    predictor = get_default_predictor()
    print(json.dumps(predictor.predict(text), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
