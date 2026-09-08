"""Local transfer experiment guards; no training or runtime-state updates."""
import numpy as np
from sklearn.metrics import balanced_accuracy_score, f1_score, mean_squared_error, roc_auc_score

DIMS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']


def select_test(frames):
    for name, frame in frames.items():
        if frame['id'].isna().any() or frame['id'].duplicated().any():
            raise ValueError(f'Duplicate/missing IDs: {name}')
        if frame['text'].isna().any() or frame['text'].str.strip().eq('').any():
            raise ValueError(f'Empty text: {name}')
    normalized = {name: set(' '.join(s.lower().split()) for s in frame['text'])
                  for name, frame in frames.items()}
    for a, b in [('train', 'val'), ('train', 'test'), ('val', 'test')]:
        if set(frames[a]['id']) & set(frames[b]['id']) or normalized[a] & normalized[b]:
            raise ValueError(f'Partition overlap: {a}/{b}')
    selected = frames['test'].loc[frames['test']['language'].eq('en')].copy()
    if selected.empty or not selected[DIMS].isin([0, 100]).all().all():
        raise ValueError('Expected nonempty English test with binary 0/100 labels')
    return selected.reset_index(drop=True)


def chunk_text(text, count_tokens, max_tokens):
    words = text.split()
    if not words or max_tokens < 1:
        raise ValueError('Empty text or invalid token limit')
    chunks, start = [], 0
    while start < len(words):
        # Binary search preserves every word, even in run-on sentences.
        low, high, end = start + 1, len(words), start
        while low <= high:
            mid = (low + high) // 2
            if count_tokens(' '.join(words[start:mid])) <= max_tokens:
                end, low = mid, mid + 1
            else:
                high = mid - 1
        if end == start:
            raise ValueError('A single word exceeds the translation token limit')
        chunks.append(' '.join(words[start:end]))
        start = end
    return chunks


def align_translations(ids, rows):
    found = {}
    for row in rows:
        identifier, text = row['id'], row['text_es']
        if identifier in found or not isinstance(text, str) or not text.strip():
            raise ValueError('Duplicate or empty translation')
        found[identifier] = text
    if len(ids) != len(set(ids)) or set(ids) != set(found):
        raise ValueError('Missing or unexpected translation IDs')
    return [found[identifier] for identifier in ids]


def binary_metrics(labels, predictions):
    labels, predictions = np.asarray(labels), np.asarray(predictions)
    if (labels.shape != predictions.shape or labels.ndim != 1
            or set(np.unique(labels)) != {0, 1} or not np.isfinite(predictions).all()):
        raise ValueError('Expected two binary classes and aligned finite predictions')
    return {'n': len(labels), 'auc': float(roc_auc_score(labels, predictions)),
            'balanced_accuracy': float(balanced_accuracy_score(labels, predictions >= .5)),
            'f1': float(f1_score(labels, predictions >= .5, zero_division=0)),
            'rmse_binary': float(np.sqrt(mean_squared_error(labels, predictions)))}
