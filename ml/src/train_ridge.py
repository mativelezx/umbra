"""Entrena 5 Ridge multi-output sobre embeddings DistilBERT congelados.

Etapa 2 del módulo ML propio (ADR-026). Toma los splits generados por
prepare_data.py, extrae embeddings con DistilBERT congelado, entrena 5
regresores Ridge independientes (uno por dimensión Big Five) con
RidgeCV sobre alpha, y persiste el bundle entrenado en
models/ridge_v1.joblib.

Tracking de experimentos con MLflow. Cada corrida registra: dimensión,
alpha óptimo, MSE / R² / r de Pearson sobre val, número de muestras,
seed, modelo embedding usado.

Tolerante a ausencia del corpus Essays: si solo hay latinoamericano,
entrena con dataset reducido y reporta honestamente las métricas.
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_squared_error, r2_score
from scipy.stats import pearsonr

from .extract_embeddings import EmbeddingExtractor, EMBEDDING_DIM, MODEL_NAME, MODEL_REVISION
from .embedding_cache import cached_embeddings

logging.basicConfig(level=logging.INFO, format="[train_ridge] %(message)s")
log = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent
SPLITS = ROOT / "data" / "splits"
MODELS = ROOT / "models"
EMBEDDINGS_CACHE = ROOT / "data" / "embeddings"
BIG_FIVE_DIMS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]
ALPHAS = (0.1, 1.0, 10.0, 100.0, 1000.0)
SEED = 42


def cache_or_compute_embeddings(
    df: pd.DataFrame, name: str, extractor: EmbeddingExtractor
) -> np.ndarray:
    return cached_embeddings(df["text"].astype(str).tolist(),
                             EMBEDDINGS_CACHE / f"{name}.npy", extractor)


def fit_per_dim(X_train, y_train_per_dim, X_val, y_val_per_dim, mlflow_module=None):
    models = {}
    val_metrics = {}
    for dim in BIG_FIVE_DIMS:
        y_train = y_train_per_dim[dim]
        mask_tr = ~np.isnan(y_train)
        n_tr = int(mask_tr.sum())
        if n_tr < 2:
            log.warning("dim=%s: train insuficiente (%d) — skip", dim, n_tr)
            continue
        X_tr_d = X_train[mask_tr]
        y_tr_d = y_train[mask_tr]
        cv = min(5, n_tr)
        try:
            model = RidgeCV(alphas=ALPHAS, cv=cv)
            model.fit(X_tr_d, y_tr_d)
        except Exception as e:
            log.warning("dim=%s: RidgeCV falló (%s) — fallback Ridge alpha=1", dim, e)
            from sklearn.linear_model import Ridge
            model = Ridge(alpha=1.0)
            model.fit(X_tr_d, y_tr_d)
        models[dim] = model

        # Val metrics
        y_val = y_val_per_dim[dim]
        mask_va = ~np.isnan(y_val)
        if mask_va.sum() >= 2:
            X_va_d = X_val[mask_va]
            y_va_d = y_val[mask_va]
            y_pred = model.predict(X_va_d)
            mse = float(mean_squared_error(y_va_d, y_pred))
            r2 = float(r2_score(y_va_d, y_pred)) if len(set(y_va_d.tolist())) > 1 else float("nan")
            try:
                r, _ = pearsonr(y_va_d, y_pred)
                r = float(r)
            except Exception:
                r = float("nan")
            val_metrics[dim] = {"n": int(mask_va.sum()), "mse": mse, "r2": r2, "r": r}
        else:
            val_metrics[dim] = {"n": int(mask_va.sum()), "note": "val insuficiente"}

        log.info("dim=%s: alpha=%s val=%s",
                 dim, getattr(model, "alpha_", None), val_metrics[dim])

        if mlflow_module is not None:
            try:
                with mlflow_module.start_run(run_name=f"ridge_{dim}", nested=True):
                    mlflow_module.log_param("dim", dim)
                    mlflow_module.log_param("model", MODEL_NAME)
                    mlflow_module.log_param("alpha", float(getattr(model, "alpha_", float("nan"))))
                    mlflow_module.log_param("n_train", n_tr)
                    if "mse" in val_metrics[dim]:
                        mlflow_module.log_metric("val_mse", val_metrics[dim]["mse"])
                        if val_metrics[dim]["r2"] == val_metrics[dim]["r2"]:  # not NaN
                            mlflow_module.log_metric("val_r2", val_metrics[dim]["r2"])
                        if val_metrics[dim]["r"] == val_metrics[dim]["r"]:
                            mlflow_module.log_metric("val_r", val_metrics[dim]["r"])
            except Exception as e:
                log.warning("mlflow log failed: %s", e)

    return models, val_metrics


def main():
    parser = argparse.ArgumentParser(description="Train 5 Ridge regressors on DistilBERT embeddings")
    parser.add_argument("--no-mlflow", action="store_true", help="Skip MLflow tracking")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--seed", type=int, default=SEED)
    args = parser.parse_args()

    np.random.seed(args.seed)

    train = pd.read_csv(SPLITS / "train.csv")
    val = pd.read_csv(SPLITS / "val.csv")
    log.info("train=%d, val=%d", len(train), len(val))

    extractor = EmbeddingExtractor(device=args.device)
    X_train = cache_or_compute_embeddings(train, "train", extractor)
    X_val = cache_or_compute_embeddings(val, "val", extractor)
    log.info("X_train=%s, X_val=%s", X_train.shape, X_val.shape)

    y_train = {dim: train[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}
    y_val = {dim: val[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}

    mlflow_module = None
    if not args.no_mlflow:
        try:
            import mlflow
            mlflow.set_tracking_uri(f"file://{(ROOT / 'mlruns').resolve()}")
            mlflow.set_experiment("umbra-bigfive-ridge")
            mlflow_module = mlflow
            log.info("MLflow tracking → %s", mlflow.get_tracking_uri())
        except ImportError:
            log.warning("mlflow no instalado — skip tracking")
        except Exception as e:
            log.warning("mlflow init failed (%s) — skip tracking", e)

    if mlflow_module is not None:
        with mlflow_module.start_run(run_name="ridge_v1_distilbert"):
            mlflow_module.log_param("seed", args.seed)
            mlflow_module.log_param("model", MODEL_NAME)
            mlflow_module.log_param("strategy", "frozen_embeddings + ridge_per_dim")
            mlflow_module.log_param("n_train", len(train))
            mlflow_module.log_param("n_val", len(val))
            models, val_metrics = fit_per_dim(X_train, y_train, X_val, y_val, mlflow_module)
    else:
        models, val_metrics = fit_per_dim(X_train, y_train, X_val, y_val)

    MODELS.mkdir(parents=True, exist_ok=True)
    bundle = {
        "models": models,
        "model_name": MODEL_NAME,
        "model_revision": MODEL_REVISION,
        "embedding_dim": EMBEDDING_DIM,
        "dims": BIG_FIVE_DIMS,
        "version": "ridge_v1",
        "seed": args.seed,
    }
    joblib.dump(bundle, MODELS / "ridge_v1.joblib")
    log.info("Bundle ridge_v1 → %s", MODELS / "ridge_v1.joblib")

    metrics_out = {
        "model": "distilbert_frozen + ridge_per_dim",
        "embedding_model": MODEL_NAME,
        "alphas_grid": list(ALPHAS),
        "best_alpha_per_dim": {d: float(getattr(m, "alpha_", float("nan"))) for d, m in models.items()},
        "val": val_metrics,
        "n_train": len(train),
        "n_val": len(val),
        "seed": args.seed,
    }
    with open(ROOT / "metrics.json", "w") as f:
        json.dump(metrics_out, f, indent=2)
    log.info("Métricas escritas en %s", ROOT / "metrics.json")


if __name__ == "__main__":
    main()
