"""Tests del Predictor (servicio de inferencia).

Bundle de prueba con Ridges reales entrenados con datos sintéticos +
stub del extractor para evitar la dependencia con DistilBERT (que no se
descarga en CI por defecto). Verifica el contrato del Predictor: shape
de la respuesta, status por dimensión, model_version, clamping 0-100.
"""

from pathlib import Path
from unittest.mock import MagicMock

import joblib
import numpy as np
import pytest
from sklearn.linear_model import Ridge

from src.predict import Predictor, BIG_FIVE_DIMS, _load_status_from_eval_metrics


def _make_real_bundle(tmp_path: Path, predict_value: float = 55.0,
                      version: str = "ridge_v1_test") -> Path:
    """Crea un bundle joblib con 5 Ridges entrenados sobre datos sintéticos.

    Cada Ridge se entrena con un dataset 4×768 → constante=predict_value
    para que predict([0..0]) devuelva aproximadamente ese valor.
    """
    rng = np.random.default_rng(42)
    X = rng.standard_normal((8, 768)).astype(np.float32)
    y = np.full(8, predict_value)
    models = {}
    for dim in BIG_FIVE_DIMS:
        m = Ridge(alpha=1.0)
        m.fit(X, y)
        models[dim] = m
    bundle = {
        "models": models,
        "model_name": "distilbert-base-multilingual-cased",
        "embedding_dim": 768,
        "dims": BIG_FIVE_DIMS,
        "version": version,
    }
    path = tmp_path / "ridge_test.joblib"
    joblib.dump(bundle, path)
    return path


def test_predictor_returns_expected_shape(tmp_path, monkeypatch):
    bundle_path = _make_real_bundle(tmp_path, predict_value=55.0)
    p = Predictor(bundle_path=bundle_path)

    # Stub del extractor para no tocar DistilBERT
    fake_extractor = MagicMock()
    fake_extractor.encode = MagicMock(return_value=np.zeros((1, 768), dtype=np.float32))
    p._extractor = fake_extractor

    result = p.predict("texto de ejemplo")

    assert "big_five" in result
    assert "per_dimension_status" in result
    assert "model_version" in result
    assert "elapsed_ms" in result

    for dim in BIG_FIVE_DIMS:
        assert dim in result["big_five"]
        assert 0.0 <= result["big_five"][dim] <= 100.0
        assert dim in result["per_dimension_status"]
        assert result["per_dimension_status"][dim] in ("ok", "low_confidence")

    assert result["model_version"] == "ridge_v1_test"


def test_status_default_low_confidence_when_no_eval_metrics(tmp_path):
    fake_path = tmp_path / "missing_eval_metrics.json"
    status = _load_status_from_eval_metrics(fake_path)
    for dim in BIG_FIVE_DIMS:
        assert status[dim] == "low_confidence"


def test_status_loads_from_eval_metrics(tmp_path):
    import json
    payload = {
        "blocks": {
            "latinoamericano_only": {
                "per_dimension_status": {
                    "openness": "ok",
                    "conscientiousness": "low_confidence",
                    "extraversion": "ok",
                    "agreeableness": "ok",
                    "neuroticism": "ok",
                }
            }
        }
    }
    path = tmp_path / "eval_metrics.json"
    with open(path, "w") as f:
        json.dump(payload, f)
    status = _load_status_from_eval_metrics(path)
    assert status["openness"] == "ok"
    assert status["conscientiousness"] == "low_confidence"


def test_predictor_clips_to_0_100(tmp_path):
    """Predictions fuera de [0,100] deben clipear al rango válido."""
    bundle_path = _make_real_bundle(tmp_path, predict_value=180.0)
    p = Predictor(bundle_path=bundle_path)
    fake_extractor = MagicMock()
    fake_extractor.encode = MagicMock(return_value=np.zeros((1, 768), dtype=np.float32))
    p._extractor = fake_extractor

    result = p.predict("texto")
    for dim in BIG_FIVE_DIMS:
        assert result["big_five"][dim] == 100.0  # clipped al máximo

    # ahora con valores muy negativos
    bundle_path2 = _make_real_bundle(tmp_path, predict_value=-50.0,
                                     version="ridge_neg")
    p2 = Predictor(bundle_path=bundle_path2)
    p2._extractor = fake_extractor
    result2 = p2.predict("texto")
    for dim in BIG_FIVE_DIMS:
        assert result2["big_five"][dim] == 0.0  # clipped al mínimo
