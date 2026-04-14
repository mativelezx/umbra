# Umbra — OSF Standard Preregistration

## Study Information

**Title**: Umbra: Preregistration for a computational study on the consistency and robustness of LLM-based personality profiling grounded in Big Five, Jung, and Positive Computing

**Authors**: Matías Velez, supervised by [advisor name — placeholder]

**Affiliation**: Universidad Siglo 21 — Ingeniería en Software, Argentina

**Description**: Umbra is a software engineering thesis project that uses a large language model to analyze short introspective texts and generate structured personality profiles grounded in three knowledge sources: Big Five content from IPIP-NEO, Jungian cognitive functions, and a Positive Computing framing oriented toward reflective and non-clinical use. This preregistration covers a computational evaluation of the instrument behavior of the analyzer, not claims about real users. In this study, the LLM is treated as a stochastic instrument, the evaluation cases are fixed stimuli, and the confirmatory hypotheses concern whether the instrument behaves consistently and safely under controlled conditions. Three hypotheses are preregistered. H1 tests determinism: whether repeated analysis of the same text with temperature = 0 and a pinned model SKU yields essentially the same Big Five scores. H2 tests robustness to semantic-preserving paraphrase: whether wording changes that preserve meaning leave Big Five scores stable within a preregistered tolerance. H3 tests the safety pipeline: whether a two-stage crisis detection system achieves high recall and adequate precision on a balanced synthetic dataset. The study matters because LLM-based profiling tools are only defensible if they are reproducible enough to audit, robust enough to resist superficial wording variation, and conservative enough to avoid missing genuine crisis content.

## Hypotheses

**H1 — Determinism**: The confirmatory hypothesis is that, given `temperature=0` and a pinned analyzer model SKU (`claude-sonnet-4-6-20260301`, or an equivalent immutable dated SKU explicitly recorded in the run metadata), analyzing the same introspective text five times produces Big Five scores whose standard deviation is below 2.5 points on all five dimensions for all 50 cases in the evaluation corpus. This is an all-or-nothing criterion at the case-by-dimension level. The null hypothesis is that at least one Big Five dimension in at least one case has a standard deviation of 2.5 points or greater across the five runs. The decision rule is to reject the null and consider H1 supported only if every case satisfies `SD < 2.5` for openness, conscientiousness, extraversion, agreeableness, and neuroticism.

**H2 — Intra-vendor paraphrase robustness**: The confirmatory hypothesis is that, given three semantic-preserving paraphrases per case generated within the Anthropic family using Claude Sonnet and Claude Haiku rewriters, the maximum pairwise delta of Big Five scores across the four versions of each case (original plus three paraphrases) remains below 10 points on all five dimensions for all 50 cases. The null hypothesis is that at least one Big Five dimension in at least one case shows a maximum pairwise delta of 10 points or greater. The decision rule is to reject the null and consider H2 supported only if every case satisfies `max_pairwise_delta < 10` on all five Big Five dimensions. This hypothesis is intentionally limited to intra-vendor robustness, not cross-vendor robustness. A cross-vendor test would make a stronger claim, but it was judged infeasible on the available CI infrastructure because the originally planned local Llama path is not reliable on GitHub Actions runners; this limitation is documented a priori.

**H3 — Safety pipeline precision and recall**: The confirmatory hypothesis is that, on a balanced labeled dataset of `n=100` cases (`25 real_crisis`, `25 idiom`, `25 borderline`, `25 safe`), the two-stage crisis detection pipeline achieves recall of at least 0.95 and precision of at least 0.85. The pipeline consists of a first-pass lexical/regex detector with Argentine idiom guards followed, when triggered, by a Claude classifier with fail-closed semantics. The null hypothesis is that recall is below 0.95 and/or precision is below 0.85. The decision rule is to reject the null and consider H3 supported only if both thresholds are met in the same confusion matrix. Recall is weighted more heavily than precision because, in safety-critical applications, a false negative that misses a real crisis is costlier than a false positive that blocks a non-crisis conversation.

## Design Plan

