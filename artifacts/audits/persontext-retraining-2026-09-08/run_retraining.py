"""Two separate phases: fit/freeze on v1 adults, then evaluate new v2 adults."""
import argparse
import csv
from datetime import datetime, timezone
import hashlib
from importlib.metadata import version
import json
import os
from pathlib import Path
import sys
import time

import joblib
import numpy as np
from threadpoolctl import threadpool_limits

from retrain import (COLUMNS, SEED, ALPHAS, partition, outer_folds, fit_candidate,
                     interface_scores, metric_report, paired_mae)

WORK = Path(__file__).resolve().parent
DIMS = list(COLUMNS)
DATA_HASHES = {
    "persontext-v1.csv": "d51831462e26828083b44c6eb125f9307296fef9728e5173d646b0e932748eed",
    "persontext-v2.csv": "f9f28b56f25a9dec7fb8c634bb58fdc55f57e2bb512d0cbfe04e3ffa4ac6132d",
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def save(path, data):
    with path.open("x", encoding="utf-8") as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2, allow_nan=False)


def now():
    return datetime.now(timezone.utc).isoformat()


def read_csv(path):
    with path.open(encoding="utf-8-sig") as stream:
        return list(csv.DictReader(stream))


def sources(ml_root, private):
    original_files = ["models/ridge_v1.joblib", "models/baseline_tfidf.joblib", "eval_metrics.json",
                      "src/predict.py", "src/extract_embeddings.py", "src/train_ridge.py",
                      "data/splits/train.csv", "data/splits/val.csv", "data/splits/test.csv"]
    hashes = {"original/" + name: digest(ml_root/name) for name in original_files}
    for name, expected in DATA_HASHES.items():
        actual = digest(private/name)
        if actual != expected:
            raise ValueError("Official dataset hash changed")
        hashes[name] = actual
        hashes[name + ".dvc"] = digest(private/(name + ".dvc"))
    for name in ("PROTOCOLO.md", "ADENDA-CALIDAD.md", "test_retrain.py", "retrain.py", "run_retraining.py"):
        hashes[name] = digest(WORK/name)
    hashes["admission_helper"] = digest(WORK.parent/"evaluacion-persontext-2026-09-08/evaluation.py")
    return hashes


def admission(ml_root, private):
    historical = set()
    for split in ("train", "val", "test"):
        historical.update(row["text"] for row in read_csv(ml_root/f"data/splits/{split}.csv"))
    train, test, audit = partition(read_csv(private/"persontext-v1.csv"),
                                    read_csv(private/"persontext-v2.csv"), historical)
    if len(train) != 80 or len(test) != 30:
        raise ValueError("Admission differs from the frozen protocol")
    return train, test, audit


def vectors(people):
    return [p["text"] for p in people], np.array([[p["targets"][d]*100 for d in DIMS] for p in people])


def metric_set(target, scores):
    return {d: metric_report(target[:, j], scores[:, j]) for j, d in enumerate(DIMS)}


def selected_alpha(kind, model):
    return float(model.alpha_ if kind == "distilbert" else model.named_steps["ridge"].alpha)


def predict_heads(models, features):
    return np.column_stack([interface_scores(models[d].predict(features)) for d in DIMS])


def mlflow_metrics(mlflow, model_name, metrics):
    for dim, by_name in metrics.items():
        for key in ("mae_points", "rmse_points", "r2", "pearson", "spearman", "auc"):
            if by_name[key] is not None:
                mlflow.log_metric(f"{model_name}.{dim}.{key}", by_name[key])


