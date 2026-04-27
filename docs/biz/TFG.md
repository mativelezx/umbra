# Umbra — TFG (Trabajo Final de Grado) Deliverables (post-pivot ML, 2026-04-27)

> The academic dimension of Umbra. Thesis structure, defensa preparation,
> componente analítico propio (módulo ML).
>
> **Banner pivot ML (ADR-002 v2 + ADR-026 + ADR-028)**: la validación
> primary del TFG entregado es el reporte de **MSE / R² / r de Pearson
> por dimensión Big Five** sobre el regresor entrenado del módulo ML
> propio (`/ml/`). H1 (determinismo Claude) y H2 (paráfrasis intra-vendor
> Claude) quedaron deprecadas (ADR-011 + ADR-020 SUPERSEDED) porque la
> inferencia Big Five ya no la hace Claude. La preregistración OSF se
> descartó (ADR-012 SUPERSEDED): la auditabilidad la cubren DVC + MLflow
> + commits del repo público + métricas committeadas. H3
> (crisis classifier) se mantiene como validación adicional del pipeline
> de seguridad. M3 (think-aloud n=8-10 con SUS rioplatense) sigue como
> secondary user validation.
>
> **Estado del eval post-pivot (2026-04-27)**:
>
> | Componente | Estado | Métrica primary | Reporte |
> |---|---|---|---|
> | Módulo ML — Big Five por dimensión | pipeline reproducible end-to-end (`make all`); métricas committeadas en `/ml/eval_metrics.json` (umbrales R²>0.20, r>0.30 por dimensión) | MSE, R², r de Pearson por dimensión × bloque (english_only / rioplatense_only / combined) | el bloque `rioplatense_only` sustenta la narrativa del TFG |
> | H3 — crisis classifier | ejecutada n=100 dos configs | recall≥0.95, precision≥0.85 | config forzada PASA (recall=1.0, precision=0.862); sampling=0.01 producción es bottleneck honesto |
> | M3 — think-aloud n=8-10 | pendiente | SUS≥68 + coding temático | materiales en `docs/research/`; ejecución TP3-TP4 |
>
> Los resultados reales del módulo ML viven en `/ml/eval_metrics.json`
> (committeado). Los resultados pre-pivot de H1/H2 quedan preservados
> como `eval-results/legacy/*.json` (ver COMMIT_PLAN.md), no son
> evidencia primary del TFG entregado. La discusión académica sobre el
> pivot y por qué los hallazgos pre-pivot motivan la migración va en
> los capítulos 06 (Arquitectura) y 11 (Discusión) de la tesis.

## Context

- **Program**: Ingeniería en Software, Universidad Siglo 21 (Argentina)
- **Type**: TFG (Trabajo Final de Grado) — required for graduation
- **Format**: monografía + working software artifact
- **Tribunal**: 3 professors (software engineering + possibly one psychology-adjacent)
- **Grade scale**: 0-10 in Argentina; 9-10 = summa cum laude / "con honores"

## Deliverables

### 1. The product (Umbra web app)
Phases 2-7 as specified in the master doc + CEO plan + eng review. Runs on
Vercel + Supabase. Publicly accessible OR demo'd to the tribunal via screen
share.

### 2. The written thesis (monografía)
~50-80 pages in LaTeX or Word. Required sections:

