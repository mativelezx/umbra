"""Baseline: Ridge sobre TF-IDF.

Entrena 5 regresores Ridge independientes (uno por dimensión Big Five)
sobre vectores TF-IDF del texto. Sirve como referencia mínima honesta
para comparar contra el modelo DistilBERT + Ridge (etapa 2 del módulo
ML propio, ADR-026).

La política de masking NaN: cada Ridge se entrena solo sobre las
muestras donde la dimensión target está disponible (no NaN). Esto
permite usar el corpus rioplatense (que etiqueta una dimensión por
caso) sin inventar scores en las otras cuatro dimensiones.

Evaluación adaptativa al tamaño del corpus:
- Si n_train_dim >= 30: usa el split fijo train/val/test (estándar).
- Si n_train_dim < 30: usa LeaveOneOut cross-validation sobre el
  conjunto disponible. Más honesto cuando el corpus es chico (típico
  cuando Essays no está disponible y solo se entrena con el corpus
  rioplatense propio n=20). Las métricas LOO se reportan en el bloque
  `loo_metrics` de metrics.json.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge, RidgeCV
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import LeaveOneOut
from scipy.stats import pearsonr

logging.basicConfig(level=logging.INFO, format="[baseline_tfidf] %(message)s")
log = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SPLITS = DATA / "splits"
MODELS = ROOT / "models"
BIG_FIVE_DIMS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]
ALPHAS = (0.1, 1.0, 10.0, 100.0, 1000.0)


def load_splits():
    train = pd.read_csv(SPLITS / "train.csv")
    val = pd.read_csv(SPLITS / "val.csv")
    test = pd.read_csv(SPLITS / "test.csv")
    return train, val, test


def fit_per_dim(X_train, y_train_per_dim, X_val, y_val_per_dim):
    """Entrena 5 Ridge independientes con masking NaN."""
    models = {}
    val_metrics = {}
    for dim in BIG_FIVE_DIMS:
        y_train = y_train_per_dim[dim]
        mask_tr = ~np.isnan(y_train)
        n_tr = int(mask_tr.sum())
        if n_tr < 2:
            log.warning("dim=%s: menos de 2 muestras de train (%d) — skip", dim, n_tr)
            continue
        X_tr_d = X_train[mask_tr]
        y_tr_d = y_train[mask_tr]
        # cv interno acotado por la cantidad de muestras
        cv = min(5, n_tr)
        try:
            model = RidgeCV(alphas=ALPHAS, cv=cv)
            model.fit(X_tr_d, y_tr_d)
        except Exception as e:
            log.warning("dim=%s: RidgeCV falló (%s) — fallback a Ridge alpha=1", dim, e)
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
            r2 = float(r2_score(y_va_d, y_pred)) if len(set(y_va_d)) > 1 else float("nan")
            try:
                r, _ = pearsonr(y_va_d, y_pred)
                r = float(r)
            except Exception:
                r = float("nan")
            val_metrics[dim] = {"n": int(mask_va.sum()), "mse": mse, "r2": r2, "r": r}
        else:
            val_metrics[dim] = {"n": int(mask_va.sum()), "mse": None, "r2": None, "r": None,
                                "note": "muestras de val insuficientes"}
        log.info("dim=%s: train_n=%d, val_metrics=%s", dim, n_tr, val_metrics[dim])
    return models, val_metrics


def loo_metrics_per_dim(X_full, y_full_per_dim, df_full):
    """LeaveOneOut por dimensión para corpus chicos.

    Para cada dimensión, hace LOO sobre las muestras donde la dimensión
    está disponible. Retorna predicciones held-out y métricas agregadas
    (MSE, R², r).
    """
    out = {}
    bundles = {}
    for dim in BIG_FIVE_DIMS:
        y = y_full_per_dim[dim]
        mask = ~np.isnan(y)
        n = int(mask.sum())
        if n < 3:
            out[dim] = {"n": n, "method": "loo", "note": "muestras insuficientes (n<3)"}
            continue
        Xd = X_full[mask]
        yd = y[mask]
        loo = LeaveOneOut()
        preds = np.zeros_like(yd, dtype=float)
        alphas_used = []
        for fold_idx, (tr, te) in enumerate(loo.split(Xd)):
            try:
                cv_inner = min(5, max(2, len(tr) - 1))
                m = RidgeCV(alphas=ALPHAS, cv=cv_inner)
                m.fit(Xd[tr], yd[tr])
                alphas_used.append(float(m.alpha_))
            except Exception:
                m = Ridge(alpha=1.0)
                m.fit(Xd[tr], yd[tr])
                alphas_used.append(1.0)
            preds[te] = m.predict(Xd[te])

        mse = float(mean_squared_error(yd, preds))
        r2 = float(r2_score(yd, preds)) if len(set(yd.tolist())) > 1 else float("nan")
        try:
            r, _ = pearsonr(yd, preds)
            r = float(r)
        except Exception:
            r = float("nan")
        out[dim] = {
            "n": n,
            "method": "leave_one_out",
            "mse": mse,
            "r2": r2,
            "r": r,
            "alpha_median": float(np.median(alphas_used)) if alphas_used else None,
        }
        # Modelo final: entrenado sobre todas las muestras de la dimensión
        m_final = RidgeCV(alphas=ALPHAS, cv=min(5, n))
        try:
            m_final.fit(Xd, yd)
        except Exception:
            m_final = Ridge(alpha=1.0)
            m_final.fit(Xd, yd)
        bundles[dim] = m_final
        log.info("[LOO] dim=%s n=%d → %s", dim, n, out[dim])
    return bundles, out


def main():
    log.info("Loading splits...")
    train, val, test = load_splits()
    log.info("train=%d, val=%d, test=%d", len(train), len(val), len(test))

    log.info("Fit TF-IDF on train texts...")
    vectorizer = TfidfVectorizer(
        max_features=10_000,
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.95,
        sublinear_tf=True,
    )
    X_train = vectorizer.fit_transform(train["text"].astype(str))
    log.info("TF-IDF shape: train=%s, vocab=%d", X_train.shape, len(vectorizer.vocabulary_))

    y_train = {dim: train[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}

    use_loo = len(train) < 30
    metrics_out = {
        "model": "baseline_tfidf_ridge",
        "alphas_grid": list(ALPHAS),
        "n_train": len(train),
        "n_val": len(val),
        "n_test": len(test),
        "evaluation_method": "leave_one_out" if use_loo else "split_train_val_test",
    }

    if use_loo:
        # Corpus chico: LOO sobre TODO el dataset (train+val+test) para
        # tener métricas estables. Si n>=3 por dimensión, LOO devuelve
        # MSE/R²/r honestos.
        full = pd.concat([train, val, test], ignore_index=True)
        X_full = vectorizer.transform(full["text"].astype(str))
        y_full = {dim: full[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}
        log.info("Corpus chico (n=%d < 30) — usando Leave-One-Out CV sobre todo el dataset.", len(full))
        models, loo = loo_metrics_per_dim(X_full, y_full, full)
        metrics_out["loo_metrics"] = loo
        metrics_out["n_full"] = len(full)
    else:
        X_val = vectorizer.transform(val["text"].astype(str))
        X_test = vectorizer.transform(test["text"].astype(str))
        y_val = {dim: val[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}
        y_test = {dim: test[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}
        models, val_metrics = fit_per_dim(X_train, y_train, X_val, y_val)

        # Test metrics
        test_metrics = {}
        for dim, model in models.items():
            y_te = y_test[dim]
            mask = ~np.isnan(y_te)
            if mask.sum() < 2:
                test_metrics[dim] = {"n": int(mask.sum()), "note": "test insuficiente"}
                continue
            X_te_d = X_test[mask]
            y_te_d = y_te[mask]
            y_pred = model.predict(X_te_d)
            mse = float(mean_squared_error(y_te_d, y_pred))
            r2 = float(r2_score(y_te_d, y_pred)) if len(set(y_te_d)) > 1 else float("nan")
            try:
                r, _ = pearsonr(y_te_d, y_pred)
                r = float(r)
            except Exception:
                r = float("nan")
            test_metrics[dim] = {"n": int(mask.sum()), "mse": mse, "r2": r2, "r": r}
            log.info("dim=%s test: %s", dim, test_metrics[dim])
        metrics_out["val"] = val_metrics
        metrics_out["test"] = test_metrics

    metrics_out["best_alpha_per_dim"] = {
        d: float(getattr(m, "alpha_", float("nan"))) for d, m in models.items()
    }

    # Save artifact + métricas
    MODELS.mkdir(parents=True, exist_ok=True)
    bundle = {
        "vectorizer": vectorizer,
        "models": models,
        "dims": BIG_FIVE_DIMS,
    }
    joblib.dump(bundle, MODELS / "baseline_tfidf.joblib")
    log.info("Bundle baseline → %s", MODELS / "baseline_tfidf.joblib")

    with open(ROOT / "metrics.json", "w") as f:
        json.dump(metrics_out, f, indent=2)
    log.info("Métricas baseline escritas en %s", ROOT / "metrics.json")


if __name__ == "__main__":
    main()
