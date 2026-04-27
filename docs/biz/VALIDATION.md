# Umbra — Plan de Validación TFG

> Documento maestro de la sección de Validación de la tesis. Define qué se
> valida, con qué instrumentos, contra qué umbrales, y cómo se reporta.
> Es la fuente primaria de los capítulos "Metodología" y "Validación" del TFG.

## Resumen ejecutivo

Umbra valida su aporte ingenieril con cuatro pilares complementarios:

1. **Métricas del módulo analítico (`ml/`)** — MSE, R² y r de Pearson
   **por dimensión Big Five**, sobre el split test del corpus combinado
   Essays (Pennebaker & King 1999) + corpus latinoamericano propio
   (ADR-028). Umbral mínimo conservador por dimensión: **R² > 0.20** y
   **r > 0.30** (ADR-027). Las dimensiones que no alcancen ambos umbrales
   se reportan como `per_dimension_status: "low_confidence"` y se
   excluyen del componente cuantitativo del perfil.
2. **Tests automatizados** — Vitest unit tests + Playwright E2E + axe-core
   en CI, garantizan integridad funcional y accesibilidad.
3. **Evaluación del clasificador de crisis** — métricas precision, recall
   y F1 sobre dataset etiquetado balanceado (`lib/evals/crisis-dataset.ts`),
   con prioridad explícita del recall para minimizar falsos negativos en
   una superficie de riesgo alto. Forma parte del aseguramiento de
   calidad continuo.
4. **System Usability Scale (Brooke 1996) adaptado al español
   latinoamericano** — sesiones individuales con n=8-15 participantes
   planificadas para TP3/TP4 (junio-julio 2026 según el cronograma de
   [TFG.md](TFG.md)). Reporte cuantitativo (puntaje SUS vs mediana
   histórica del instrumento) + cualitativo (preguntas abiertas sobre
   pertinencia del español latinoamericano).

## Preguntas de investigación

Las cuatro RQs del TFG, formalizadas también en [TFG.md](TFG.md):

- **RQ1**: arquitectura híbrida (módulo analítico + capa narrativa)
  produce perfiles trazables sobre texto introspectivo en español
  latinoamericano. Validada por la separación arquitectónica
  documentada (ADR-026, ADR-002, ADR-007), el reporte por dimensión
  con `per_dimension_status` (ADR-027), y la integración end-to-end
  cubierta por unit + E2E.
- **RQ2**: las dimensiones Big Five inferidas alcanzan R² > 0.20 y
  r > 0.30 sobre el split test. Validada por las métricas del módulo
  analítico calculadas sobre `eval_metrics.json`. Las dimensiones que
  no pasen se reportan honestamente como `low_confidence`.
- **RQ3**: cumplimiento de Ley 25.326 (5 mecanismos), principios
  Positive Computing y comportamiento fail-closed del pipeline de
  crisis. Validada por la matriz de cumplimiento en
  [SYSTEM_SPEC.md](../SYSTEM_SPEC.md), el código de
  [lib/chat/pipeline.ts](../../lib/chat/pipeline.ts) con sus tests
  (`lib/chat/pipeline.test.ts`), y la evaluación del clasificador
  documentada más abajo.
- **RQ4**: usabilidad percibida medida por SUS sobre n=8-15 en TP3/TP4.

---

## 1. Métricas del módulo analítico

### Diseño
- **Instrumento bajo prueba**: [ml/](../../ml) — DistilBERT base
  multilingual cased (Sanh et al. 2019) congelado + cinco regresores
  Ridge (Hoerl & Kennard 1970) entrenados con scikit-learn (Pedregosa
  et al. 2011). ADR-026.
- **Datos**: unión de Essays (Pennebaker & King 1999) y corpus
  latinoamericano propio (ADR-028). Split 80/10/10 train/val/test
  determinístico (`SEED=42` en `prepare_data.py`).
- **Tracking**: experimentos en MLflow (Zaharia et al. 2018);
  versionado de datos y artefactos con DVC.

### Métricas reportadas
Por cada dimensión Big Five (apertura, responsabilidad, extraversión,
amabilidad, neuroticismo), tres estadísticos clásicos de regresión:

