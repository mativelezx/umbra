"""FastAPI server — endpoint POST /infer del módulo ML propio.

ADR-026. Servido localmente en localhost:8000 (default) o en cloud
(Render/Fly.io vía Dockerfile + render.yaml). El frontend Next.js lo
consume vía lib/ml-client.ts usando ML_API_URL.

Endpoints:
- GET  /health      — health check (Render/K8s)
- GET  /version     — model version + thresholds
- POST /infer       — inferencia Big Five sobre texto introspectivo
"""

from __future__ import annotations

import logging
import os
import secrets
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator

from .predict import Predictor, get_default_predictor, BIG_FIVE_DIMS

logging.basicConfig(level=os.getenv("ML_LOG_LEVEL", "info").upper(),
                    format="[api_server] %(message)s")
log = logging.getLogger(__name__)


app = FastAPI(
    title="Umbra ML API",
    version="0.1.0",
    description="Inferencia Big Five (componente analítico propio del TFG Umbra). ADR-026.",
)

# CORS — el frontend Next.js puede correr en localhost:3000 (dev) o en
# Vercel (prod). En producción, restringir a dominios concretos.
allow_origins = os.getenv("ML_CORS_ORIGINS", "http://localhost:3000,https://umbra-sigma.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allow_origins if o.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_predictor: Optional[Predictor] = None


def require_service_key(x_ml_api_key: Optional[str] = Header(default=None)) -> None:
    """Server-to-server access; local development may run without a key."""
    expected = os.getenv("ML_API_KEY", "")
    public_runtime = os.getenv("VERCEL") == "1" or os.getenv("ML_REQUIRE_AUTH") == "1"
    if not expected:
        if public_runtime:
            raise HTTPException(status_code=503, detail="service_not_configured")
        return
    if not x_ml_api_key or not secrets.compare_digest(x_ml_api_key, expected):
        raise HTTPException(status_code=401, detail="unauthorized")


def require_admin_key(x_ml_api_key: Optional[str] = Header(default=None)) -> None:
    if not os.getenv("ML_API_KEY"):
        raise HTTPException(status_code=503, detail="service_not_configured")
    require_service_key(x_ml_api_key)


def _get_predictor() -> Predictor:
    global _predictor
    if _predictor is None:
        _predictor = get_default_predictor()
    return _predictor


@app.on_event("startup")
def _eager_load() -> None:
    """Carga el modelo al arrancar (ML_EAGER_LOAD=1, default en despliegue).

    Sin esto, la primera inferencia tras un arranque paga la carga de
    DistilBERT (~15-20 s). En el despliegue productivo conviene que el
    servicio ya esté caliente cuando pasa el health check.
    """
    if os.getenv("ML_EAGER_LOAD", "0") == "1":
        try:
            _get_predictor().load()
            log.info("modelo cargado al inicio (ML_EAGER_LOAD=1)")
        except Exception as exc:  # noqa: BLE001 — no impedir el arranque
            log.warning("carga anticipada fallida, se reintenta en la primera inferencia: %s", exc)


class InferRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=15000)

    @field_validator('text')
    @classmethod
    def require_written_content(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('Text must contain written content')
        # Preserve nonempty input exactly; changing preprocessing would alter
        # inference parity with the historical frozen model.
        return value


class InferResponse(BaseModel):
    # `model_version` colisiona con el espacio de nombres protegido `model_` de
    # pydantic v2; se libera para que el arranque no emita la advertencia.
    model_config = ConfigDict(protected_namespaces=())

    big_five: dict
    per_dimension_status: dict
    model_version: str
    elapsed_ms: int


@app.get("/health")
def health():
    return {"ok": True, "service": "umbra-ml",
            "model_loaded": _predictor is not None and _predictor.is_loaded()}


@app.get("/version")
def version():
    p = _get_predictor()
    return {
        "service": "umbra-ml",
        "model_version": p.model_version(),
        "dims": BIG_FIVE_DIMS,
        "thresholds": {"r2": 0.20, "r": 0.30},
        "per_dimension_status": p.per_dimension_status(),
    }


@app.post("/infer", response_model=InferResponse, dependencies=[Depends(require_service_key)])
def infer(req: InferRequest):
    try:
        p = _get_predictor()
        result = p.predict(req.text)
        return result
    except FileNotFoundError as e:
        log.error("Model bundle missing: %s", e)
        raise HTTPException(status_code=503, detail="model_unavailable")
    except Exception as e:
        log.exception("Infer failed: %s", e)
        raise HTTPException(status_code=500, detail="internal_error")


@app.post("/admin/reload-status", dependencies=[Depends(require_admin_key)])
def reload_status():
    """Recarga per_dimension_status desde eval_metrics.json. Útil tras
    re-entrenar y querer aplicar nuevos umbrales sin reiniciar."""
    p = _get_predictor()
    p.reload_status()
    return {"ok": True, "per_dimension_status": p.per_dimension_status()}
