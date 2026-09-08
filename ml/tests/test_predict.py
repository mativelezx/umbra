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
        # Vocabulario de estados del ADR-027. `not_applicable` aparece cuando la
        # etiqueta de esa dimension no esta balanceada en el corpus.
        assert result["per_dimension_status"][dim] in (
            "ok",
            "low_confidence",
            "not_applicable",
        )

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
                "n_samples": 60,
                "metrics": {dim: {"n": 60} for dim in BIG_FIVE_DIMS},
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


def test_english_binary_evidence_does_not_validate_spanish(tmp_path):
    """A binary result on English cannot establish Spanish score validity."""
    import json
    payload = {
        "blocks": {
            "combined": {
                "n_samples": 250,
                "per_dimension_status": {dim: "low_confidence" for dim in BIG_FIVE_DIMS},
                "per_dimension_classification_status": {
                    "openness": "ok",
                    "conscientiousness": "low_confidence",
                    "extraversion": "not_applicable",
                    "agreeableness": "low_confidence",
                    "neuroticism": "not_applicable",
                },
            }
        }
    }
    path = tmp_path / "eval_metrics.json"
    with open(path, "w") as f:
        json.dump(payload, f)

    status = _load_status_from_eval_metrics(path)
    assert set(status.values()) == {"low_confidence"}


def test_insufficient_spanish_evidence_has_no_english_fallback(tmp_path):
    """Two synthetic Spanish cases cannot establish per-person validity."""
    import json
    payload = {
        "blocks": {
            "latinoamericano_only": {
                "n_samples": 2,
                "per_dimension_classification_status": {
                    dim: "not_applicable" for dim in BIG_FIVE_DIMS
                },
            },
            "combined": {
                "n_samples": 250,
                "per_dimension_classification_status": {
                    "openness": "ok",
                    "conscientiousness": "low_confidence",
                    "extraversion": "not_applicable",
                    "agreeableness": "low_confidence",
                    "neuroticism": "not_applicable",
                },
            },
        }
    }
    path = tmp_path / "eval_metrics.json"
    with open(path, "w") as f:
        json.dump(payload, f)

    status = _load_status_from_eval_metrics(path)
    assert set(status.values()) == {"low_confidence"}


@pytest.mark.parametrize("payload", [[], {"blocks": []}, {"blocks": {"latinoamericano_only": None}}])
def test_malformed_status_remains_conservative(tmp_path, payload):
    import json
    path = tmp_path / "eval_metrics.json"
    path.write_text(json.dumps(payload))
    assert set(_load_status_from_eval_metrics(path).values()) == {"low_confidence"}


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


def test_incomplete_bundle_does_not_fabricate_neutral_score(tmp_path):
    bundle_path = _make_real_bundle(tmp_path)
    bundle = joblib.load(bundle_path)
    del bundle["models"]["openness"]
    joblib.dump(bundle, bundle_path)
    predictor = Predictor(bundle_path)
    predictor._extractor = MagicMock()
    predictor._extractor.encode.return_value = np.zeros((1, 768), dtype=np.float32)
    with pytest.raises(ValueError, match="Missing regressor"):
        predictor.predict("texto sintético")
