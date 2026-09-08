import importlib.util
from pathlib import Path
import pytest

spec = importlib.util.spec_from_file_location('audit_runtime', Path(__file__).parents[1]/'scripts/audit_runtime.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def test_resampling_does_not_inflate_original_row_count():
    result = audit.paired_error_summary([0,1,0,1], [.1,.9,.2,.8], [.5]*4, repetitions=500)
    assert result['n_original_rows'] == 4
    assert result['bootstrap_repetitions_not_new_people'] == 500
    assert result['row_bootstrap_gain_interval_95'][0] > 0


def test_comparison_requires_aligned_finite_rows():
    with pytest.raises(ValueError): audit.paired_error_summary([0,1],[.2],[.5,.5])
    with pytest.raises(ValueError): audit.paired_error_summary([0,1],[.2,float('nan')],[.5,.5])


def test_contract_rejects_missing_and_nonfinite_scores():
    body = {'big_five': {d: 50 for d in audit.DIMS}, 'per_dimension_status': {d:'low_confidence' for d in audit.DIMS}, 'model_version':'test'}
    assert audit.prediction_contract(body)
    body['big_five']['openness'] = float('nan')
    assert not audit.prediction_contract(body)