1. **Portada** — title, author, advisor, date, institution
2. **Resumen** — 250-word abstract in Spanish + English
3. **Introducción** — problem statement, motivation, research questions
4. **Marco teórico** — Jung's cognitive functions (Jung 1921 + Sauer 2025), Big Five (Goldberg IPIP 1999), Pearson archetypes (Pearson 1991), Positive Computing (Calvo & Peters 2014)
5. **Estado del arte** — landscape review: 16personalities, Deep Personality, Truity, academic literature on AI personality assessment
6. **Metodología** — the eval suite (H1 determinismo + H2 robustez paráfrasis + H3 safety empírico del crisis classifier), OSF preregistration, knowledge base construction from primary sources, **protocolo M3 de think-aloud con n=8-10 (SUS + coding temático)**. Ver [VALIDATION.md](VALIDATION.md) para detalles completos.
7. **Arquitectura del sistema** — Next.js App Router, Supabase, Anthropic Claude, decisiones arquitecturales (synthesized from `docs/DECISIONS.md`)
8. **Implementación** — phase-by-phase breakdown, key technical challenges, trade-offs
9. **Validación** — H1 determinism results, H2 cross-model paraphrase results, **H3 crisis classifier precision/recall sobre dataset n=100**, **M3 think-aloud results (SUS scores + temas cualitativos con citas)**, limitations
10. **Discusión** — findings, implications, limitations, threats to validity
11. **Conclusiones** — contributions, future work
12. **Referencias** — APA format, full bibliography
13. **Anexos** — OSF preregistration (full PDF or URL), code repo URL, ADRs, eval cache snapshot commit hash

### 3. Paper / preprint (optional but recommended for "con honores")
Shorter version of the thesis (~8-12 pages) in conference paper format.
Potential venues:
- **CLEI** (Conferencia Latinoamericana de Informática)
- **JAIIO** (Jornadas Argentinas de Informática)
- **OSF preprint server** (if no formal venue)

### 4. OSF preregistration
Live link: `osf.io/<your-project-id>` (created before first data collection)

See "Preregistration" section below for content.

### 5. Defense presentation (~20-30 min + Q&A)
Slides covering:
- Problem + motivation (2 slides)
- Landscape + differentiation (2 slides)
- Methodology (H1 + H2 + KB construction) (5 slides)
- Architecture (3 slides, with diagrams from `tech/ARCHITECTURE.md`)
- Live demo (5-7 min in browser)
- Validation results (4 slides — H1 + H2 numbers, honest limitations)
- Future work (1 slide)
- Q&A

## Research questions (for thesis)

**RQ1**: Can a large language model with a structured knowledge base from
primary psychological sources produce consistent personality profiles from
introspective text?
- Operationalized as H1 (determinism)

**RQ2**: How robust is the profile against semantic-preserving paraphrases
of the same input?
- Operationalized as H2 (cross-model paraphrase consistency, limited to
  intra-vendor Sonnet + Haiku rewriters per ADR-020)

