"""Prepare data: une corpus Essays + corpus rioplatense, genera splits.

Salida:
- data/splits/train.csv
- data/splits/val.csv
- data/splits/test.csv

Política de splits (ADR-026 + ADR-028):
- Ratio 80/10/10 train/val/test fijado por seed determinístico.
- Estratificación por (origen del corpus × dimensión target) cuando
  está disponible; sino split aleatorio.
- Si Essays no está disponible, se entrena solo con corpus rioplatense
  (n=20). Las métricas reportadas reflejan esa limitación honestamente.
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="[prepare_data] %(message)s")
log = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SPLITS_DIR = DATA / "splits"
SEED = 42

BIG_FIVE_DIMS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]


def load_rioplatense() -> pd.DataFrame:
    """Carga corpus rioplatense (cases.csv) — solo subset IPIP con scores."""
    path = DATA / "rioplatense" / "cases.csv"
    if not path.exists():
        raise FileNotFoundError(f"No se encontró el corpus rioplatense en {path}")
    df = pd.read_csv(path)
    df["origin"] = "rioplatense"
    df["language"] = "es-AR"
    log.info("rioplatense: %d casos cargados", len(df))
    return df


def load_essays() -> Optional[pd.DataFrame]:
    """Carga corpus Essays si está disponible. Devuelve None si no.

    Espera columnas: text, ext, neu, agr, con, opn (formato Pennebaker)
    o text + columnas Big Five con nombre completo. Normaliza a la misma
    interfaz que rioplatense.
    """
    path = DATA / "essays" / "essays.csv"
    if not path.exists():
        log.warning("Essays no disponible en %s — se entrena solo con rioplatense", path)
        return None
    df = pd.read_csv(path)

    # Normalizar nombres de columnas (formato Pennebaker)
    rename_map = {
        "ext": "extraversion",
        "neu": "neuroticism",
        "agr": "agreeableness",
        "con": "conscientiousness",
        "opn": "openness",
    }
    df = df.rename(columns=rename_map)

    # Validar columnas
    missing = [c for c in BIG_FIVE_DIMS if c not in df.columns]
    if missing:
        log.error("essays.csv: faltan columnas %s", missing)
        return None

    # Normalizar scores 0-100 si están en otra escala
    for dim in BIG_FIVE_DIMS:
        col = df[dim].dropna()
        if len(col) == 0:
            continue
        if col.min() >= 0 and col.max() <= 1:
            log.info("essays: dimensión %s en [0,1] → escalando a [0,100]", dim)
            df[dim] = df[dim] * 100
        elif col.min() < 0:
            log.info("essays: dimensión %s parece z-score → reescalando", dim)
            mean, std = col.mean(), col.std() if col.std() > 0 else 1
            z = (df[dim] - mean) / std
            df[dim] = (z * 15 + 50).clip(0, 100)

    df["origin"] = "essays"
    df["language"] = "en"
    df["id"] = ["essays-" + str(i).zfill(5) for i in range(len(df))]
    df["source"] = "essays"
    df["target_dimension"] = ""
    df["target_direction"] = ""

    keep_cols = ["id", "source", "origin", "language", "target_dimension",
                 "target_direction", "text"] + BIG_FIVE_DIMS
    df = df[keep_cols]
    log.info("essays: %d casos cargados", len(df))
    return df


def stratified_split(df: pd.DataFrame, seed: int = SEED):
    """Split 80/10/10 con estratificación por origin cuando posible."""
    rng = np.random.default_rng(seed)
    train_parts, val_parts, test_parts = [], [], []
    for origin, group in df.groupby("origin"):
        n = len(group)
        idx = np.arange(n)
        rng.shuffle(idx)
        n_train = max(1, int(n * 0.8))
        n_val = max(1, int(n * 0.1))
        # Aseguramos que al menos 1 caso vaya a test si hay > 2 muestras
        n_test = max(1, n - n_train - n_val) if n > 2 else 0
        if n_train + n_val + n_test > n:
            n_train = n - n_val - n_test
        train_idx = idx[:n_train]
        val_idx = idx[n_train:n_train + n_val]
        test_idx = idx[n_train + n_val:n_train + n_val + n_test]
        train_parts.append(group.iloc[train_idx])
        val_parts.append(group.iloc[val_idx])
        test_parts.append(group.iloc[test_idx])
    train = pd.concat(train_parts, ignore_index=True).sample(frac=1, random_state=seed).reset_index(drop=True)
    val = pd.concat(val_parts, ignore_index=True).sample(frac=1, random_state=seed).reset_index(drop=True)
    test = pd.concat(test_parts, ignore_index=True).sample(frac=1, random_state=seed).reset_index(drop=True)
    return train, val, test


def main():
    parser = argparse.ArgumentParser(description="Prepare data splits")
    parser.add_argument("--seed", type=int, default=SEED)
    args = parser.parse_args()

    log.info("seed = %d", args.seed)
    SPLITS_DIR.mkdir(parents=True, exist_ok=True)

    rio = load_rioplatense()
    essays = load_essays()

    if essays is not None:
        df = pd.concat([rio, essays], ignore_index=True)
    else:
        df = rio.copy()
        log.warning("Entrenando solo con corpus rioplatense (n=%d). Las métricas "
                    "reportadas reflejarán esta limitación.", len(df))

    train, val, test = stratified_split(df, args.seed)
    log.info("splits: train=%d, val=%d, test=%d", len(train), len(val), len(test))

    train.to_csv(SPLITS_DIR / "train.csv", index=False)
    val.to_csv(SPLITS_DIR / "val.csv", index=False)
    test.to_csv(SPLITS_DIR / "test.csv", index=False)

    summary = {
        "seed": args.seed,
        "total": len(df),
        "train": len(train),
        "val": len(val),
        "test": len(test),
        "by_origin": df["origin"].value_counts().to_dict(),
        "essays_available": essays is not None,
    }
    with open(SPLITS_DIR / "summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    log.info("summary: %s", summary)


if __name__ == "__main__":
    main()
