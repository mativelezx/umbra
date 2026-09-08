import importlib.util
from pathlib import Path

import numpy as np
import pytest

spec = importlib.util.spec_from_file_location('compare_existing', Path(__file__).resolve().parents[1]/'scripts/compare_existing.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def test_constant_does_not_gain_discrimination():
    result = module.metrics([0,1,0,1], [.5,.5,.5,.5])
    assert result['roc_auc'] == .5
    assert result['balanced_accuracy_at_fixed_half'] == .5


def test_continuous_values_are_not_silently_called_binary_ground_truth():
    with pytest.raises(ValueError):
        module.metrics([0,.4,1], [.1,.5,.8])


def test_nan_predictions_are_rejected():
    with pytest.raises(ValueError):
        module.metrics([0,1], [np.nan,1])
