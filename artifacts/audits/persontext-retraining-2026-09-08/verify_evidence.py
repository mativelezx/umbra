"""Independently reconcile saved predictions, metrics, provenance and model fits.

Reads private research files locally; emits no text, UIDs or individual scores.
Does not fit a model, call a remote service or change the held-out experiment.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from scipy.stats import pearsonr, spearmanr
from sklearn.metrics import roc_auc_score
import mlflow

from run_retraining import admission, sources, vectors


def verify(private, ml_root, work):
    result = json.loads((work/"results.json").read_text())
    manifest = json.loads((private/"training-manifest.json").read_text())
    assert sources(ml_root, private) == manifest["inputs"]
    assert hashlib.sha256((private/"training-manifest.json").read_bytes()).hexdigest() == result["training_manifest_sha256"]
    assert json.loads((work/"training-manifest.json").read_text()) == manifest
    for name, expected in manifest["frozen_outputs"].items():
        assert hashlib.sha256((private/name).read_bytes()).hexdigest() == expected
    begun = json.loads((private/"test-start.json").read_text())
    assert datetime.fromisoformat(manifest["frozen_at"]) < datetime.fromisoformat(begun["started_at"])
    train, heldout, audit = admission(ml_root, private)
    train_text, train_target = vectors(train)
    test_text, test_target = vectors(heldout)
    assert len(train) == 80 and len(heldout) == 30
    assert audit["test"]["records_used"] == 89
    assert audit["test"]["same_participant_duplicate_records_removed"] == 1
    saved = np.load(private/"test-predictions.npz")
    np.testing.assert_array_equal(saved["target"], test_target)
    np.testing.assert_allclose(train_target.mean(axis=0), manifest["training_mean"], atol=0, rtol=0)
    assert test_target.shape == (30, 5)
    dims = list(result["metrics"]["new_distilbert"])
    discrepancies, paired_discrepancies = [], []
    for name, reports in result["metrics"].items():
        prediction = saved[name]
        assert prediction.shape == (30, 5) and np.isfinite(prediction).all()
        for j, dim in enumerate(dims):
            target, values = test_target[:, j], prediction[:, j]
            independent = {"mae_points": mean_absolute_error(target, values),
                           "rmse_points": np.sqrt(mean_squared_error(target, values)),
                           "r2": r2_score(target, values)}
            if np.ptp(values) > 0 and np.ptp(target) > 0:
                independent["pearson"] = pearsonr(target, values).statistic
                independent["spearman"] = spearmanr(target, values).statistic
            else:
                assert reports[dim]["pearson"] is None and reports[dim]["spearman"] is None
            label = target > 60
            if len(np.unique(label)) == 2:
                independent["auc"] = roc_auc_score(label, values)
            for metric, actual in independent.items():
                discrepancies.append(abs(actual-reports[dim][metric]))
                np.testing.assert_allclose(actual, reports[dim][metric], atol=1e-12, rtol=0)
            gate = len(target) >= 30 and independent["r2"] > .2 and independent.get("pearson", -1) > .3
            assert reports[dim]["numerical_gate_reached"] == gate
            if name != "new_distilbert":
                observed = result["paired_mae_new_minus_reference"][name][dim]
                individual_errors = np.abs(saved["new_distilbert"][:, j]-target)-np.abs(values-target)
                rng = np.random.default_rng(20260908)
                bootstrap = [individual_errors[rng.integers(0, len(target), len(target))].mean() for _ in range(2000)]
                independent_ci = np.quantile(bootstrap, [.025, .975])
                np.testing.assert_allclose(independent_ci, observed["ci95"], atol=1e-12, rtol=0)
                np.testing.assert_allclose(individual_errors.mean(), observed["delta_new_minus_reference_points"], atol=1e-12, rtol=0)
                paired_discrepancies.append(float(np.max(np.abs(independent_ci-observed["ci95"]))))
    # Re-infer from the frozen saved models and embeddings; no parameter changes.
    embedding = np.load(private/"test-embeddings.npz")["features"]
    bundle = joblib.load(private/"ridge_persontext_v1.joblib")
    old = joblib.load(ml_root/"models/ridge_v1.joblib")
    simple = joblib.load(private/"tfidf_persontext_v1.joblib")
    vocabulary_checks, coefficient_changes = {}, {}
    for j, dim in enumerate(dims):
        regressor = bundle["models"][dim]
        output = [min(100, max(0, round(float(v), 2))) for v in regressor.predict(embedding)]
        np.testing.assert_allclose(output, saved["new_distilbert"][:, j], atol=.02, rtol=0)
        assert float(regressor.alpha_) == manifest["selected_alphas"]["distilbert"]["final"][dim]
        difference = float(np.linalg.norm(regressor.coef_-old["models"][dim].coef_))
        assert difference > 0
        coefficient_changes[dim] = difference
        pipeline = simple["models"][dim]
        vocabulary = pipeline.named_steps["tfidf"].vocabulary_
        analyzer = pipeline.named_steps["tfidf"].build_analyzer()
        training_tokens = {word for text in train_text for word in analyzer(text)}
        test_tokens = {word for text in test_text for word in analyzer(text)}
        assert set(vocabulary) <= training_tokens
        leaked = set(vocabulary) & (test_tokens-training_tokens)
        assert not leaked
        vocabulary_checks[dim] = {"size": len(vocabulary), "holdout_only_tokens_in_vocabulary": len(leaked)}
        simple_output = [min(100, max(0, round(float(v), 2))) for v in pipeline.predict(test_text)]
        np.testing.assert_allclose(simple_output, saved["new_tfidf"][:, j], atol=.02, rtol=0)
    client = mlflow.tracking.MlflowClient(tracking_uri=(private/"mlruns").as_uri())
    runs = {}
    for key in ("mlflow_training_run_id", "mlflow_test_run_id"):
        run = client.get_run(result[key])
        assert run.info.status == "FINISHED"
        runs[key] = {"id": result[key], "status": run.info.status, "metric_count": len(run.data.metrics)}
    return {"verified_at": datetime.now(timezone.utc).isoformat(), "passed": True,
            "metric_cells_recomputed": len(discrepancies),
            "metric_max_absolute_discrepancy": float(max(discrepancies)),
            "paired_ci_cells_recomputed": len(paired_discrepancies),
            "paired_ci_max_absolute_discrepancy": float(max(paired_discrepancies)),
            "vocabulary_checks": vocabulary_checks, "new_vs_old_coefficient_l2_distance": coefficient_changes,
            "mlflow_runs": runs, "frozen_before_test": True, "inputs_and_originals_unchanged": True,
            "candidate_and_simple_serialized_predictions_reproduced": True,
            "test_set_refitted": False, "production_changed": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--private", type=Path, required=True)
    parser.add_argument("--ml-root", type=Path, required=True)
    args = parser.parse_args()
    work = Path(__file__).resolve().parent
    evidence = verify(args.private, args.ml_root, work)
    # This verification output may be regenerated; model/test evidence is immutable.
    (work/"verification.json").write_text(json.dumps(evidence, indent=2, ensure_ascii=False, allow_nan=False) + "\n")
    print(json.dumps(evidence, indent=2))
