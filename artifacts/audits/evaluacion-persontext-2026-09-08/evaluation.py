"""Participant-level admission and aggregate external-evaluation statistics."""
from collections import defaultdict
import math
import unicodedata

import numpy as np
from scipy.stats import spearmanr
from sklearn.metrics import roc_auc_score

COLUMNS = dict(zip(
    ("openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"),
    ("apertura", "responsabilidad", "sociabilidad", "amabilidad", "neuroticismo"),
))


def normalize(text):
    return " ".join(unicodedata.normalize("NFKC", text).casefold().split())


def admit_rows(rows, historical_texts):
    if not rows:
        raise ValueError("Empty dataset")
    historical = {normalize(t) for t in historical_texts}
    seen, groups = set(), defaultdict(list)
    for row in rows:
        if not row.get("uid", "").strip() or not row.get("texto", "").strip():
            raise ValueError("Missing identifier/text")
        key = normalize(row["texto"])
        if key in seen:
            raise ValueError("Duplicate normalized text")
        if key in historical:
            raise ValueError("Historical text overlap")
        seen.add(key)
        try:
            age = float(row["edad_calculada"])
            values = {dim: float(row[column]) for dim, column in COLUMNS.items()}
        except (ValueError, KeyError, TypeError) as exc:
            raise ValueError("Invalid required age/score") from exc
        if not math.isfinite(age) or not 0 <= age <= 120:
            raise ValueError("Invalid age")
        if any(not math.isfinite(v) or not 0 <= v <= 1 for v in values.values()):
            raise ValueError("Invalid score")
        labels = {}
        for dim, column in COLUMNS.items():
            label = row.get("presenta_" + column)
            if label not in ("Sí", "No") or (label == "Sí") != (values[dim] > .6):
                raise ValueError("Label conflicts with the published CSV threshold")
            labels[dim] = int(label == "Sí")
        groups[row["uid"]].append({"text": row["texto"], "targets": values, "labels": labels, "age": age})
    people, excluded, used = [], 0, 0
    for group in groups.values():
        if any(item["targets"] != group[0]["targets"] for item in group):
            raise ValueError("Inconsistent participant questionnaire values")
        if any(item["age"] < 18 for item in group):
            excluded += 1
            continue
        text = "\n\n".join(item["text"] for item in group)
        if normalize(text) in historical:
            raise ValueError("Historical concatenated-text overlap")
        people.append({"text": text, "targets": group[0]["targets"], "labels": group[0]["labels"]})
        used += len(group)
    if not people:
        raise ValueError("No eligible adults")
    return people, {"records_downloaded": len(rows), "participants_downloaded": len(groups),
                    "participants_used": len(people), "records_used": used,
                    "participants_excluded_underage": excluded,
                    "records_excluded": len(rows) - used, "exact_normalized_overlap": 0,
                    "participant_identity_independence_across_studies": "not_verified"}


def measure(targets, labels, scores, repetitions=2000):
    target, label, score = (np.asarray(v, dtype=float) for v in (targets, labels, scores))
    if (target.ndim != 1 or target.shape != score.shape or target.shape != label.shape
            or len(target) < 3 or not np.isfinite([target, label, score]).all()
            or not np.isin(label, [0, 1]).all()):
        raise ValueError("Expected aligned finite participant arrays and binary labels")

    def rho(a, b):
        if np.ptp(a) == 0 or np.ptp(b) == 0:
            return None
        return float(spearmanr(a, b).statistic)

    def auc(a, b):
        return float(roc_auc_score(a, b)) if len(np.unique(a)) == 2 else None

    def interval(values):
        return np.percentile(values, [2.5, 97.5]).tolist() if values else None

    correlations, aucs = [], []
    rng = np.random.default_rng(20260908)
    for sample in rng.integers(0, len(target), size=(repetitions, len(target))):
        r, a = rho(target[sample], score[sample]), auc(label[sample], score[sample])
        if r is not None:
            correlations.append(r)
        if a is not None:
            aucs.append(a)
    return {"n": len(target), "positive_labels": int(label.sum()),
            "spearman": rho(target, score), "spearman_ci95": interval(correlations),
            "auc": auc(label, score), "auc_ci95": interval(aucs),
            "bootstrap_valid_rho": len(correlations), "bootstrap_valid_auc": len(aucs)}