**Study type**: This is an observational computational study with no human participants and no experimental manipulation of people. The model is treated as a stochastic instrument and the eval cases are fixed stimuli authored for this study.

**Blinding**: Not applicable. H1 and H2 use fixed computational stimuli and automated scoring extraction. H3 uses a pre-labeled dataset that is reviewed before evaluation; there are no live human raters during the confirmatory runs.

**Study design**: H1 uses a repeated-measures within-case design: each of the 50 texts is analyzed five times under the same settings. H2 uses a structured paraphrase-robustness design: each of the 50 texts is passed through three rewriter conditions, and each rewritten variant is compared against the original baseline analysis, yielding the preregistered `50 × 3 × 2 = 300` comparison-level measurements used to summarize stability. H3 uses a between-category classifier evaluation on a balanced dataset spanning four predefined categories.

**Randomization**: No random assignment is used. The analyzer is run at `temperature=0` for H1 and for the scoring stage of H2. The rewriter in H2 is run at `temperature=0.3` to introduce controlled lexical variation while attempting to preserve semantics.

## Sampling Plan

**Existing data**: No pre-existing human-subject data are used. All H1/H2 evaluation cases were created specifically for this study. The H3 dataset was also created specifically for this study; its draft was generated with OpenAI `gpt-5.4` assistance (Codex) and then reviewed by the research team.

**Explanation of existing data**: Not applicable. These are forward-collected computational stimuli rather than secondary data.

**Data collection procedures**: The H1/H2 corpus contains 50 fixed cases committed to the repository at commit `d01253069fff24f3b054b89f7ffaaca87b53e660`. It includes 20 IPIP-NEO-adapted vignettes based on public-domain Big Five materials (Goldberg, 1999), 20 Jung-adapted vignettes based on public-domain typology material (Jung, 1921), and 10 adversarial cases synthesized by the research team to probe contradictions, brevity, ambivalence, and other edge conditions. The H3 dataset contains 100 labeled synthetic cases, balanced across `real_crisis`, `idiom`, `borderline`, and `safe`. All crisis examples are synthetic and plausible rather than taken from real users; they contain no personally identifying information and avoid operational self-harm detail. The dataset draft was created with Codex assistance and then reviewed by humans before use.

**Sample size**: H1 includes `50 cases × 5 runs = 250` analyses. H2 includes `50 cases × 3 paraphrases × 2 comparison slots = 300` comparison-level measurements, with pairwise deltas computed across the original plus three paraphrases. H3 includes `n=100` labeled cases. There are no human participants.

**Sample size rationale**: For H1, 250 analyses across five trait dimensions provide a stringent basis for detecting instability above the preregistered tolerance. For H2, 50 cases spanning three source families and multiple paraphrase conditions are sufficient for a practical robustness screen at thesis scope. For H3, a balanced `n=100` provides transparent confusion-matrix estimates and category coverage adequate for a TFG-level safety benchmark, while acknowledging that interval estimates around recall and precision remain wider than in larger clinical validation studies.

**Stopping rule**: All preregistered cases will be run to completion. If Claude fails to return parseable JSON for a given analysis after three retries, that case instance will be excluded from confirmatory analysis and reported explicitly.

## Variables

**Manipulated variables**: None. This is observational at the level of fixed computational inputs.

**Measured variables**: The analyzer returns Big Five scores for five dimensions on a `0-100` scale, Jung function scores for eight functions on a `0-100` scale, dominant archetype assignment with six possible categories, secondary archetype label, confidence on a `0-100` scale, and free-text reasoning. The safety pipeline returns `is_crisis` as a binary classification, `severity` as an ordinal label (`low`, `med`, `high`), confidence, and reasoning text.

**Indices**: For H1, the primary index is per-case standard deviation for each Big Five dimension across five runs. For H2, the primary index is the per-case maximum pairwise delta for each Big Five dimension across the original and three paraphrases. For H3, the primary indices are the confusion matrix and the derived metrics precision, recall, F1, and false-negative rate.

## Analysis Plan

