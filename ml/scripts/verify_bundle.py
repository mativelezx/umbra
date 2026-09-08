"""Verify the shipped bundle without fitting models or replacing artifacts.

Run from ml/: python scripts/verify_bundle.py [--with-text] [--output PATH].
The cached-matrix replay is deliberately distinct from text inference.
"""

import argparse
import hashlib
import json
import logging
import platform
import subprocess
import sys
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.evaluate import evaluate_block  # noqa: E402
from src.predict import BIG_FIVE_DIMS, Predictor  # noqa: E402


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--with-text", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    logging.getLogger().setLevel(logging.WARNING)
    bundle_path = ROOT / "models/ridge_v1.joblib"
    bundle = joblib.load(bundle_path)
    stored = json.loads((ROOT / "eval_metrics.json").read_text())
    splits = {name: pd.read_csv(ROOT / f"data/splits/{name}.csv")
              for name in ("train", "val", "test")}
    for first, second in (("train", "val"), ("train", "test"), ("val", "test")):
        if set(splits[first]["id"]) & set(splits[second]["id"]):
            raise AssertionError(f"Overlapping split IDs: {first}/{second}")
    test = splits["test"]
    embeddings = np.load(ROOT / "data/embeddings/test.npy", allow_pickle=False)
    if embeddings.shape != (len(test), 768) or not np.isfinite(embeddings).all():
        raise AssertionError("Invalid shipped test matrix")
    blocks = {}
    for name, mask in (("combined", np.ones(len(test), dtype=bool)),
                       ("english_only", test["language"].eq("en").to_numpy()),
                       ("latinoamericano_only", test["language"].eq("es-AR").to_numpy())):
        block = evaluate_block(bundle["models"], test[mask].reset_index(drop=True),
                               embeddings[mask], name)
        for group in ("metrics", "classification_metrics"):
            for dim, metrics in block[group].items():
                for key, value in metrics.items():
                    if isinstance(value, (float, int)):
                        expected = stored["blocks"][name][group][dim][key]
                        if not np.isclose(value, expected, rtol=1e-7, atol=1e-8, equal_nan=True):
                            raise AssertionError(f"Metric drift: {name}/{dim}/{key}")
        blocks[name] = block
    artifacts = [bundle_path, ROOT / "models/baseline_tfidf.joblib",
                 ROOT / "metrics.json", ROOT / "eval_metrics.json",
                 ROOT / "data/essays/essays.csv", ROOT / "data/latinoamericano/cases.csv"]
    artifacts += sorted((ROOT / "data/splits").glob("*.csv"))
    artifacts += sorted((ROOT / "data/embeddings").glob("*.npy"))
    report = {
        "verified_at_utc": datetime.now(timezone.utc).isoformat(),
        "base_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
        "source_state": "working tree; see source_sha256 (not a committed verification release)",
        "python": platform.python_version(),
        "packages": {name: version(name) for name in ("numpy", "scipy", "scikit-learn", "pandas", "joblib",
                                                       "fastapi", "pydantic", "httpx", "mlflow", "dvc", "pathspec")},
        "artifacts": {str(p.relative_to(ROOT)): {"sha256": sha256(p), "bytes": p.stat().st_size}
                      for p in artifacts},
        "source_sha256": {str(p.relative_to(ROOT)): sha256(p) for p in
                          sorted((ROOT / "src").glob("*.py")) + [Path(__file__).resolve(),
                          ROOT / "requirements.txt", ROOT / "dvc.yaml", ROOT / "Makefile", ROOT / "Dockerfile"]},
        "corpus": {name: {"n": len(frame), "by_language": frame["language"].value_counts().to_dict()}
                   for name, frame in splits.items()},
        "bundle": {"version": bundle["version"], "embedding_model": bundle["model_name"],
                   "historical_embedding_revision": bundle.get("model_revision"),
                   "regressors": {dim: {"class": type(model).__name__, "alpha": float(model.alpha_)}
                                  for dim, model in bundle["models"].items()}},
        "cached_matrix_metrics_replayed": True,
        "split_ids_disjoint": True,
        "blocks": blocks,
        "spanish_runtime_status": Predictor().per_dimension_status(),
        "text_inference": {"verified": False, "reason": "not requested; use --with-text"},
        "limits": ["Cached replay does not prove how historical embeddings were generated.",
                   "No historical DVC lock or embedding revision; no training reproduction claimed.",
                   "English held-out discrimination is not individual Spanish validity.",
                   "Spanish test consists of two synthetic cases, not participant validation."],
    }
    if args.with_text:
        from fastapi.testclient import TestClient
        from src import api_server
        from src.extract_embeddings import MODEL_REVISION
        predictor = Predictor()
        api_server._predictor = predictor
        synthetic_text = "Me gusta aprender y pensar con calma antes de decidir."
        with TestClient(api_server.app) as client:
            before = client.get("/health").json()
            response = client.post("/infer", json={"text": synthetic_text})
            response.raise_for_status()
            payload = response.json()
            if set(payload["big_five"]) != set(BIG_FIVE_DIMS):
                raise AssertionError("Incomplete score contract")
            if not all(np.isfinite(v) and 0 <= v <= 100 for v in payload["big_five"].values()):
                raise AssertionError("Invalid runtime scores")
            after = client.get("/health").json()
            if not after["model_loaded"]:
                raise AssertionError("Weights not loaded after inference")
        sample_indices = [int(np.flatnonzero(test["language"].eq(language))[0])
                          for language in ("en", "es-AR")]
        fresh = predictor._extractor.encode(test.iloc[sample_indices]["text"].tolist())
        max_difference = float(np.max(np.abs(fresh - embeddings[sample_indices])))
        import os
        hf_home = Path(os.getenv("HF_HOME", Path.home() / ".cache/huggingface"))
        snapshot = hf_home / "hub/models--distilbert-base-multilingual-cased/snapshots" / MODEL_REVISION
        report["text_inference"] = {
            "verified": True, "input_kind": "synthetic", "response": payload,
            "health_before": before, "health_after": after,
            "embedding_revision_used": MODEL_REVISION,
            "embedding_parameters_frozen": all(not p.requires_grad for p in predictor._extractor._model.parameters()),
            "fresh_vs_legacy_sample": {"indices": sample_indices, "n": 2, "max_abs_difference": max_difference,
                                       "allclose_atol_1e-5": bool(np.allclose(fresh, embeddings[sample_indices], atol=1e-5))},
            "downloaded_files": {p.name: {"sha256": sha256(p), "bytes": p.stat().st_size}
                                 for p in sorted(snapshot.iterdir()) if p.is_file()},
        }
        report["packages"].update({name: version(name) for name in ("torch", "transformers", "tokenizers")})
    text = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    if args.output:
        args.output.write_text(text)
        print(f"Verification report: {args.output}")
    else:
        print(text)


if __name__ == "__main__":
    main()
