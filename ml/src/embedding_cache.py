"""Content-addressed validation of the existing per-split embedding cache."""

import hashlib
import json
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path

import numpy as np

from .extract_embeddings import EMBEDDING_DIM, MAX_LENGTH


def cached_embeddings(texts, cache_path: Path, extractor):
    texts = list(texts)
    packages = {}
    for name in ("torch", "transformers", "tokenizers"):
        try:
            packages[name] = version(name)
        except PackageNotFoundError:
            packages[name] = None
    identity = {
        "texts": texts,
        "model": extractor.model_name,
        "revision": getattr(extractor, "revision", None),
        "max_length": MAX_LENGTH,
        "pooling": "cls",
        "device": getattr(extractor, "device", "cpu"),
        "packages": packages,
        "extractor_sha256": hashlib.sha256(
            Path(__file__).with_name("extract_embeddings.py").read_bytes()
        ).hexdigest(),
    }
    fingerprint = hashlib.sha256(json.dumps(identity, ensure_ascii=False,
                                            sort_keys=True).encode()).hexdigest()
    metadata_path = cache_path.with_suffix(".json")
    if cache_path.exists() and metadata_path.exists():
        try:
            metadata = json.loads(metadata_path.read_text())
            if (metadata.get("fingerprint") == fingerprint
                    and metadata.get("array_sha256") == hashlib.sha256(cache_path.read_bytes()).hexdigest()):
                embeddings = np.load(cache_path, allow_pickle=False)
                if embeddings.shape == (len(texts), EMBEDDING_DIM) and np.isfinite(embeddings).all():
                    return embeddings
        except (OSError, ValueError, AttributeError):
            pass
    embeddings = extractor.encode(texts)
    if embeddings.shape != (len(texts), EMBEDDING_DIM) or not np.isfinite(embeddings).all():
        raise ValueError("Invalid embedding shape or nonfinite values")
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    np.save(cache_path, embeddings)
    metadata_path.write_text(json.dumps({
        "fingerprint": fingerprint,
        "array_sha256": hashlib.sha256(cache_path.read_bytes()).hexdigest(),
    }, indent=2) + "\n")
    return embeddings