def train(args, mlflow, extractor, revision):
    hashes = sources(args.ml_root, args.private)
    people, _, audit = admission(args.ml_root, args.private)
    save(args.private/"training-start.json", {"started_at": now(), "inputs": hashes, "admission": audit})
    texts, target = vectors(people)
    embedding = extractor.encode(texts)
    if embedding.shape != (80, 768) or not np.isfinite(embedding).all():
        raise ValueError("Invalid development embeddings")
    lengths = [len(extractor._tokenizer.encode(t, truncation=False, verbose=False)) for t in texts]
    np.savez_compressed(args.private/"development-embeddings.npz", features=embedding)
    fitted, development, alphas, out_of_fold = {}, {}, {}, {}
    with mlflow.start_run(run_name="persontext-v1-fresh-training") as run:
        run_id = run.info.run_id
        mlflow.log_params({"seed": SEED, "encoder_revision": revision, "training_adults": 80,
                           "alphas": str(ALPHAS), "selection": "nested_5x5_neg_MSE",
                           "text_features_only": True, "test_used_to_fit": False})
        for kind in ("distilbert", "tfidf"):
            features = embedding if kind == "distilbert" else np.asarray(texts, dtype=object)
            scores = np.zeros_like(target)
            fold_alphas = []
            for fold, (inside, outside) in enumerate(outer_folds(len(people)), 1):
                print(f"Nested CV: {kind}, outer fold {fold}/5", flush=True)
                choices = {}
                for j, dim in enumerate(DIMS):
                    model = fit_candidate(kind, features[inside], target[inside, j])
                    scores[outside, j] = interface_scores(model.predict(features[outside]))
                    choices[dim] = selected_alpha(kind, model)
                fold_alphas.append(choices)
            out_of_fold[kind] = scores
            development[kind] = metric_set(target, scores)
            print(f"Fit all 80 adults: {kind}", flush=True)
            fitted[kind] = {d: fit_candidate(kind, features, target[:, j]) for j, d in enumerate(DIMS)}
            alphas[kind] = {"final": {d: selected_alpha(kind, m) for d, m in fitted[kind].items()},
                            "outer_folds": fold_alphas}
            mlflow_metrics(mlflow, kind, development[kind])
        # A constant fitted separately within every outer training fold.
        constant = np.zeros_like(target)
        for inside, outside in outer_folds(len(people)):
            for j in range(5):
                constant[outside, j] = interface_scores(np.full(len(outside), target[inside, j].mean()))
        out_of_fold["training_mean"] = constant
        development["training_mean"] = metric_set(target, constant)
        mlflow_metrics(mlflow, "training_mean", development["training_mean"])
        bundle = {"models": fitted["distilbert"], "model_name": "distilbert-base-multilingual-cased",
                  "model_revision": revision, "embedding_dim": 768, "dims": DIMS,
                  "version": "persontext-v1-retrain-local-20260908", "seed": SEED,
                  "target_scale": "published_IPIP_value_times_100_not_BFI2S",
                  "production_approved": False}
        joblib.dump(bundle, args.private/"ridge_persontext_v1.joblib")
        joblib.dump({"models": fitted["tfidf"], "dims": DIMS, "seed": SEED}, args.private/"tfidf_persontext_v1.joblib")
        for kind, filename in (("distilbert", "ridge_persontext_v1.joblib"), ("tfidf", "tfidf_persontext_v1.joblib")):
            features = embedding if kind == "distilbert" else texts
            loaded = joblib.load(args.private/filename)
            np.testing.assert_array_equal(predict_heads(fitted[kind], features), predict_heads(loaded["models"], features))
        np.savez_compressed(args.private/"development-predictions.npz", target=target, **out_of_fold)
        save(args.private/"development-results.json", {"metrics": development, "selected_alphas": alphas})
        mlflow.log_artifact(str(args.private/"development-results.json"))
    if sources(args.ml_root, args.private) != hashes:
        raise ValueError("Input or original artifacts changed during training")
    frozen_names = ("ridge_persontext_v1.joblib", "tfidf_persontext_v1.joblib", "development-results.json")
    save(args.private/"training-manifest.json", {
        "frozen_at": now(), "inputs": hashes, "admission": audit,
        "frozen_outputs": {n: digest(args.private/n) for n in frozen_names},
        "training_mean": target.mean(axis=0).tolist(), "selected_alphas": alphas,
        "development_truncated_participants": sum(n > 512 for n in lengths),
        "mlflow_training_run_id": run_id, "test_predictions_computed": False,
        "package_versions": {n: version(n) for n in ("numpy", "scikit-learn", "torch", "transformers", "mlflow", "dvc")},
        "original_artifacts_unchanged": True, "serialized_prediction_parity": True,
    })
    print("Training finished; both bundles frozen. Final test has NOT run.", flush=True)