**Statistical models**: H1 and H2 use descriptive statistics rather than inferential models: standard deviation for H1 and maximum pairwise delta for H2, both computed per case and per dimension. H3 uses a confusion-matrix evaluation with point estimates for precision, recall, F1, and false-negative rate.

**Transformations**: Score outputs are constrained to the `[0, 100]` range before summary analysis. If a raw model response implies an out-of-range or otherwise invalid value, that event will be logged as a parsing anomaly, excluded from confirmatory interpretation, and reported.

**Inference criteria**: H1 is considered supported only if `stddev < 2.5` on all five Big Five dimensions for all 50 cases. H2 is considered supported only if `max_pairwise_delta < 10` on all five Big Five dimensions for all 50 cases. H3 is considered supported only if recall is at least `0.95` and precision is at least `0.85` in the same evaluation run.

**Data exclusion**: Case instances that produce unparseable JSON after three retries are excluded and reported. This is not expected to exceed 5% of analyses. Any deviation from the preregistered corpus counts will be explicitly labeled as a protocol deviation rather than silently absorbed.

**Missing data**: No missing data are expected because the stimuli are fixed and computational. If an API call fails transiently, the affected case is rerun later and the snapshot timestamp is updated. Confirmatory interpretation is based on the completed committed snapshot used for the thesis.

**Exploratory analyses**: Any analysis beyond the pass/fail rules above will be labeled exploratory. This includes dimension-specific stability differences in H1 or H2, category-level error patterns in H3, qualitative review of failure cases, and operational observations such as latency or load effects. Exploratory findings will not be used to retroactively redefine the confirmatory thresholds.

## Other

**Other**: The following architecture decisions are part of the methodological record for this preregistration: ADR-002, ADR-005, ADR-008, ADR-011, ADR-012, ADR-014, ADR-015, ADR-020, and ADR-023 in `docs/DECISIONS.md`.

Methodological limitations are declared in advance. First, H2 is intra-vendor rather than cross-vendor, so it tests robustness within the Anthropic family only. Second, Big Five grounding uses IPIP-NEO rather than the proprietary NEO-PI-R; this is substantively aligned but may reduce immediate brand recognition. Third, the H3 dataset was initially draft-generated with Codex assistance and then reviewed; a fully human-authored benchmark would be stronger. Fourth, if smaller subsets are used for pilot smoke tests because of API budget or time constraints, those pilot runs will be treated as non-confirmatory; only the full preregistered corpus counts for confirmatory claims, and any final deviation in corpus size will be reported transparently in the thesis.

Ethically, this preregistration covers Branch B as defined in ADR-023: computational validation as the primary evidence base. H1, H2, and H3 involve no human subjects. A separate M3 think-aloud study with approximately 8 to 10 participants is planned as secondary user validation, but it is outside this preregistration and will be reported separately as qualitative secondary evidence.

Data and code availability are public by design. The repository URL is `https://github.com/mativelezx/umbra`. Eval cases, evaluation code, and results snapshots are committed to the repository. In line with ADR-014, committed cache snapshots are used to support offline replication against the exact analyzer outputs cited in the thesis rather than against a mutable live API. The intended reproducibility claim is therefore modest and specific: results are reproducible against a committed snapshot at a cited git commit. For example, `npm run eval:h1 -- --from-cache` reproduces H1 offline from the committed snapshot associated with the commit cited in the thesis.

## Bibliography

Calvo, R. A., & Peters, D. (2014). *Positive Computing: Technology for Wellbeing and Human Potential*. MIT Press.

Goldberg, L. R. (1999). A broad-bandwidth, public-domain, personality inventory measuring the lower-level facets of several five-factor models. In I. Mervielde, I. Deary, F. De Fruyt, & F. Ostendorf (Eds.), *Personality Psychology in Europe* (Vol. 7, pp. 7-28). Tilburg University Press.

Jung, C. G. (1921). *Psychological Types*.

Nielsen, J., & Landauer, T. K. (1993). A mathematical model of the finding of usability problems. *Proceedings of INTERCHI '93*, 206-213.

Pearson, C. S. (1991). *Awakening the Heroes Within*. HarperCollins.
