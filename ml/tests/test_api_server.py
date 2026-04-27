"""Smoke tests del FastAPI.

Verifica health, version y que /infer maneje errores cuando no hay modelo.
"""

from unittest.mock import MagicMock, patch

import numpy as np
import pytest


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
