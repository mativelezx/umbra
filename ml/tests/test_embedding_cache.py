"""Regression tests against reordered or replaced split texts."""

import numpy as np
import pandas as pd

from src import train_ridge


class SmallExtractor:
    model_name = "fixture-model"
    revision = "fixture-revision"

    def encode(self, texts):
        return np.array([[len(text)] * 768 for text in texts], dtype=np.float32)


def test_cache_is_invalidated_by_text_order_and_content(tmp_path, monkeypatch):
    monkeypatch.setattr(train_ridge, "EMBEDDINGS_CACHE", tmp_path)
    extractor = SmallExtractor()
    first = pd.DataFrame({"text": ["a", "long"]})
    train_ridge.cache_or_compute_embeddings(first, "test", extractor)
    changed = pd.DataFrame({"text": ["long", "new"]})
    result = train_ridge.cache_or_compute_embeddings(changed, "test", extractor)
    assert result[:, 0].tolist() == [4.0, 3.0]


def test_unidentified_legacy_cache_is_not_reused(tmp_path, monkeypatch):
    monkeypatch.setattr(train_ridge, "EMBEDDINGS_CACHE", tmp_path)
    np.save(tmp_path / "test.npy", np.zeros((1, 768)))
    result = train_ridge.cache_or_compute_embeddings(
        pd.DataFrame({"text": ["valid"]}), "test", SmallExtractor()
    )
    assert result[0, 0] == 5.0


def test_valid_cache_can_be_reused_without_extractor_forward(tmp_path, monkeypatch):
    monkeypatch.setattr(train_ridge, "EMBEDDINGS_CACHE", tmp_path)
    data = pd.DataFrame({"text": ["same"]})
    train_ridge.cache_or_compute_embeddings(data, "test", SmallExtractor())

    class UnavailableExtractor(SmallExtractor):
        def encode(self, texts):
            raise RuntimeError("forward unavailable")

    result = train_ridge.cache_or_compute_embeddings(data, "test", UnavailableExtractor())
    assert result[0, 0] == 4.0
