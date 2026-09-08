"""Retrospective comparison of shipped models, without fitting or promotion.

This is NOT a new blind Spanish validation. Essays labels are binary; 0 and
100 do not become continuous personality scores by changing their scale.
"""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import balanced_accuracy_score, mean_squared_error, r2_score, roc_auc_score

ROOT = Path(__file__).resolve().parent.parent
DIMS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def metrics(y, predicted):
    y, predicted = np.asarray(y, dtype=float), np.asarray(predicted, dtype=float)
    if len(y) < 2 or len(y) != len(predicted) or not np.isfinite(predicted).all():
        raise ValueError('Invalid predictions')
    if set(np.unique(y)) != {0.0, 1.0}:
        raise ValueError('Expected both original binary label classes, not continuous scores')
    return {'n': len(y), 'rmse_on_binary_labels': float(np.sqrt(mean_squared_error(y, predicted))),
            'r2_on_binary_labels': float(r2_score(y, predicted)),
            'roc_auc': float(roc_auc_score(y, predicted)),
            'balanced_accuracy_at_fixed_half': float(balanced_accuracy_score(y, predicted >= .5))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        raise FileExistsError('Use a new output path; previous evidence is preserved')
    paths = [ROOT/'models/ridge_v1.joblib', ROOT/'models/baseline_tfidf.joblib', ROOT/'data/embeddings/test.npy']
    paths += [ROOT/f'data/splits/{name}.csv' for name in ('train', 'val', 'test')]
    before = {str(path.relative_to(ROOT)): digest(path) for path in paths}
    frames = {name: pd.read_csv(ROOT/f'data/splits/{name}.csv') for name in ('train', 'val', 'test')}
    overlap = {}
    for a,b in [('train','val'),('train','test'),('val','test')]:
        ids = set(frames[a]['id']) & set(frames[b]['id'])
        if ids:
            raise ValueError('Split IDs overlap; comparison stopped')
        texts_a = set(frames[a]['text'].str.lower().str.replace(r'\s+', ' ', regex=True).str.strip())
        texts_b = set(frames[b]['text'].str.lower().str.replace(r'\s+', ' ', regex=True).str.strip())
        overlap[f'{a}_{b}'] = len(texts_a & texts_b)
    test = frames['test']
    english = test['language'].eq('en').to_numpy()
    embeddings = np.load(ROOT/'data/embeddings/test.npy', allow_pickle=False)
    if embeddings.shape != (len(test), 768) or not np.isfinite(embeddings).all():
        raise ValueError('Invalid cached test embeddings')
    ridge = joblib.load(ROOT/'models/ridge_v1.joblib')
    baseline = joblib.load(ROOT/'models/baseline_tfidf.joblib')
    tfidf = baseline['vectorizer'].transform(test.loc[english, 'text'])
    results = {}
    for dim in DIMS:
        train_labels = frames['train'][dim].dropna().to_numpy(dtype=float)/100
        labels = test.loc[english, dim].to_numpy(dtype=float)/100
        predictions = {
            'constant_training_mean': np.full(len(labels), train_labels.mean()),
            'shipped_tfidf_ridge': baseline['models'][dim].predict(tfidf)/100,
            'shipped_distilbert_ridge': ridge['models'][dim].predict(embeddings[english])/100,
        }
        results[dim] = {model: metrics(labels, predicted) for model, predicted in predictions.items()}
    after = {str(path.relative_to(ROOT)): digest(path) for path in paths}
    if before != after:
        raise AssertionError('An input artifact changed during evaluation')
    report = {
        'created_at': datetime.now(timezone.utc).isoformat(),
        'kind': 'retrospective_replay_not_new_blind_validation',
        'evaluation_language': 'en', 'n_test': int(english.sum()),
        'excluded_synthetic_spanish_test_rows': int((~english).sum()),
        'training_rows': len(frames['train']),
        'training_note': 'Shipped models were trained with the historical mixed corpus; no refitting or promotion in this comparison.',
        'label_type': 'binary_original_classes_rescaled_from_0_100_to_0_1',
        'split_id_overlap': False, 'normalized_text_overlap_counts': overlap,
        'artifacts_unchanged': True, 'sha256': before, 'script_sha256': digest(Path(__file__)),
        'results': results,
        'limits': [
            'This test set was inspected before; it is not a new independent study.',
            'Stored row IDs do not establish independent participant identity.',
            'Historical embedding provenance and full training reproduction remain incomplete.',
            'Binary-label discrimination is not continuous-score validity.',
            'No Spanish human test or validation of Jung or activity efficacy is claimed.',
            'No model weights, thresholds, runtime status or app scores were changed.',
        ],
    }
    with args.output.open('x') as stream:
        json.dump(report, stream, indent=2, allow_nan=False)
    print(f'Comparison saved: {args.output}; {int(english.sum())} English cases; no model promoted.')


if __name__ == '__main__':
    main()
