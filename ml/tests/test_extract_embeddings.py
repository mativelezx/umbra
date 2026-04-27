"""Tests del extractor DistilBERT.

Si transformers/torch no están disponibles en el entorno (CI sin GPU/
sin descarga del modelo), los tests se skipean en lugar de fallar.
"""

import importlib

import pytest


def _has_transformers():
    try:
        importlib.import_module("transformers")
        importlib.import_module("torch")
        return True
    except ImportError:
        return False


def test_module_imports():
    """Smoke test: el módulo importa sin tocar transformers (lazy loading)."""
    from src.extract_embeddings import EmbeddingExtractor, EMBEDDING_DIM, MODEL_NAME
    assert EMBEDDING_DIM == 768
    assert "distilbert" in MODEL_NAME.lower()
    extractor = EmbeddingExtractor()
    assert extractor._model is None, "El modelo debería ser lazy"


@pytest.mark.skipif(not _has_transformers(), reason="transformers/torch no instalados")
def test_encode_returns_correct_shape():
    """Si transformers está disponible, encode devuelve la shape esperada."""
    from src.extract_embeddings import EmbeddingExtractor, EMBEDDING_DIM
    extractor = EmbeddingExtractor()
    texts = ["Hola, soy una persona curiosa.", "Otra oración para test."]
    embs = extractor.encode(texts, batch_size=2)
    assert embs.shape == (2, EMBEDDING_DIM), f"Shape inesperada: {embs.shape}"