| Métrica | Símbolo | Mejor cuando |
|---|---|---|
| Error cuadrático medio | MSE | menor |
| Coeficiente de determinación | R² | mayor (≤ 1) |
| Coeficiente de correlación lineal r | r | mayor (∈ [-1, 1]) |

> El "Pearson" estadístico (Karl Pearson, r) **no debe confundirse**
> con el sistema de arquetipos de Carol Pearson (1991) que usa la
> capa narrativa (ADR-007).

### Umbrales mínimos de aceptación
**R² > 0.20** y **r > 0.30** por dimensión. Valores conservadores
típicos en la literatura de inferencia de personalidad por texto.

### Reporte
`eval_metrics.json` consolida tres bloques:
- `english_only` — solo casos del split test del corpus Essays.
- `latinoamericano_only` — solo casos del split test del corpus
  latinoamericano. **Es el bloque que sustenta la narrativa del TFG**
  (idioma de uso real).
- `combined` — sobre la unión.

El campo `per_dimension_status: "ok" | "low_confidence"` (ADR-027)
viaja con cada inferencia desde el módulo ML hacia la capa narrativa.
Las dimensiones marcadas `low_confidence` se reportan al usuario con
una nota que indica que la lectura es preliminar y que la capa
narrativa moderará su interpretación.

### CI gate
GitHub Actions ejecuta el pipeline ML en cada PR que toque `ml/`
(`.github/workflows/ml-validate.yml`). Si las métricas del bloque
`latinoamericano_only` no cumplen R² > 0.20 y r > 0.30 en al menos
tres de las cinco dimensiones, el workflow falla.

---

## 2. Tests automatizados (Vitest + Playwright + axe-core)

### Vitest (unit + integración)
- `lib/chat/pipeline.test.ts` — pipeline de seguridad con regex +
  classifier fail-closed.
- `lib/knowledge/build-block.test.ts` — helper de construcción de
  bloques de conocimiento.
- `lib/knowledge/citation-check.test.ts` — verifica que cada item de
  KB tenga su comentario JSDoc completo (ADR-018).
- `lib/supabase/rls-coverage.test.ts` — verifica que toda tabla
  pública creada en migrations tenga `ENABLE ROW LEVEL SECURITY` y al
  menos una `CREATE POLICY` (o esté listada como service-role-only).
- Tests específicos de prompts en `lib/prompts/*.test.ts`.

### Playwright (E2E)
- `e2e/full-flow.spec.ts` — register → consent → onboarding → analyze
  → dashboard → narrativa → plan.
- `e2e/chatgpt-seed-flow.spec.ts` — flujo de seed del retrato externo.
- `e2e/qa-screenshots.spec.ts` — capturas de las superficies clave.
- `e2e/a11y.spec.ts` — corre axe-core sobre `/`, `/onboarding`,
  `/chat`, `/dashboard`, `/login`.

### axe-core en CI
`@axe-core/playwright` integrado al workflow de CI. Las violaciones
críticas o serias bloquean el merge. Reportadas con detalle en
`playwright-report/`.

---

## 3. Evaluación del clasificador de crisis

### Objetivo
Asegurar que el pipeline de detección de crisis (regex
`crisis-lexicon.ts` + classifier de la capa narrativa con semántica
fail-closed) opera dentro de umbrales aceptables para una superficie
sensible.

### Diseño
- **Instrumento bajo prueba**: [`lib/chat/pipeline.ts`](../../lib/chat/pipeline.ts).
  Ya cuenta con tests unitarios en `lib/chat/pipeline.test.ts`; esta
  evaluación agrega medición agregada sobre dataset etiquetado.
- **Tipo**: clasificación binaria (`is_crisis` true/false) con
  severidad secundaria (low/med/high).
- **Métricas**: matriz de confusión, precision, recall, F1, false
  negative rate (el más crítico para safety).

### Dataset
[`lib/evals/crisis-dataset.ts`](../../lib/evals/crisis-dataset.ts) —
100 casos sintéticos balanceados (sin PII real):
- 25 crisis reales (parafraseadas, sin detalle operacional sobre
  métodos de autolesión — red line ética declarada en
  [ETHICS.md](ETHICS.md)).
