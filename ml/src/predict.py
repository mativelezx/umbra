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

from .extract_embeddings import EmbeddingExtractor

logging.basicConfig(level=logging.INFO, format="[predict] %(message)s")
log = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "models"
EVAL_METRICS = ROOT / "eval_metrics.json"
BIG_FIVE_DIMS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]

# n minimo para que un bloque de evaluacion pueda decidir el status por dimension.
# Por debajo de este valor la estimacion de AUC/balanced accuracy por dimension no
# tiene precision util, asi que el bloque se descarta (ADR-027).
MIN_BLOCK_N = 30


def _load_status_from_eval_metrics(path: Path = EVAL_METRICS) -> Dict[str, str]:
    """Lee el status por dimensión desde eval_metrics.json (ADR-027).

    Dos reglas gobiernan la selección:

    1. **Lectura binaria como primaria.** ADR-027 declara la lectura binaria
       (ROC AUC / balanced accuracy) como primaria, porque las etiquetas del
       corpus Essays son binarias y el R² sobre un objetivo dicotómico es bajo
       por construcción. Por eso se prefiere `per_dimension_classification_status`
       sobre `per_dimension_status` (regresión), que queda como respaldo.

    2. **Poder estadístico mínimo por bloque.** Un bloque con n muy chico no
       sostiene una estimación de AUC por dimensión, así que no puede decidir
       qué se le muestra a la persona usuaria. Los bloques con `n_samples`
       declarado por debajo de MIN_BLOCK_N se descartan.

    El orden de preferencia mantiene `latinoamericano_only` primero por ser el
    idioma de uso real: cuando ese corpus alcance el n comprometido, el status
    pasa a calcularse sobre él sin tocar código.

    Si el archivo no existe, no es parseable o ningún bloque califica, devuelve
    "low_confidence" para todas las dimensiones (fail-conservative).
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

    blocks = data.get("blocks", {})
    for status_key in ("per_dimension_classification_status", "per_dimension_status"):
        for block_key in ("latinoamericano_only", "combined", "english_only"):
            block = blocks.get(block_key, {})
            status = block.get(status_key)
            if not status:
                continue
            n_samples = block.get("n_samples")
            if isinstance(n_samples, int) and n_samples < MIN_BLOCK_N:
                log.warning(
                    "Bloque '%s' descartado para status: n=%d < %d (sin poder estadistico)",
                    block_key,
                    n_samples,
                    MIN_BLOCK_N,
                )
                continue
            log.info("Cargando '%s' del bloque '%s'", status_key, block_key)
            return {**default, **status}
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
            self._extractor = EmbeddingExtractor()

    def model_version(self) -> str:
        if self._bundle is None:
            return "unloaded"
        return self._bundle.get("version", "unknown")

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
                scores[dim] = 50.0  # neutro si la dimensión no se entrenó
                continue
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
