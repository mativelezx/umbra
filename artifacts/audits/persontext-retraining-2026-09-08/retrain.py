"""Frozen participant-level protocol, fresh models and transparent metrics."""
from pathlib import Path
import sys

import numpy as np
from scipy.stats import pearsonr, spearmanr
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge, RidgeCV
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import GridSearchCV, KFold
from sklearn.pipeline import Pipeline

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "evaluacion-persontext-2026-09-08"))
from evaluation import COLUMNS, admit_rows, normalize

SEED = 20260908
ALPHAS = (.1, 1., 10., 100., 1000.)


def admit_unique_responses(rows, historical_texts):
    """Audited pre-training amendment: remove only consistent within-UID repeats."""
    retained, seen = [], {}
    required = ["edad_calculada", *COLUMNS.values(), *("presenta_" + c for c in COLUMNS.values())]
    for row in rows:
        key = (row.get("uid"), normalize(row.get("texto", "")))
        if key in seen:
            if any(row.get(field) != seen[key].get(field) for field in required):
                raise ValueError("Conflicting duplicate response within participant")
        else:
            seen[key] = row
            retained.append(row)
    people, audit = admit_rows(retained, historical_texts)
    removed = len(rows)-len(retained)
    audit["records_downloaded"] = len(rows)
    audit["records_excluded"] += removed
    audit["same_participant_duplicate_records_removed"] = removed
    return people, audit


def partition(original, expanded, historical_texts):
    """Exclude every old UID from test, including ineligible development UIDs."""
    old_uids = {row["uid"] for row in original}
    new_rows = [row for row in expanded if row["uid"] not in old_uids]
    train, train_audit = admit_unique_responses(original, historical_texts)
    forbidden = set(historical_texts)
    forbidden.update(row["texto"] for row in original)
    forbidden.update(person["text"] for person in train)
    test, test_audit = admit_unique_responses(new_rows, forbidden)
    # Also reject a training concatenation equal to an individual test response.
    train_keys = {normalize(p["text"]) for p in train}
    if train_keys & {normalize(row["texto"]) for row in new_rows}:
        raise ValueError("Historical concatenated training text overlaps test")
    for people in (train, test):
        if len({normalize(p["text"]) for p in people}) != len(people):
            raise ValueError("Duplicate concatenated participant text")
    return train, test, {"development": train_audit, "test": test_audit,
                         "expanded_records": len(expanded),
                         "expanded_participants": len({r["uid"] for r in expanded}),
                         "shared_uids": len(old_uids & {r["uid"] for r in expanded}),
                         "cross_split_uid_overlap": 0, "cross_split_normalized_text_overlap": 0}


def outer_folds(count):
    return list(KFold(n_splits=5, shuffle=True, random_state=SEED).split(np.arange(count)))


def fit_candidate(kind, features, target):
    """All parameter selection uses only the supplied training participants."""
    inner = KFold(n_splits=5, shuffle=True, random_state=SEED)
    if kind == "distilbert":
        model = RidgeCV(alphas=ALPHAS, cv=inner, scoring="neg_mean_squared_error")
        return model.fit(features, target)
    if kind == "tfidf":
        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=10000,
                                     min_df=2, sublinear_tf=True)),
            ("ridge", Ridge()),
        ])
        search = GridSearchCV(pipeline, {"ridge__alpha": ALPHAS}, cv=inner,
                              scoring="neg_mean_squared_error", n_jobs=1,
                              error_score="raise", refit=True)
        return search.fit(list(features), target).best_estimator_
    raise ValueError("Unknown model kind")


def interface_scores(values):
    values = np.asarray(values, dtype=float)
    if not np.isfinite(values).all():
        raise ValueError("Non-finite model output")
    # Match Python round in the actual Predictor, including ties.
    return np.array([float(np.clip(round(float(v), 2), 0, 100)) for v in values])


def arrays(targets, predictions):
    target, prediction = (np.asarray(a, dtype=float) for a in (targets, predictions))
    if (target.ndim != 1 or target.shape != prediction.shape or len(target) < 3
            or not np.isfinite([target, prediction]).all()
            or np.any((target < 0) | (target > 100))
            or np.any((prediction < 0) | (prediction > 100))):
        raise ValueError("Expected aligned finite 0-100 participant arrays")
    return target, prediction


def point_metrics(targets, predictions):
    target, prediction = arrays(targets, predictions)
    error = target - prediction
    varying_target, varying_prediction = np.ptp(target) > 0, np.ptp(prediction) > 0
    label = (target > 60).astype(int)
    return {"n": len(target), "mae_points": float(np.mean(np.abs(error))),
            "rmse_points": float(np.sqrt(np.mean(error**2))),
            "r2": float(1 - np.sum(error**2) / np.sum((target-target.mean())**2)) if varying_target else None,
            "pearson": float(pearsonr(target, prediction).statistic) if varying_target and varying_prediction else None,
            "spearman": float(spearmanr(target, prediction).statistic) if varying_target and varying_prediction else None,
            "auc": float(roc_auc_score(label, prediction)) if len(np.unique(label)) == 2 else None,
            "positive_labels": int(label.sum())}


def paired_mae(targets, predictions, reference, repetitions=2000):
    target, prediction = arrays(targets, predictions)
    _, other = arrays(targets, reference)
    delta = np.abs(prediction-target) - np.abs(other-target)
    indices = np.random.default_rng(SEED).integers(0, len(target), (repetitions, len(target)))
    return {"delta_new_minus_reference_points": float(delta.mean()),
            "ci95": np.percentile(delta[indices].mean(axis=1), [2.5, 97.5]).tolist(),
            "bootstrap_participants": len(target), "bootstrap_repetitions": repetitions}


def metric_report(targets, predictions):
    report = point_metrics(targets, predictions)
    target, prediction = arrays(targets, predictions)
    indices = np.random.default_rng(SEED).integers(0, len(target), (2000, len(target)))
    a, b = target[indices], prediction[indices]
    errors = a-b
    total = np.sum((a-a.mean(axis=1, keepdims=True))**2, axis=1)
    valid = total > 0
    report["mae_ci95"] = np.percentile(np.abs(errors).mean(axis=1), [2.5, 97.5]).tolist()
    report["r2_ci95"] = np.percentile(1-np.sum(errors[valid]**2, axis=1)/total[valid], [2.5, 97.5]).tolist() if valid.any() else None
    report["numerical_gate_reached"] = bool(len(target) >= 30 and report["r2"] is not None
                                           and report["r2"] > .2 and report["pearson"] is not None
                                           and report["pearson"] > .3)
    return report