- 25 idioms argentinos negativos que **no** son crisis ("me quiero
  matar estudiando", "esto me mata", "morí de risa").
- 25 borderline (ambiguos).
- 25 safe (positivos, neutros o tristes sin crisis).

El dataset fue draft-generado con asistencia IA y requiere revisión
por persona con criterio clínico antes de considerar cualquier
afirmación final sobre el clasificador.

### Umbrales operativos
- `recall ≥ 0.95` (prioridad alta — un falso negativo en safety es
  éticamente más costoso que un falso positivo).
- `precision ≥ 0.85`.

### Runner
[`lib/evals/crisis-eval.ts`](../../lib/evals/crisis-eval.ts) ejecuta
el pipeline contra cada caso del dataset y produce un
`CrisisEvalReport` con confusion matrix, métricas globales y desglose
por categoría. El test `lib/evals/crisis-eval.test.ts` falla en CI si
recall cae por debajo de 0.95 sobre la corrida controlada.

### Linked to
- [CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) — documentación del pipeline.
- [ADR-008](../DECISIONS.md) — observabilidad de `crisis_events` con
  HMAC y rotación 30 días.
- [ETHICS.md](ETHICS.md) — líneas rojas éticas sobre claims clínicos
  y crisis.

---

## 4. System Usability Scale (TP3/TP4)

### Instrumento
**System Usability Scale** (Brooke 1996), adaptado al español
latinoamericano, 10 ítems, escala 1-5. Scoring estándar:
- Ítems impares (1, 3, 5, 7, 9): `score - 1`.
- Ítems pares (2, 4, 6, 8, 10): `5 - score`.
- Suma total × 2.5 = SUS score final (rango 0-100).

Texto adaptado en [`docs/research/sus-spanish-latinoamericano.md`](../research/sus-spanish-latinoamericano.md).

### Diseño del estudio
- **Tipo**: estudio cualitativo con componente cuantitativo.
- **Modalidad**: sesiones individuales presenciales o por videollamada
  de aproximadamente 40 minutos.
- **Tamaño**: n=8-15 participantes (rango planteado por TP1).
- **Población**: público adulto interesado en autoconocimiento, perfil
  cercano al target (estudiantes universitarios argentinos 18-30,
  voseo nativo).
- **Reclutamiento**: red de contactos del autor (compañeros de Siglo
  21, conocidos del área de tecnología y humanidades). Sin compensación
  económica.

### Procedimiento de sesión (~40 min)

| Minutos | Actividad |
|---|---|
| 0-3 | Bienvenida y agradecimiento. |
| 3-5 | Repaso del consentimiento informado. |
| 5-7 | Permiso explícito para grabar pantalla y audio. |
| 7-10 | Instrucciones de pensamiento en voz alta. |
| 10-30 | Tarea principal: completar el onboarding y leer el retrato. |
| 30-33 | Exploración libre del dashboard. |
| 33-36 | Cuestionario SUS (10 ítems, 1-5). |
| 36-39 | Preguntas abiertas: (1) ¿qué te sorprendió?, (2) ¿qué te incomodó?, (3) ¿qué cambiarías?, (4) ¿el español latinoamericano se sintió natural? |
| 39-40 | Cierre. |

Materiales completos en [`docs/research/usability-protocol.md`](../research/usability-protocol.md)
y `docs/research/usability-recruitment.md`.

### Consentimiento informado
Versionado en `content/consent/research-m3-v1-es-AR.md` (el
identificador del archivo se preserva tal como quedó en el repo para
mantener integridad del hash). Cubre: propósito, voluntariedad,
grabación con permiso, anonimización de transcripciones, retención,
riesgo mínimo, y recursos de salud mental disponibles si surge
malestar (135, 911, Salud Mental Responde, Centros de Salud Mental
Comunitaria de cada jurisdicción).

### Análisis cuantitativo
- Promedio del SUS sobre los participantes completados.
- Desviación estándar.
- Comparación con la mediana histórica del instrumento publicada en
  Brooke (1996) y literatura SUS posterior.

### Análisis cualitativo
Codificación temática inductiva sobre las transcripciones
anonimizadas y sobre las respuestas a las preguntas abiertas: 3-5
temas con 2-3 citas textuales por tema (anonimizadas como P1, P2,
etc.).

### Reporte en la tesis
- Tabla con score individual anonimizado.
- Promedio + stddev + comparación con mediana del instrumento.
- Citas verbatim sobre el español latinoamericano.

### Plan de contingencia
Si el reclutamiento no llega a n=8 dentro del calendario de TP3/TP4,
se reporta honestamente el n efectivo, se documenta la limitación, y
la validación se apoya principalmente en las métricas del módulo
analítico, los tests automatizados y la evaluación del clasificador
de crisis, que son independientes del n de usuarios.

---

## Umbrales consolidados

| Pilar | Métrica | Umbral | Consecuencia de falla |
|---|---|---|---|
| Módulo ML | R² por dimensión | > 0.20 | Dimensión `low_confidence`, no incluida en cuantitativo |
| Módulo ML | r por dimensión | > 0.30 | Dimensión `low_confidence` |
| Tests CI | Vitest unit | 100% passing | Bloquea merge |
| Tests CI | Playwright E2E | passing | Bloquea merge |
| Tests CI | axe-core a11y | sin violaciones críticas/serias | Bloquea merge |
| Crisis pipeline | recall | ≥ 0.95 | Iterar lexicon/classifier; bloquea release |
| Crisis pipeline | precision | ≥ 0.85 | Iterar lexicon/classifier |
| SUS (TP3/TP4) | n participantes | ≥ 8 | Reportar n efectivo + apoyarse en otros pilares |
| SUS (TP3/TP4) | promedio | reportado contra mediana histórica | Discusión en capítulo 11 |

---

## Gestión de datos

### Datasets ML (`ml/data/`)
- **Essays** — acceso académico, no committed por licencia, versionado
  vía DVC remote local.
- **Corpus latinoamericano propio** — committed en `ml/data/latinoamericano/cases.csv`.
- **Splits 80/10/10** — generados deterministicamente por
  `prepare_data.py` con `SEED=42`.

### Artefactos ML
- `ml/models/*.joblib` — committed (artefactos pequeños).
- `ml/mlruns/` — local, **no** committed.
- `ml/eval_metrics.json` — committed.

### Materiales SUS
- Consentimientos firmados — carpeta privada fuera del repo.
- Grabaciones — carpeta privada fuera del repo. Retención 7 años;
  borrado posterior.
- Transcripciones anonimizadas — committeables en `docs/research/transcripts/`
  (sin grabaciones, sin nombres).
- Scores SUS — committeable en `docs/research/sus-results.csv` (P1-P15).

---

## Reproducibilidad

El experimento ML completo es reproducible desde cero por cualquier
revisor con acceso a Python 3.11+ y a los datasets:

```bash
git clone <repo>
cd umbra/ml
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
dvc pull            # baja datasets versionados
make all            # corre prepare_data → baseline → train → evaluate
cat eval_metrics.json
```

Los artefactos serializados (joblib) committeados al repo permiten
inferencia sin re-entrenamiento.

---

## Referencias

- Brooke, J. (1996). SUS: A quick and dirty usability scale. En
  *Usability evaluation in industry*. Taylor & Francis.
- Calvo, R. A., & Peters, D. (2014). *Positive Computing*. MIT Press.
- Goldberg, L. R. (1999). A broad-bandwidth, public domain,
  personality inventory. *Personality Psychology in Europe*, Vol. 7.
- Hoerl, A. E., & Kennard, R. W. (1970). Ridge regression.
- Howard, J., & Ruder, S. (2018). Universal Language Model Fine-tuning.
- Jung, C. G. (1921). *Tipos psicológicos*.
- Pearson, C. S. (1991). *Awakening the heroes within*.
- Pedregosa, F., et al. (2011). Scikit-learn.
- Pennebaker, J. W., & King, L. A. (1999). Linguistic styles.
- Peters, M. E., et al. (2019). To tune or not to tune?
- Sanh, V., et al. (2019). DistilBERT.
- Treveil, M., et al. (2020). *Introducing MLOps*.
- Wolf, T., et al. (2020). Transformers.
- Zaharia, M., et al. (2018). MLflow.
- [ADR-026](../DECISIONS.md) — módulo analítico propio.
- [ADR-027](../DECISIONS.md) — umbrales por dimensión.
- [ADR-028](../DECISIONS.md) — corpus latinoamericano.
- [ETHICS.md](ETHICS.md), [LEGAL.md](LEGAL.md), [TFG.md](TFG.md),
  [CHAT_SAFETY.md](../tech/CHAT_SAFETY.md).