**RQ3**: Can a self-knowledge product built on this methodology ship with
ethical and legal safeguards compliant with Ley 25.326 and Calvo & Peters'
Positive Computing principles, and is its crisis detection pipeline
empirically safe?
- Operationalized as the compliance matrix in [SYSTEM_SPEC.md](../SYSTEM_SPEC.md)
- Validated by the chat safety pipeline and consent flow implementations
- **Quantified as H3**: precision/recall del crisis classifier sobre
  dataset etiquetado n=100 (target recall ≥ 0.95, precision ≥ 0.85). Ver
  [VALIDATION.md H3](VALIDATION.md#h3--precision-y-recall-del-pipeline-de-crisis).

**RQ4**: ¿Es Umbra percibido como usable y alineado con autonomía y
competencia del Positive Computing por usuarios reales de perfil similar
al target (estudiantes universitarios argentinos, 18-30 años)?
- Operationalized as **M3 think-aloud** with n=8-10 participants,
  structured SUS questionnaire (Spanish rioplatense), and thematic coding
  of session recordings. See [VALIDATION.md M3](VALIDATION.md#m3--think-aloud-con-reclutamiento-controlado-secondary-validation).
- NOT preregistered in OSF (M3 is qualitative secondary validation, not
  confirmatory hypothesis).

## Preregistration (OSF Standard Prereg)

### Template: OSF Preregistration (standard)
(NOT Secondary-Data Prereg — per ADR-012, Umbra uses the standard template
with a computational-study framing paragraph.)

### Sections

#### Study Information
- **Title**: "Umbra: Evaluación de consistencia de análisis de personalidad generado por LLM sobre bases teóricas estructuradas"
- **Authors**: [developer name], supervised by [advisor name]
- **Affiliation**: Universidad Siglo 21, Ingeniería en Software
- **Description**: computational study evaluating determinism and paraphrase-robustness of Claude Sonnet analyses of Spanish introspective text, grounded in a structured knowledge base of IPIP-NEO (Big Five), Jung cognitive functions, and Pearson archetypes.

#### Hypotheses
- **H1 — Determinism**: Given temperature=0 and pinned model SKU (`claude-sonnet-4-6-20260301`), analyzing the same input text produces Big Five scores with standard deviation < 2.5 points (equivalent to < 5-point range) across 5 consecutive runs on all 50 eval cases.
- **H2 — Cross-model paraphrase consistency**: Given 3 semantic-preserving paraphrases produced by Claude Sonnet and Claude Haiku rewriters, the Big Five scores for the paraphrased texts deviate < 10 points (max pairwise delta) from the original on all 50 eval cases.
- **H3 — Crisis classifier safety**: The 2-stage crisis detection pipeline (regex with Argentine idiom guards + Claude classifier with fail-closed semantics) achieves recall ≥ 0.95 and precision ≥ 0.85 on a balanced labeled dataset of n=100 messages (25 real crisis + 25 Argentine idioms + 25 borderline + 25 safe). Recall threshold is higher than precision because false negatives (missing a real crisis) are costlier than false positives (blocking a safe conversation). See [VALIDATION.md H3](VALIDATION.md#h3--precision-y-recall-del-pipeline-de-crisis).

#### Design Plan
- **Type**: observational computational study, no manipulation
- **Model = instrument**: Claude Sonnet acts as a stochastic instrument; eval cases are fixed stimuli
- **Temperature**: 0 for H1 (determinism), 0.3 for H2 (rewriter creativity)
- **Prompt**: pinned at commit hash `<hash>` in `lib/prompts/analyze-profile.ts`
- **Knowledge base**: pinned at commit hash `<hash>` in `lib/knowledge/`

#### Sampling Plan
- **Eval cases**: 50 total
  - 20 adapted from IPIP-NEO published vignettes (public domain)
  - 20 from Jung typology literature (Tipos Psicológicos, public domain)
  - 10 adversarial cases synthesized by the developer
- **Inter-rater check**: 10 of 50 cases are labeled by 2 raters (developer + external). Cohen's kappa > 0.6 required before case ranges are locked.
- **Sample size justification**: 50 cases is sufficient to detect deviations > 5 points with high statistical power per dimension, given 5 Big Five dimensions and 8 Jung functions (65 measurements per case × 50 cases = 3250 data points)
- **No human subjects**: all eval data is computationally generated

#### Variables
- **Primary measures (per case)**: Big Five scores (5 × 0-100), Jung function scores (8 × 0-100), archetype assignment (categorical, 6 levels)
- **H1 derived**: standard deviation of each dimension across 5 runs
- **H2 derived**: maximum pairwise delta across 3 paraphrases

#### Analysis Plan
- **H1 pass criterion**: stddev(scores_per_run) < 2.5 for ALL dimensions on ALL 50 cases
- **H2 pass criterion**: max_pairwise_delta < 10 for ALL dimensions on ALL 50 cases
- **Partial pass**: per-dimension thresholds may be reported if all-or-nothing fails. Paper discloses both
- **Exclusion criteria**: cases where Claude refuses to output JSON (handled by retry; if 2 retries fail, case is excluded and reported)
- **Reproducibility**: committed cache snapshot allows offline replay at any future date

#### Other
- **ADRs attached**: `docs/DECISIONS.md` (22 ADRs)
- **Limitations**:
  - H2 uses intra-vendor rewriters (Sonnet + Haiku), not cross-vendor. Documented in ADR-020
  - IPIP-NEO vs NEO-PI-R substitution documented in ADR-015
  - **No hay test-retest longitudinal con usuarios reales** (requires ethics review + multi-sesión); user validation se cubre con M3 think-aloud single-session, documentado como secondary validation en ADR-023
  - **M3 n=8-10 es bajo** para afirmaciones con poder estadístico fuerte sobre usabilidad; defensible por la regla de Nielsen & Landauer (1993) pero se declara explícitamente como limitación
  - **Self-selection bias en M3**: reclutamiento por red personal del autor; mitigado por inclusión de participantes con exposición variable al producto
- **Ethics statement**: **Branch B adoptada por ADR-023 (2026-04-14)**. Validación computacional (H1/H2/H3) como primary evidence; M3 think-aloud con n=8-10 como secondary user validation sin comité de ética formal (usability testing informal con consentimiento escrito simple). H1, H2 y H3 son puramente computacionales. M3 sigue principios de Helsinki + Calvo & Peters (ver [ETHICS.md](ETHICS.md)).
- **Data availability**: committed cache snapshots in repo. Raw Claude API responses are NOT published (privacy). All eval code open source.

### Timing
- Preregistration submitted BEFORE first H1 / H2 run
- Published after advisor review (to catch methodology errors)
- Timestamped on OSF
- Link included in thesis annex and paper

## Timeline (suggested)

| Week | Activity |
|---|---|
| W1 | Phase 0 ethics meeting + Phase 1.5 engineering |
| W2-3 | KB research in NotebookLM (parallel with Phase 2) |
| W4 | Phase 2 complete (auth + consent + layout) |
| W5 | Phase 3 complete (onboarding + analysis + evals) |
| W6 | Phase 4 complete (dashboard) + OSF preregistration drafted |
| W7 | Phase 5 complete (narrative + chat) |
| W8 | OSF preregistration submitted (before first eval run) |
| W9 | Phase 6 complete (plan + export + a11y) |
| W10 | Phase 7 complete (polish + deploy) |
| W11 | First H1 + H2 eval runs + thesis writing begins |
| W12-14 | Thesis writing + paper draft |
| W15-16 | Advisor reviews, revisions |
| W17 | Defense |

Assumes 5-month runway. If shorter, see emergency cut order in TODOS.md.

## Thesis writing tips

### Structure per section
- **Marco teórico**: use `docs/PROMPT_ARCHITECTURE.md` + `lib/knowledge/*.ts` as your primary material. Each knowledge file's citations are already in JSDoc comments — grep for them.
- **Metodología**: `docs/tech/EVALS.md` + OSF preregistration text are ~80% of this section
- **Arquitectura**: `docs/tech/ARCHITECTURE.md` + `docs/DECISIONS.md` — include 2-3 ADRs verbatim as appendix
- **Validación**: H1 + H2 results tables, with discussion of edge cases and failures
- **Discusión**: cathedral risks (acknowledged in CEO plan), limitations, threats to validity

### Academic voice
- Spanish formal (NOT rioplatense) for the thesis itself
- The product's voice (voseo rioplatense) is a design decision that gets documented in the thesis but the thesis prose is standard Spanish academic
- Cite everything. APA 7th edition. Use a reference manager (Zotero recommended)

### Figures + diagrams
- Every ASCII diagram in `docs/tech/` can become a clean diagram in the thesis (e.g., draw.io, Mermaid, or direct in LaTeX via TikZ)
- Screenshots of key UI moments (onboarding, dashboard, chat) — figure captions reference the design system
- Sequence diagram for crisis pipeline (important — shows safety engineering rigor)

### Honesty about limitations
- Don't hide the known weaknesses
- H2 intra-vendor instead of cross-vendor
- No user-level test-retest
- Pseudonymization vs anonymization
- KB gaps documented in `citation-check.test.ts` output
- "Acknowledged Cathedral Risks" from the CEO plan — paste them verbatim in discussion

## Defense strategy

### Likely questions + answers
- **"Por qué Claude y no otro modelo?"** → pinned SKU for H1 determinism; Claude's better instruction-following in Spanish; cost at scale
- **"Cómo sabemos que el análisis es válido y no alucinación?"** → H1 (determinism) + H2 (cross-model robustness) + committed cache snapshot reproducibility + knowledge base with verifiable citations
- **"Qué pasa si Claude cambia su modelo?"** → pinned SKU (not alias); ADR-014 documents this
- **"Esto es terapia?"** → no, explicit non-goal; show the banner + crisis classifier; it's a reflective mirror, not a therapist
- **"Datos personales — cómo cumplís con Ley 25.326?"** → walk through `/consent` flow, data rights endpoints, pseudonymization honesty
- **"MBTI?"** → no, Jung functions directly; cite Sauer 2025 "Rehabilitating Jung's Cognitive Function Theory"
- **"Qué diferencia con 16personalities?"** → see `biz/MARKET.md` differentiation matrix
- **"Cuál es la contribución científica?"** → the eval methodology (H1 + H2) as a template for evaluating LLM-based personality instruments; the open-source knowledge base + prompts + cache snapshots
- **"Qué falta?"** → longitudinal tracking, cross-vendor H2, real user test-retest — all documented as future work

### Demo script (5-7 min)
1. Landing (10s) — show design, branding
2. Register + consent (30s) — show Ley 25.326 compliance
3. Onboarding guided flow (60s) — show the 5 areas, the progressive load animation, the evidence highlights
4. Dashboard (45s) — show the radar, Jung bars, archetype card with custom SVG
5. Narrative (45s) — show the streaming, read the first paragraph
6. Chat (60s) — send a normal message, then send a crisis keyword, show the crisis card blocking
7. Export (20s) — show the PDF download
8. /settings/export (20s) — show the Ley 25.326 access right ZIP

Total: ~5 min live. Rest: Q&A.

## Paper submission (post-defense)

Candidate venues:
- **CLEI 2026 / 2027** — Latin American computing conference
- **JAIIO 2026 / 2027** — Argentine computing conference
- **arXiv.org cs.CL** — preprint
- **Psychology of Programming** — if paper leans more toward psychology/product

The preregistration + open eval suite + committed cache snapshots make the
paper strong for any of these.

## References

### Academic

- Sauer, T. (2025). Rehabilitating Jung's Cognitive Function Theory.
- Jung, C.G. (1921). Tipos Psicológicos.
- Goldberg, L. R. (1999). A broad-bandwidth, public domain, personality inventory measuring the lower-level facets of several five-factor models. In I. Mervielde et al. (Eds.), *Personality Psychology in Europe*, Vol. 7 (pp. 7-28). Tilburg University Press.
- Pearson, C. S. (1991). *Awakening the Heroes Within*.
- Calvo, R. A., & Peters, D. (2014). *Positive Computing: Technology for Wellbeing and Human Potential*. MIT Press.
- Stein, R., & Swan, A. B. (2019). Evaluating the Validity of the Myers-Briggs Type Indicator. *Social and Personality Psychology Compass*, 13(2).
- Brooke, J. (1996). SUS: A quick and dirty usability scale. In P. W. Jordan et al. (Eds.), *Usability evaluation in industry*. Taylor & Francis.
- Nielsen, J., & Landauer, T. K. (1993). A mathematical model of the finding of usability problems. *Proceedings of ACM INTERCHI 93*, 206-213.
- Sauro, J. (2011). *A Practical Guide to the System Usability Scale*. Measuring Usability LLC.
- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77-101.

### External

- [OSF preregistration guidelines](https://www.cos.io/initiatives/prereg)
- [Ley 25.326 (Protección de Datos Personales, Argentina)](https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm)
- [People + AI Guidebook (Google PAIR)](https://pair.withgoogle.com/guidebook/)

### Internal (repo)

- [biz/IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — plan de ejecución por fases con QA Gate
- [biz/VALIDATION.md](VALIDATION.md) — hipótesis H1/H2/H3 + protocolo M3 completo
- [biz/LEGAL.md](LEGAL.md)
- [biz/ETHICS.md](ETHICS.md)
- [DECISIONS.md](../DECISIONS.md) — ADRs 001-024
- [tech/EVALS.md](../tech/EVALS.md)
- [tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) — objeto de H3
- [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md)
