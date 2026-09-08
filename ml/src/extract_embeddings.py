"""Extractor de embeddings con DistilBERT congelado (frozen).

Etapa 1 del módulo ML propio (ADR-026). Carga DistilBERT base
multilingual cased preentrenado, congela los pesos, y devuelve embeddings
de la representación CLS de cada texto. NO se hace fine-tuning.

Usado por:
- src/train_ridge.py (entrenamiento etapa 2)
- src/predict.py (inferencia en runtime)
- src/api_server.py (a través del predictor)
"""

from __future__ import annotations

import logging
from typing import Iterable, List
from pathlib import Path

import numpy as np

logging.basicConfig(level=logging.INFO, format="[extract_embeddings] %(message)s")
log = logging.getLogger(__name__)

MODEL_NAME = "distilbert-base-multilingual-cased"
# Official repository revision resolved on 2026-09-07; historical bundle did not
# record its embedding revision, so this pin is prospective reproducibility.
MODEL_REVISION = "45c032ab32cc946ad88a166f7cb282f58c753c2e"
EMBEDDING_DIM = 768
MAX_LENGTH = 512


class EmbeddingExtractor:
    """Wrapper sobre DistilBERT congelado.

    Lazy import de transformers/torch para no penalizar imports cuando el
    extractor no se usa (por ejemplo durante el baseline TF-IDF).
    """

    def __init__(self, model_name: str = MODEL_NAME, device: str = "cpu",
                 revision: str = MODEL_REVISION):
        self.model_name = model_name
        self.device = device
        self.revision = revision
        self._tokenizer = None
        self._model = None

    def _ensure_loaded(self):
        if self._model is None:
            log.info("Loading %s on %s...", self.model_name, self.device)
            try:
                from transformers import AutoModel, AutoTokenizer
                import torch
            except ImportError as e:
                raise ImportError(
                    "transformers / torch no están instalados. "
                    "Correr: pip install -r ml/requirements.txt"
                ) from e
            self._torch = torch
            bundled = Path(__file__).resolve().parent.parent / 'models' / 'distilbert'
            use_bundle = bundled.is_dir() and self.model_name == MODEL_NAME and self.revision == MODEL_REVISION
            source = str(bundled) if use_bundle else self.model_name
            options = {'local_files_only': True} if use_bundle else {'revision': self.revision}
            self._tokenizer = AutoTokenizer.from_pretrained(source, **options)
            self._model = AutoModel.from_pretrained(source, **options).to(self.device)
            self._model.eval()
            for p in self._model.parameters():
                p.requires_grad = False  # FROZEN
            log.info("Modelo cargado y congelado (params requires_grad=False).")

    def encode(self, texts: Iterable[str], batch_size: int = 8) -> np.ndarray:
        """Devuelve matriz (n, EMBEDDING_DIM) con CLS pooling."""
        self._ensure_loaded()
        torch = self._torch
        out: List[np.ndarray] = []
        texts = [str(t) if t is not None else "" for t in texts]
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            enc = self._tokenizer(
                batch,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=MAX_LENGTH,
            ).to(self.device)
            with torch.no_grad():
                outputs = self._model(**enc)
            cls = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            out.append(cls)
            log.info("batch %d/%d ok", i // batch_size + 1,
                     (len(texts) + batch_size - 1) // batch_size)
        return np.vstack(out) if out else np.zeros((0, EMBEDDING_DIM), dtype=np.float32)


_DEFAULT_EXTRACTOR: EmbeddingExtractor | None = None


def get_default_extractor() -> EmbeddingExtractor:
    global _DEFAULT_EXTRACTOR
    if _DEFAULT_EXTRACTOR is None:
        _DEFAULT_EXTRACTOR = EmbeddingExtractor()
    return _DEFAULT_EXTRACTOR


def main():
    """CLI ad-hoc: encode texts from stdin or sample sentence."""
    import sys

    if len(sys.argv) > 1:
        texts = sys.argv[1:]
    else:
        texts = ["Soy una persona curiosa que disfruta probar cosas nuevas."]
    extractor = get_default_extractor()
    embs = extractor.encode(texts)
    print("Embeddings shape:", embs.shape)
    print("Sample (primeros 5 valores del primer vector):", embs[0][:5])


if __name__ == "__main__":
    main()
