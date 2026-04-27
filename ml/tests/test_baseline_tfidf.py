"""Tests del baseline TF-IDF + Ridge.

Smoke test sin dependencia de DistilBERT. Verifica que con un dataset
sintético muy chico el pipeline corre sin errores y devuelve un bundle
serializable.
"""

import numpy as np
import pandas as pd

from src.baseline_tfidf import fit_per_dim, BIG_FIVE_DIMS
from sklearn.feature_extraction.text import TfidfVectorizer


def make_synthetic_dataset(n: int = 24, seed: int = 0):
    rng = np.random.default_rng(seed)
    rows = []
    for i in range(n):
        dim = BIG_FIVE_DIMS[i % len(BIG_FIVE_DIMS)]
        direction = "high" if i % 2 == 0 else "low"
        target = 80 if direction == "high" else 20
        text = f"caso sintético {i}: {dim} {direction} con vocabulario distinto número {rng.integers(1000)}"
        row = {d: float("nan") for d in BIG_FIVE_DIMS}
        row[dim] = target
        row["text"] = text
        rows.append(row)
    return pd.DataFrame(rows)


def test_fit_per_dim_runs():
    train = make_synthetic_dataset(24, seed=1)
    val = make_synthetic_dataset(10, seed=2)

    vec = TfidfVectorizer(max_features=200, ngram_range=(1, 1))
    X_train = vec.fit_transform(train["text"].astype(str))
    X_val = vec.transform(val["text"].astype(str))

    y_train = {dim: train[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}
    y_val = {dim: val[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}

    models, val_metrics = fit_per_dim(X_train, y_train, X_val, y_val)
    assert len(models) >= 1, "Al menos una dimensión debería tener modelo entrenado"
    for dim, model in models.items():
        # predict no debe explotar
        y_pred = model.predict(X_val[:1])
        assert y_pred.shape == (1,), f"Predicción inválida para {dim}"


def test_bundle_serializable(tmp_path):
    import joblib
    train = make_synthetic_dataset(24, seed=3)
    val = make_synthetic_dataset(10, seed=4)
    vec = TfidfVectorizer(max_features=200, ngram_range=(1, 1))
    X_train = vec.fit_transform(train["text"].astype(str))
    X_val = vec.transform(val["text"].astype(str))
    y_train = {dim: train[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}
    y_val = {dim: val[dim].to_numpy(dtype=float) for dim in BIG_FIVE_DIMS}
    models, _ = fit_per_dim(X_train, y_train, X_val, y_val)
    bundle = {"vectorizer": vec, "models": models, "dims": BIG_FIVE_DIMS}
    out = tmp_path / "test_bundle.joblib"
    joblib.dump(bundle, out)
    loaded = joblib.load(out)
    assert set(loaded["dims"]) == set(BIG_FIVE_DIMS)
