"""Tests catch data leakage, label inflation and broken translation alignment."""
import importlib.util
from pathlib import Path

import pandas as pd
import pytest


def module():
    path = Path(__file__).with_name('transfer.py')
    assert path.exists(), 'Transfer experiment guards are not implemented'
    spec = importlib.util.spec_from_file_location('transfer', path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def frame(ids, texts, languages=None):
    return pd.DataFrame({'id': ids, 'text': texts,
                         'language': languages or ['en'] * len(ids),
                         **{d: [0, 100][:len(ids)] for d in (
                             'openness', 'conscientiousness', 'extraversion',
                             'agreeableness', 'neuroticism')}})


def test_selects_only_test_english_without_counting_synthetic_spanish():
    m = module()
    frames = {'train': frame(['a'], ['Training']), 'val': frame(['b'], ['Validation']),
              'test': frame(['c', 'd'], ['Held out', 'Caso inventado'], ['en', 'es-AR'])}
    assert m.select_test(frames)['id'].tolist() == ['c']


@pytest.mark.parametrize('test_id,test_text', [('a', 'Unseen words'), ('c', '  TRAINING  ')])
def test_rejects_id_or_normalized_text_leakage(test_id, test_text):
    m = module()
    frames = {'train': frame(['a'], ['Training']), 'val': frame(['b'], ['Validation']),
              'test': frame([test_id], [test_text])}
    with pytest.raises(ValueError, match='overlap'):
        m.select_test(frames)


def test_rejects_continuous_labels_in_binary_experiment():
    m = module()
    frames = {'train': frame(['a'], ['Training']), 'val': frame(['b'], ['Validation']),
              'test': frame(['c'], ['Held out'])}
    frames['test'].loc[0, 'openness'] = 70
    with pytest.raises(ValueError, match='binary'):
        m.select_test(frames)


def test_chunks_preserve_every_word_in_original_order_and_bound_tokens():
    m = module()
    text = 'One two three. Four five six seven eight nine ten.'
    chunks = m.chunk_text(text, lambda value: len(value.split()), 4)
    assert ' '.join(chunks).split() == text.split()
    assert all(len(chunk.split()) <= 4 for chunk in chunks)
    assert len(chunks) == 3


def test_alignment_follows_ids_not_translation_file_order():
    m = module()
    assert m.align_translations(['a', 'b'], [
        {'id': 'b', 'text_es': 'Segundo'}, {'id': 'a', 'text_es': 'Primero'}
    ]) == ['Primero', 'Segundo']


@pytest.mark.parametrize('rows', [[], [{'id': 'a', 'text_es': ''}],
    [{'id': 'a', 'text_es': 'Uno'}, {'id': 'a', 'text_es': 'Dos'}]])
def test_missing_empty_or_duplicate_translations_stop_evaluation(rows):
    m = module()
    with pytest.raises(ValueError):
        m.align_translations(['a'], rows)


def test_binary_metrics_distinguish_perfect_and_constant_predictions():
    m = module()
    perfect = m.binary_metrics([0, 1, 0, 1], [0, 1, 0, 1])
    constant = m.binary_metrics([0, 1, 0, 1], [.5, .5, .5, .5])
    assert perfect['auc'] == 1
    assert perfect['balanced_accuracy'] == 1
    assert perfect['rmse_binary'] == 0
    assert constant['auc'] == .5
    assert constant['balanced_accuracy'] == .5
    assert constant['rmse_binary'] == .5
