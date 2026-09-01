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
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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
            _get_predictor()
            log.info("modelo cargado al inicio (ML_EAGER_LOAD=1)")
        except Exception as exc:  # noqa: BLE001 — no impedir el arranque
            log.warning("carga anticipada fallida, se reintenta en la primera inferencia: %s", exc)


class InferRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=15000)


class InferResponse(BaseModel):
    big_five: dict
    per_dimension_status: dict
    model_version: str
    elapsed_ms: int


@app.get("/health")
def health():
    return {"ok": True, "service": "umbra-ml", "model_loaded": _predictor is not None}


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


@app.post("/infer", response_model=InferResponse)
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


@app.post("/admin/reload-status")
def reload_status():
    """Recarga per_dimension_status desde eval_metrics.json. Útil tras
    re-entrenar y querer aplicar nuevos umbrales sin reiniciar."""
    p = _get_predictor()
    p.reload_status()
    return {"ok": True, "per_dimension_status": p.per_dimension_status()}
