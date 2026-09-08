"""Offline, retrospective paired evaluation; all text outputs stay private."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import time
from datetime import datetime, timezone

os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
ROOT = Path('/private/tmp/umbra-entrega-audit.B6Tyg8/repo/ml')
os.environ['HF_HOME'] = str(ROOT / '.hf_cache')
# Append: never shadow the project's pinned numpy/joblib/etc with new dependencies.
sys.path.append('/private/tmp/umbra-translation-experiment-deps')
sys.path.insert(0, str(ROOT))

import joblib
import numpy as np
import pandas as pd
import torch
from sklearn.metrics import roc_auc_score
from transformers import MarianTokenizer, MarianMTModel, MarianConfig
from transfer import DIMS, select_test, chunk_text, align_translations, binary_metrics

WORK = Path(__file__).resolve().parent
PRIVATE = WORK / 'private'
MT = Path('/private/tmp/umbra-translation-model-en-es')
REVISION = '5bc4493d463cf000c1f0b50f8d56886a392ed4ab'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    with path.open('x', encoding='utf-8') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2, allow_nan=False)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=['translate', 'evaluate'])
    args = parser.parse_args()
    os.umask(0o077)
    torch.set_num_threads(4)
    torch.manual_seed(20260908)
    np.random.seed(20260908)
    frames = {name: pd.read_csv(ROOT / f'data/splits/{name}.csv') for name in ('train', 'val', 'test')}
    selected = select_test(frames)
    assert len(selected) == 248, 'Stop: historical English test has changed'
    inputs = [ROOT / 'models/ridge_v1.joblib', ROOT / 'eval_metrics.json',
              ROOT / 'models/baseline_tfidf.joblib']
    inputs += [ROOT / f'data/splits/{name}.csv' for name in frames]
    before = {str(path.relative_to(ROOT)): digest(path) for path in inputs}
    if args.phase == 'translate':
        PRIVATE.mkdir(mode=0o700, exist_ok=True)
        manifest = {'started_at': datetime.now(timezone.utc).isoformat(),
                    'protocol_sha256': digest(WORK / 'PROTOCOLO.md'),
                    'script_sha256': digest(Path(__file__)),
                    'guards_sha256': digest(WORK / 'transfer.py'),
                    'model_revision': REVISION, 'source_hashes': before,
                    'translation_model_hashes': {p.name: digest(p) for p in MT.iterdir() if p.is_file()},
                    'translation_config': {'device': 'cpu', 'threads': 4, 'num_beams': 4,
                                           'do_sample': False, 'source_chunk_tokens': 320,
                                           'max_new_tokens': 512, 'batch_size': 8},
                    'n_source_essays': len(selected), 'labels_sent_to_translator': False,
                    'external_text_transmission': False}
        write_json(WORK / 'manifest.json', manifest)
        tokenizer = MarianTokenizer.from_pretrained(MT, local_files_only=True,
                                                     clean_up_tokenization_spaces=False)
        model = MarianMTModel(MarianConfig.from_pretrained(MT, local_files_only=True))
        state = torch.load(MT / 'pytorch_model.bin', map_location='cpu', weights_only=True)
        missing, unexpected = model.load_state_dict(state, strict=False)
        # The original 2020 checkpoint omits the tied output embedding alias.
        assert missing == ['lm_head.weight'] and not unexpected
        model.tie_weights()
        assert model.lm_head.weight.data_ptr() == model.model.shared.weight.data_ptr()
        model.eval()
        for parameter in model.parameters():
            parameter.requires_grad = False
        chunks = []
        chunk_counts = {}
        for row in selected.itertuples():
            parts = chunk_text(row.text, lambda text: len(tokenizer.encode(text, add_special_tokens=True)), 320)
            chunk_counts[row.id] = len(parts)
            for position, part in enumerate(parts):
                chunks.append({'id': row.id, 'position': position, 'text': part})
        # Length grouping changes no document order; results are reconstructed by ID+position.
        chunks.sort(key=lambda item: len(item['text']))
        results = {identifier: {} for identifier in selected['id']}
        capped = 0
        started = time.monotonic()
        print(f'Translating {len(selected)} essays / {len(chunks)} chunks locally.', flush=True)
        with (PRIVATE / 'chunk-translations.jsonl').open('x', encoding='utf-8') as checkpoint:
            for offset in range(0, len(chunks), 8):
                batch = chunks[offset:offset + 8]
                encoded = tokenizer([item['text'] for item in batch], return_tensors='pt',
                                    padding=True, truncation=False)
                assert encoded['input_ids'].shape[1] <= 320
                with torch.inference_mode():
                    outputs = model.generate(**encoded, num_beams=4, do_sample=False, max_new_tokens=512)
                translated = tokenizer.batch_decode(outputs, skip_special_tokens=True)
                for item, output, text_es in zip(batch, outputs, translated):
                    length = int((output != tokenizer.pad_token_id).sum())
                    hit_cap = length >= 512
                    capped += int(hit_cap)
                    if not text_es.strip():
                        raise ValueError('Empty translation; evaluation stopped')
                    results[item['id']][item['position']] = text_es
                    checkpoint.write(json.dumps({'id': item['id'], 'position': item['position'],
                        'text_es': text_es, 'generation_cap_hit': hit_cap}, ensure_ascii=False) + '\n')
                checkpoint.flush()
                print(f'Chunks {min(offset + 8, len(chunks))}/{len(chunks)}; '
                      f'{time.monotonic()-started:.0f}s elapsed', flush=True)
        rows = []
        for row in selected.itertuples():
            parts = results[row.id]
            assert set(parts) == set(range(chunk_counts[row.id]))
            rows.append({'id': row.id, 'text_es': ' '.join(parts[i] for i in range(len(parts))),
                         'source_sha256': hashlib.sha256(row.text.encode()).hexdigest(),
                         'chunks': len(parts)})
        align_translations(selected['id'].tolist(), rows)
        write_json(PRIVATE / 'translations.json', rows)
        write_json(WORK / 'translation-summary.json', {
            'completed_at': datetime.now(timezone.utc).isoformat(), 'n_essays': len(rows),
            'n_chunks': len(chunks), 'generation_cap_hits': capped,
            'seconds': time.monotonic()-started, 'human_translation_review': 'not_performed',
            'translations_sha256': digest(PRIVATE / 'translations.json'),
            'source_hashes_unchanged': before == {str(p.relative_to(ROOT)): digest(p) for p in inputs}})
        return

    manifest = json.loads((WORK / 'manifest.json').read_text())
    assert before == manifest['source_hashes'], 'Source changed since experiment began'
    assert digest(WORK / 'PROTOCOLO.md') == manifest['protocol_sha256']
    rows = json.loads((PRIVATE / 'translations.json').read_text())
    for row in rows:
        original = selected.loc[selected['id'].eq(row['id']), 'text'].iloc[0]
        assert row['source_sha256'] == hashlib.sha256(original.encode()).hexdigest()
    texts_es = align_translations(selected['id'].tolist(), rows)
    from src.extract_embeddings import EmbeddingExtractor, MODEL_REVISION, MAX_LENGTH
    extractor = EmbeddingExtractor()
    extractor._ensure_loaded()
    texts_en = selected['text'].tolist()
    matrices = {'english_original': extractor.encode(texts_en),
                'spanish_machine_translated': extractor.encode(texts_es)}
    bundle = joblib.load(ROOT / 'models/ridge_v1.joblib')
    metrics, paired = {}, {}
    rng = np.random.default_rng(20260908)
    bootstrap = rng.integers(0, len(selected), size=(2000, len(selected)))
    for dim in DIMS:
        labels = selected[dim].to_numpy(dtype=float) / 100
        predictions = {key: np.clip(np.round(bundle['models'][dim].predict(matrix), 2), 0, 100) / 100
                       for key, matrix in matrices.items()}
        constant = np.full(len(labels), frames['train'][dim].dropna().mean() / 100)
        metrics[dim] = {key: binary_metrics(labels, scores) for key, scores in predictions.items()}
        metrics[dim]['constant_training_mean'] = binary_metrics(labels, constant)
        en, es = predictions.values()
        auc_en, auc_es = [], []
        for sample in bootstrap:
            if len(np.unique(labels[sample])) < 2:
                continue
            auc_en.append(roc_auc_score(labels[sample], en[sample]))
            auc_es.append(roc_auc_score(labels[sample], es[sample]))
        differences = np.array(auc_es) - np.array(auc_en)
        paired[dim] = {'mean_absolute_score_change_0_100': float(np.mean(np.abs(es-en))*100),
                       'classification_agreement_at_50': float(np.mean((es >= .5) == (en >= .5))),
                       'auc_original_95_ci': np.percentile(auc_en, [2.5, 97.5]).tolist(),
                       'auc_translated_95_ci': np.percentile(auc_es, [2.5, 97.5]).tolist(),
                       'auc_difference_95_ci': np.percentile(differences, [2.5, 97.5]).tolist()}
    after = {str(p.relative_to(ROOT)): digest(p) for p in inputs}
    assert before == after, 'An original artifact changed'
    summary = json.loads((WORK / 'translation-summary.json').read_text())
    write_json(WORK / 'results.json', {
        'completed_at': datetime.now(timezone.utc).isoformat(),
        'kind': 'retrospective_paired_machine_translation_sensitivity_not_spanish_validation',
        'n_pairs': len(selected), 'new_participants': 0, 'trained_or_calibrated': False,
        'production_status_changed': False, 'source_hashes_unchanged': True,
        'extractor_revision': MODEL_REVISION, 'predictor_contract': 'round_2_clip_0_100',
        'truncated_input_counts': {key: sum(len(extractor._tokenizer.encode(t)) > MAX_LENGTH for t in texts)
                                   for key, texts in [('english_original', texts_en), ('spanish_machine_translated', texts_es)]},
        'translation_summary': summary, 'metrics': metrics, 'paired_comparison': paired,
        'bootstrap': {'unit': 'original_essay_row_not_independently_verified_person', 'samples': 2000,
                      'seed': 20260908, 'intervals': 'percentile_95_unadjusted_for_five_dimensions'},
        'limits': ['English binary labels are not continuous personality scores.',
                   'Translations are not originally Spanish texts or new people.',
                   'Observed test set; no new blind validation.',
                   'Translation may alter wording, cues and meaning; human review is pending.',
                   'No dataset texts or translations are published or sent to external providers.',
                   'No change to runtime confidence or academic claims is justified automatically.']})
    print('Completed paired analysis; results.json; no model or production changes.', flush=True)


if __name__ == '__main__':
    main()
