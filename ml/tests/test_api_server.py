"""Smoke tests del FastAPI.

Verifica health, version y que /infer maneje errores cuando no hay modelo.
"""

from unittest.mock import MagicMock, patch

import numpy as np
import pytest


@pytest.mark.parametrize('provided', [None, 'wrong-key'])
def test_inference_requires_configured_service_key(monkeypatch, provided):
    from fastapi.testclient import TestClient
    from src.api_server import app
    monkeypatch.setenv('ML_API_KEY', 'test-key-not-a-real-secret')
    headers = {'X-ML-API-Key': provided} if provided else {}
    with patch('src.api_server._get_predictor') as predictor:
        response = TestClient(app).post('/infer', json={'text': 'synthetic QA text'}, headers=headers)
        assert response.status_code == 401
        predictor.assert_not_called()


def test_public_runtime_fails_closed_without_key(monkeypatch):
    from fastapi.testclient import TestClient
    from src.api_server import app
    monkeypatch.delenv('ML_API_KEY', raising=False)
    monkeypatch.setenv('VERCEL', '1')
    with patch('src.api_server._get_predictor') as predictor:
        assert TestClient(app).post('/infer', json={'text': 'synthetic QA text'}).status_code == 503
        predictor.assert_not_called()


def test_admin_reload_requires_key_even_locally(monkeypatch):
    from fastapi.testclient import TestClient
    from src.api_server import app
    monkeypatch.delenv('ML_API_KEY', raising=False)
    with patch('src.api_server._get_predictor') as predictor:
        assert TestClient(app).post('/admin/reload-status').status_code == 503
        predictor.assert_not_called()


def test_admin_reload_accepts_valid_key(monkeypatch):
    from fastapi.testclient import TestClient
    from src.api_server import app
    monkeypatch.setenv('ML_API_KEY', 'synthetic-test-key')
    fake = MagicMock()
    fake.per_dimension_status.return_value = {}
    with patch('src.api_server._get_predictor', return_value=fake):
        response = TestClient(app).post('/admin/reload-status', headers={'X-ML-API-Key': 'synthetic-test-key'})
        assert response.status_code == 200
        fake.reload_status.assert_called_once()


def test_health_endpoint():
    from fastapi.testclient import TestClient
    from src.api_server import app

    client = TestClient(app)
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] is True
    assert body["service"] == "umbra-ml"


def test_version_endpoint_returns_dims():
    from fastapi.testclient import TestClient
    from src.api_server import app
    from src.predict import BIG_FIVE_DIMS

    # Stub el predictor global para no requerir bundle real
    fake = MagicMock()
    fake.model_version = MagicMock(return_value="ridge_v1_stub")
    fake.per_dimension_status = MagicMock(return_value={d: "ok" for d in BIG_FIVE_DIMS})
    with patch("src.api_server._get_predictor", return_value=fake):
        client = TestClient(app)
        res = client.get("/version")
    assert res.status_code == 200
    body = res.json()
    assert body["service"] == "umbra-ml"
    assert set(body["dims"]) == set(BIG_FIVE_DIMS)


def test_infer_endpoint_with_stubbed_predictor():
    from fastapi.testclient import TestClient
    from src.api_server import app
    from src.predict import BIG_FIVE_DIMS

    fake = MagicMock()
    fake.predict = MagicMock(return_value={
        "big_five": {d: 50.0 for d in BIG_FIVE_DIMS},
        "per_dimension_status": {d: "ok" for d in BIG_FIVE_DIMS},
        "model_version": "stub",
        "elapsed_ms": 1,
    })
    with patch("src.api_server._get_predictor", return_value=fake):
        client = TestClient(app)
        res = client.post("/infer", json={"text": "texto de test"})
    assert res.status_code == 200
    body = res.json()
    assert "big_five" in body
    for d in BIG_FIVE_DIMS:
        assert d in body["big_five"]


def test_infer_validates_empty_text():
    from fastapi.testclient import TestClient
    from src.api_server import app

    client = TestClient(app)
    res = client.post("/infer", json={"text": ""})
    assert res.status_code == 422  # Pydantic validation error


@pytest.mark.parametrize('text', [' ', '\n\t', ' \r\n '])
def test_infer_rejects_whitespace_before_loading_model(text):
    from fastapi.testclient import TestClient
    from src.api_server import app
    with patch('src.api_server._get_predictor') as predictor:
        assert TestClient(app).post('/infer', json={'text': text}).status_code == 422
        predictor.assert_not_called()


def test_health_does_not_call_lazy_instance_loaded(monkeypatch):
    from fastapi.testclient import TestClient
    from src import api_server
    from src.predict import Predictor
    monkeypatch.setattr(api_server, "_predictor", Predictor())
    assert TestClient(api_server.app).get("/health").json()["model_loaded"] is False


def test_eager_startup_loads_extractor_weights(tmp_path, monkeypatch):
    from fastapi.testclient import TestClient
    from src import api_server
    from src.predict import Predictor
    from tests.test_predict import _make_real_bundle

    class WeightLoader:
        _model = None

        def _ensure_loaded(self):
            self._model = object()

    predictor = Predictor(_make_real_bundle(tmp_path))
    predictor._extractor = WeightLoader()
    monkeypatch.setattr(api_server, "_predictor", predictor)
    monkeypatch.setenv("ML_EAGER_LOAD", "1")
    with TestClient(api_server.app) as client:
        assert predictor._extractor._model is not None
        assert client.get("/health").json()["model_loaded"] is True
