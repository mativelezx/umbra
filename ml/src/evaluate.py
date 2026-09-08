"""Evaluación final del modelo entrenado sobre el split de test.

Reporta MSE / R² / r de Pearson **por dimensión Big Five**, en tres
bloques (ADR-028):
- english_only — solo casos del corpus Essays
- latinoamericano_only — solo casos del corpus latinoamericano propio
- combined — sobre la unión

El bloque latinoamericano_only corresponde al idioma de uso. En el bundle
actual contiene solo dos viñetas sintéticas y no acredita validez individual.

Marca cada dimensión como "ok" o "low_confidence" según los umbrales
mínimos del módulo ML (ADR-026 + ADR-027): R² > 0.20 y r > 0.30.

Modos de operación:
- Si existe `models/ridge_v1.joblib` (DistilBERT + Ridge), evalúa
  sobre embeddings DistilBERT (modo principal).
- Si no existe pero sí `models/baseline_tfidf.joblib`, evalúa el
  baseline TF-IDF como fallback con el flag `model_type="baseline_tfidf"`.
- Si el corpus es chico (n < 30), reporta también métricas LOO
  agregadas al final del archivo, además del bloque de splits.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    balanced_accuracy_score,
    f1_score,
    mean_squared_error,
    r2_score,
    roc_auc_score,
)
from sklearn.model_selection import LeaveOneOut
from sklearn.linear_model import Ridge, RidgeCV
from scipy.stats import pearsonr
from .embedding_cache import cached_embeddings

logging.basicConfig(level=logging.INFO, format="[evaluate] %(message)s")
log = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent
SPLITS = ROOT / "data" / "splits"
MODELS = ROOT / "models"
EMBEDDINGS_CACHE = ROOT / "data" / "embeddings"
BIG_FIVE_DIMS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]

R2_THRESHOLD = 0.20
R_THRESHOLD = 0.30
ROC_AUC_THRESHOLD = 0.60
BALANCED_ACC_THRESHOLD = 0.55
ALPHAS = (0.1, 1.0, 10.0, 100.0, 1000.0)


def per_dim_metrics(model, X, y) -> dict:
    mask = ~np.isnan(y)
    n = int(mask.sum())
    if n < 2:
        return {"n": n, "note": "muestras insuficientes"}
    y_d = y[mask]
    X_d = X[mask]
    y_pred = model.predict(X_d)
    mse = float(mean_squared_error(y_d, y_pred))
    r2 = float(r2_score(y_d, y_pred)) if len(set(y_d.tolist())) > 1 else float("nan")
    try:
        r, p_value = pearsonr(y_d, y_pred)
        r = float(r)
        p_value = float(p_value)
    except Exception:
        r, p_value = float("nan"), float("nan")
    return {"n": n, "mse": mse, "r2": r2, "r": r, "p_value": p_value}


def status_for(metrics: dict) -> str:
    if "r2" not in metrics or metrics["r2"] is None or metrics["r2"] != metrics["r2"]:
        return "low_confidence"
    if metrics["r2"] > R2_THRESHOLD and (metrics.get("r") or 0) > R_THRESHOLD:
        return "ok"
    return "low_confidence"


def binary_status_for(metrics: dict) -> str:
    if "roc_auc" not in metrics or metrics["roc_auc"] is None:
        return "not_applicable"
    if metrics["roc_auc"] >= ROC_AUC_THRESHOLD and metrics.get("balanced_accuracy", 0) >= BALANCED_ACC_THRESHOLD:
        return "ok"
    return "low_confidence"


def maybe_binary_metrics(model, X, y) -> dict | None:
    """Clasificación rasgo alto/bajo cuando el target es binario.

    El mirror abierto de Essays trae etiquetas 0/1, que prepare_data.py
    escala a 0/100. Para ese caso, R² de regresión no es la única lectura
    honesta: también reportamos AUC/F1/balanced accuracy sobre la frontera
    de 50 puntos. No se aplica a scores continuos reales.
    """
    mask = ~np.isnan(y)
    n = int(mask.sum())
    if n < 2:
        return None
    y_d = y[mask]
    unique = set(np.unique(y_d).tolist())
    if not unique.issubset({0.0, 1.0, 100.0}):
        return None
    y_true = (y_d >= 50).astype(int)
    if len(set(y_true.tolist())) < 2:
        return {
            "n": n,
            "note": "una sola clase presente; métricas binarias no definidas",
        }
    scores = model.predict(X[mask])
    labels = (scores >= 50).astype(int)
    try:
        roc_auc = float(roc_auc_score(y_true, scores))
    except Exception:
        roc_auc = float("nan")
    return {
        "n": n,
        "label_type": "binary_high_trait",
        "decision_threshold": 50,
        "roc_auc": roc_auc,
        "balanced_accuracy": float(balanced_accuracy_score(y_true, labels)),
        "f1": float(f1_score(y_true, labels, zero_division=0)),
    }


def evaluate_block(models, df: pd.DataFrame, X: np.ndarray, label: str) -> dict:
    block = {
        "n_samples": len(df),
        "metrics": {},
        "per_dimension_status": {},
        "classification_metrics": {},
        "per_dimension_classification_status": {},
    }
    for dim in BIG_FIVE_DIMS:
        if dim not in models:
            block["metrics"][dim] = {"n": 0, "note": "modelo no entrenado para esta dimensión"}
            block["per_dimension_status"][dim] = "low_confidence"
            block["per_dimension_classification_status"][dim] = "not_applicable"
            continue
        y = df[dim].to_numpy(dtype=float)
        m = per_dim_metrics(models[dim], X, y)
        block["metrics"][dim] = m
        block["per_dimension_status"][dim] = status_for(m)
        bm = maybe_binary_metrics(models[dim], X, y)
        if bm is not None:
            block["classification_metrics"][dim] = bm
            block["per_dimension_classification_status"][dim] = binary_status_for(bm)
        else:
            block["per_dimension_classification_status"][dim] = "not_applicable"
        log.info("[%s] dim=%s: %s → %s", label, dim, m, block["per_dimension_status"][dim])
        if bm is not None:
            log.info(
                "[%s] dim=%s binary: %s → %s",
                label,
                dim,
                bm,
                block["per_dimension_classification_status"][dim],
            )
    return block


def loo_full_corpus(vectorizer, full_df: pd.DataFrame) -> dict:
    """LOO sobre todo el corpus para reporte cuando n<30.

    Usa el mismo vectorizer baseline; solo aplica si el modo es baseline.
    """
    X_full = vectorizer.transform(full_df["text"].astype(str))
    out = {}
    for dim in BIG_FIVE_DIMS:
        y = full_df[dim].to_numpy(dtype=float)
        mask = ~np.isnan(y)
        n = int(mask.sum())
        if n < 3:
            out[dim] = {"n": n, "method": "leave_one_out", "note": "muestras insuficientes (n<3)"}
            continue
        Xd = X_full[mask]
        yd = y[mask]
        loo = LeaveOneOut()
        preds = np.zeros_like(yd, dtype=float)
        for tr, te in loo.split(Xd):
            try:
                m = RidgeCV(alphas=ALPHAS, cv=min(5, max(2, len(tr) - 1)))
                m.fit(Xd[tr], yd[tr])
            except Exception:
                m = Ridge(alpha=1.0)
                m.fit(Xd[tr], yd[tr])
            preds[te] = m.predict(Xd[te])
        mse = float(mean_squared_error(yd, preds))
        r2 = float(r2_score(yd, preds)) if len(set(yd.tolist())) > 1 else float("nan")
        try:
            r, p_val = pearsonr(yd, preds)
            r = float(r); p_val = float(p_val)
        except Exception:
            r, p_val = float("nan"), float("nan")
        out[dim] = {"n": n, "method": "leave_one_out", "mse": mse,
                    "r2": r2, "r": r, "p_value": p_val}
    return out


def detect_model_bundle():
    """Devuelve (bundle, model_type, vectorizer_or_extractor)."""
    ridge_v1 = MODELS / "ridge_v1.joblib"
    baseline = MODELS / "baseline_tfidf.joblib"
    if ridge_v1.exists():
        bundle = joblib.load(ridge_v1)
        try:
            from .extract_embeddings import EmbeddingExtractor, MODEL_NAME, MODEL_REVISION
            extractor = EmbeddingExtractor(
                model_name=bundle.get("model_name", MODEL_NAME),
                revision=bundle.get("model_revision", MODEL_REVISION),
            )
        except Exception as e:
            log.warning("DistilBERT extractor no disponible: %s — fallback a baseline", e)
            if baseline.exists():
                bundle = joblib.load(baseline)
                return bundle, "baseline_tfidf", bundle.get("vectorizer")
            raise
        return bundle, "distilbert_ridge", extractor
    elif baseline.exists():
        bundle = joblib.load(baseline)
        return bundle, "baseline_tfidf", bundle.get("vectorizer")
    raise FileNotFoundError(
        "No se encontró ningún bundle entrenado (ni ridge_v1.joblib ni "
        "baseline_tfidf.joblib). Correr `make baseline` o `make train` primero."
    )


def encode_for_model(test, bundle_kind, vec_or_ext):
    if bundle_kind == "baseline_tfidf":
        return vec_or_ext.transform(test["text"].astype(str))
    # DistilBERT
    return cached_embeddings(test["text"].astype(str).tolist(),
                             EMBEDDINGS_CACHE / "test.npy", vec_or_ext)


def main():
    test = pd.read_csv(SPLITS / "test.csv")
    bundle, model_type, vec_or_ext = detect_model_bundle()
    models = bundle["models"]
    log.info("Modelo: %s · dimensiones disponibles: %s", model_type, list(models.keys()))

    X_test = encode_for_model(test, model_type, vec_or_ext)
    log.info("X_test shape=%s", X_test.shape)

    out = {
        "model_type": model_type,
        "model_version": bundle.get("version", model_type),
        "embedding_model": bundle.get("model_name") if model_type == "distilbert_ridge" else "tfidf_unigram_bigram",
        "thresholds": {
            "regression": {"r2": R2_THRESHOLD, "r": R_THRESHOLD},
            "binary": {"roc_auc": ROC_AUC_THRESHOLD, "balanced_accuracy": BALANCED_ACC_THRESHOLD},
        },
        "blocks": {},
    }

    # combined
    out["blocks"]["combined"] = evaluate_block(models, test, X_test, "combined")

    # english_only
    en_mask = (test["language"] == "en").to_numpy() if "language" in test else np.zeros(len(test), dtype=bool)
    if en_mask.sum() >= 2:
        out["blocks"]["english_only"] = evaluate_block(
            models, test[en_mask].reset_index(drop=True),
            (X_test[en_mask] if model_type == "distilbert_ridge" else X_test[en_mask]),
            "english_only",
        )
    else:
        out["blocks"]["english_only"] = {"n_samples": int(en_mask.sum()),
                                         "note": "muestras de inglés insuficientes en test (Essays no integrado)"}

    # latinoamericano_only
    es_mask = (test["language"] == "es-AR").to_numpy() if "language" in test else np.ones(len(test), dtype=bool)
    if es_mask.sum() >= 2:
        out["blocks"]["latinoamericano_only"] = evaluate_block(
            models, test[es_mask].reset_index(drop=True),
            (X_test[es_mask] if model_type == "distilbert_ridge" else X_test[es_mask]),
            "latinoamericano_only",
        )
    else:
        out["blocks"]["latinoamericano_only"] = {"n_samples": int(es_mask.sum()),
                                             "note": "muestras de latinoamericano en test insuficientes (n<2)"}

    # LOO honesto sobre todo el corpus si es chico (typical caso sin Essays)
    train = pd.read_csv(SPLITS / "train.csv")
    val = pd.read_csv(SPLITS / "val.csv")
    full = pd.concat([train, val, test], ignore_index=True)
    if model_type == "baseline_tfidf" and len(full) < 50:
        log.info("Corpus chico (n=%d) — agregando bloque loo_full sobre TODO el dataset.", len(full))
        out["blocks"]["loo_full_corpus_baseline"] = {
            "n_samples": len(full),
            "note": ("Métricas Leave-One-Out sobre todo el corpus disponible. "
                     "Usadas cuando el split fijo train/val/test deja n<2 por dimensión "
                     "en test. Esta es la métrica primary mientras Essays no esté integrado."),
            "metrics": loo_full_corpus(vec_or_ext, full),
        }
        # Promueve LOO al per_dimension_status efectivo
        loo = out["blocks"]["loo_full_corpus_baseline"]["metrics"]
        out["blocks"]["loo_full_corpus_baseline"]["per_dimension_status"] = {
            dim: status_for(m) for dim, m in loo.items()
        }

    # Documentación honesta
    essays_integrated = bool(full["origin"].eq("essays").any()) if "origin" in full.columns else False
    out["dataset_status"] = {
        "essays_integrated": essays_integrated,
        "n_train": int(len(train)),
        "n_val": int(len(val)),
        "n_test": int(len(test)),
        "n_full": int(len(full)),
        "warning": (
            "Essays no integrado: las métricas reportadas se basan únicamente "
            "en viñetas sintéticas latinoamericanas (n=20, etiquetas heurísticas). El poder "
            "estadístico es bajo. Para reproducir las métricas comprometidas "
            "en el TFG, descargar Essays según ml/data/essays/README.md y "
            "re-ejecutar `make all`."
        ) if not essays_integrated else None,
    }

    with open(ROOT / "eval_metrics.json", "w") as f:
        json.dump(out, f, indent=2)
    log.info("eval_metrics.json escrito.")


if __name__ == "__main__":
    main()