def evaluate(args, mlflow, extractor):
    manifest_path = args.private/"training-manifest.json"
    manifest = json.loads(manifest_path.read_text())
    if sources(args.ml_root, args.private) != manifest["inputs"]:
        raise ValueError("Training inputs/protocol/code changed before test")
    for name, expected in manifest["frozen_outputs"].items():
        if digest(args.private/name) != expected:
            raise ValueError("Frozen training output changed")
    if (args.private/"test-start.json").exists():
        raise ValueError("Final test already started; do not rerun selection or silently overwrite evidence")
    save(args.private/"test-start.json", {"started_at": now(), "training_manifest_sha256": digest(manifest_path)})
    _, people, audit = admission(args.ml_root, args.private)
    texts, target = vectors(people)
    embedding = extractor.encode(texts)
    if embedding.shape != (30, 768) or not np.isfinite(embedding).all():
        raise ValueError("Invalid held-out embeddings")
    lengths = [len(extractor._tokenizer.encode(t, truncation=False, verbose=False)) for t in texts]
    ridge = joblib.load(args.private/"ridge_persontext_v1.joblib")
    tfidf = joblib.load(args.private/"tfidf_persontext_v1.joblib")
    old = joblib.load(args.ml_root/"models/ridge_v1.joblib")
    mean = np.asarray(manifest["training_mean"])
    scores = {"new_distilbert": predict_heads(ridge["models"], embedding),
              "new_tfidf": predict_heads(tfidf["models"], texts),
              "historical_distilbert": predict_heads(old["models"], embedding),
              "training_mean": np.column_stack([interface_scores(np.full(30, m)) for m in mean])}
    from src.predict import Predictor
    predictor = Predictor(bundle_path=args.private/"ridge_persontext_v1.joblib")
    predictor._extractor = extractor
    runtime = predictor.predict(texts[0])
    parity = max(abs(runtime["big_five"][dim]-scores["new_distilbert"][0, j]) for j, dim in enumerate(DIMS))
    if parity > .02:
        raise ValueError("Candidate differs from runtime Predictor")
    metrics = {name: metric_set(target, prediction) for name, prediction in scores.items()}
    comparisons = {name: {dim: paired_mae(target[:, j], scores["new_distilbert"][:, j], scores[name][:, j])
                         for j, dim in enumerate(DIMS)}
                   for name in ("historical_distilbert", "training_mean", "new_tfidf")}
    if sources(args.ml_root, args.private) != manifest["inputs"]:
        raise ValueError("Original files changed during evaluation")
    for name, expected in manifest["frozen_outputs"].items():
        if digest(args.private/name) != expected:
            raise ValueError("Frozen models changed during evaluation")
    with mlflow.start_run(run_name="persontext-v2-new-participants-final-test") as run:
        mlflow.log_params({"training_run_id": manifest["mlflow_training_run_id"], "test_adults": 30,
                           "training_manifest_sha256": digest(manifest_path), "seed": SEED,
                           "test_used_for_parameter_selection": False})
        for name, by_dimension in metrics.items():
            mlflow_metrics(mlflow, name, by_dimension)
        result = {"completed_at": now(), "kind": "fixed_protocol_local_academic_retraining",
                  "admission": audit, "metrics": metrics, "paired_mae_new_minus_reference": comparisons,
                  "test_truncated_participants": sum(n > 512 for n in lengths),
                  "token_lengths": {"min": min(lengths), "median": float(np.median(lengths)), "max": max(lengths)},
                  "training_manifest_sha256": digest(manifest_path),
                  "mlflow_training_run_id": manifest["mlflow_training_run_id"],
                  "mlflow_test_run_id": run.info.run_id,
                  "runtime_parity_max_absolute_delta": float(parity),
                  "runtime_status_not_promoted": runtime["per_dimension_status"],
                  "original_artifacts_unchanged": True, "production_changed": False,
                  "external_api_calls": 0, "test_parameter_selection": False,
                  "numerical_gate": {"n_min": 30, "r2_strictly_above": .2, "pearson_strictly_above": .3},
                  "bootstrap": {"unit": "participant", "repetitions": 2000, "seed": SEED,
                                "ci": "percentile_95_exploratory_no_multiplicity_adjustment"},
                  "limitations": ["30 new adults from the same corpus, not an independent institution.",
                                  "Transcribed Spanish speech is not written Umbra onboarding.",
                                  "IPIP published values rescaled to 0-100 are not BFI-2-S scores or percentiles.",
                                  "Neuroticism orientation provisional due to CSV/article discrepancy.",
                                  "No clinical, intervention-effectiveness or individual-precision validation.",
                                  "Local academic use only; no general redistribution license identified."]}
        save(args.private/"results.json", result)
        mlflow.log_artifact(str(args.private/"results.json"))
    np.savez_compressed(args.private/"test-predictions.npz", target=target, **scores)
    np.savez_compressed(args.private/"test-embeddings.npz", features=embedding)
    save(WORK/"results.json", result)
    save(WORK/"training-manifest.json", manifest)
    save(WORK/"development-results.json", json.loads((args.private/"development-results.json").read_text()))
    print(json.dumps({"test_n": 30, "gate": {d: metrics["new_distilbert"][d]["numerical_gate_reached"] for d in DIMS},
                      "original_artifacts_unchanged": True, "production_changed": False}), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("phase", choices=("train", "evaluate"))
    parser.add_argument("--private", type=Path, required=True)
    parser.add_argument("--ml-root", type=Path, required=True)
    args = parser.parse_args()
    os.umask(0o077)
    os.environ.update(HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1", HF_HUB_DISABLE_TELEMETRY="1",
                      TOKENIZERS_PARALLELISM="false", HF_HOME=str(args.ml_root/".hf_cache"))
    sys.path.insert(0, str(args.ml_root))
    import mlflow
    import torch
    from src.extract_embeddings import EmbeddingExtractor, MODEL_REVISION
    torch.set_num_threads(4)
    torch.manual_seed(SEED)
    mlflow.set_tracking_uri((args.private/"mlruns").as_uri())
    mlflow.set_experiment("Umbra-PersonText-20260908-local-only")
    extractor = EmbeddingExtractor(device="cpu")
    started = time.monotonic()
    with threadpool_limits(limits=4):
        if args.phase == "train":
            train(args, mlflow, extractor, MODEL_REVISION)
        else:
            evaluate(args, mlflow, extractor)
    print(f"{args.phase} completed in {time.monotonic()-started:.1f} seconds", flush=True)


if __name__ == "__main__":
    main()
