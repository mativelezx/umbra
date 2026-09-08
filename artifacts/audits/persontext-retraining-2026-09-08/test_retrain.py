"""Tests for participant separation, fitting and metrics; fixtures are invented."""
import importlib.util
import tempfile
from pathlib import Path
import unittest

import joblib
import numpy as np

if importlib.util.find_spec("retrain"):
    import retrain
else:
    retrain = None


def record(uid, text, value="0.7", age="25"):
    row = {"uid": uid, "texto": text, "edad_calculada": age, "sexo": "NOT_A_FEATURE"}
    for column in ("apertura", "responsabilidad", "sociabilidad", "amabilidad", "neuroticismo"):
        row[column] = value
        row["presenta_" + column] = "Sí" if float(value) > .6 else "No"
    return row


class RetrainTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(retrain, "Retraining is not implemented yet")

    def test_partition_uses_only_new_uids_even_if_old_users_have_new_texts(self):
        original = [record("a", "Texto original"), record("minor", "Menor", age="17")]
        expanded = original + [record("a", "Agregado no autorizado"), record("minor", "Ahora mayor", age="18"), record("b", "Texto nuevo")]
        train, test, audit = retrain.partition(original, expanded, set())
        self.assertEqual([p["text"] for p in train], ["Texto original"])
        self.assertEqual([p["text"] for p in test], ["Texto nuevo"])
        self.assertEqual(audit["test"]["participants_used"], 1)
        self.assertEqual(set(train[0]), {"text", "targets", "labels"})

    def test_test_text_overlapping_training_is_rejected(self):
        original = [record("a", "Una respuesta")]
        with self.assertRaisesRegex(ValueError, "Historical"):
            retrain.partition(original, original + [record("b", " una RESPUESTA ")], set())

    def test_concatenated_overlap_is_rejected(self):
        original = [record("a", "uno"), record("a", "dos")]
        with self.assertRaisesRegex(ValueError, "Historical"):
            retrain.partition(original, original + [record("b", "uno dos")], set())

    def test_invalid_holdout_labels_stop_admission_without_repairing_them(self):
        original = [record("a", "Original")]
        invalid = record("b", "Nuevo")
        invalid["presenta_neuroticismo"] = "No"
        with self.assertRaisesRegex(ValueError, "Label"):
            retrain.partition(original, original + [invalid], set())

    def test_identical_response_repeated_by_same_person_counts_once(self):
        original = [record("a", "Original")]
        repeated = record("b", "Respuesta duplicada")
        _, test, audit = retrain.partition(original, original + [repeated, dict(repeated)], set())
        self.assertEqual(test[0]["text"], "Respuesta duplicada")
        self.assertEqual(audit["test"]["records_downloaded"], 2)
        self.assertEqual(audit["test"]["records_used"], 1)
        self.assertEqual(audit["test"]["same_participant_duplicate_records_removed"], 1)

    def test_repeated_response_with_conflicting_scores_is_not_silently_cleaned(self):
        original = [record("a", "Original")]
        with self.assertRaisesRegex(ValueError, "Conflicting duplicate"):
            retrain.partition(original, original + [record("b", "Repetido", "0.7"), record("b", "Repetido", "0.3")], set())

    def test_repeated_response_between_two_test_people_remains_rejected(self):
        original = [record("a", "Original")]
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            retrain.partition(original, original + [record("b", "Repetido"), record("c", "Repetido")], set())

    def test_nested_fold_indices_never_leak_a_participant(self):
        folds = retrain.outer_folds(20)
        held_out = []
        for train, test in folds:
            self.assertFalse(set(train) & set(test))
            self.assertEqual(len(train), 16)
            self.assertEqual(len(test), 4)
            held_out.extend(test)
        self.assertEqual(sorted(held_out), list(range(20)))

    def test_fitting_fresh_numeric_models_learns_opposite_targets(self):
        x = np.arange(20, dtype=float).reshape(-1, 1)
        ascending = x[:, 0] * 4 + 10
        descending = 100 - ascending
        up = retrain.fit_candidate("distilbert", x, ascending)
        down = retrain.fit_candidate("distilbert", x, descending)
        self.assertLess(np.mean(np.abs(up.predict(x) - ascending)), .2)
        self.assertLess(np.mean(np.abs(down.predict(x) - descending)), .2)
        self.assertGreater(up.predict([[15]])[0], up.predict([[2]])[0])
        self.assertLess(down.predict([[15]])[0], down.predict([[2]])[0])

    def test_tfidf_features_are_fit_only_on_passed_training_texts(self):
        text = ["activo participa " + str(i) for i in range(10)] + ["tranquilo observa " + str(i) for i in range(10)]
        target = np.array([80.] * 10 + [20.] * 10)
        fitted = retrain.fit_candidate("tfidf", text, target)
        self.assertLess(np.mean(np.abs(fitted.predict(text) - target)), 3)
        before = dict(fitted.named_steps["tfidf"].vocabulary_)
        fitted.predict(["heldoutonlyword neverintrainsample"])
        self.assertEqual(fitted.named_steps["tfidf"].vocabulary_, before)
        self.assertNotIn("heldoutonlyword", before)

    def test_metric_units_r2_and_negative_delta_mean_improvement(self):
        target = [0., 50., 100.]
        good = [0., 50., 100.]
        reference = [50., 50., 50.]
        metric = retrain.point_metrics(target, good)
        self.assertEqual(metric["mae_points"], 0.)
        self.assertEqual(metric["rmse_points"], 0.)
        self.assertEqual(metric["r2"], 1.)
        self.assertAlmostEqual(retrain.point_metrics(target, reference)["mae_points"], 100/3)
        paired = retrain.paired_mae(target, good, reference, repetitions=100)
        self.assertAlmostEqual(paired["delta_new_minus_reference_points"], -100/3)
        self.assertLessEqual(paired["ci95"][1], 0.)

    def test_undefined_correlations_and_auc_are_not_fabricated(self):
        metric = retrain.point_metrics([50., 50., 50.], [50., 50., 50.])
        self.assertIsNone(metric["pearson"])
        self.assertIsNone(metric["spearman"])
        self.assertIsNone(metric["r2"])
        self.assertIsNone(metric["auc"])

    def test_invalid_metric_input_is_rejected(self):
        for a, b in [([1, 2, 3], [1, 2]), ([1, 2, 3], [1, 2, np.nan]), ([1, 2, 101], [1, 2, 3])]:
            with self.assertRaises(ValueError):
                retrain.point_metrics(a, b)

    def test_saved_model_roundtrip_preserves_predictions(self):
        x = np.arange(20, dtype=float).reshape(-1, 1)
        fitted = retrain.fit_candidate("distilbert", x, 5*x[:, 0])
        before = fitted.predict([[3.], [7.]])
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixture.joblib"
            joblib.dump(fitted, path)
            after = joblib.load(path).predict([[3.], [7.]])
        np.testing.assert_array_equal(before, after)

    def test_repeated_fits_are_deterministic(self):
        x = np.arange(60, dtype=float).reshape(20, 3)
        target = np.arange(20, dtype=float)*4
        a = retrain.fit_candidate("distilbert", x, target)
        b = retrain.fit_candidate("distilbert", x, target)
        np.testing.assert_array_equal(a.predict(x), b.predict(x))


if __name__ == "__main__":
    unittest.main()
