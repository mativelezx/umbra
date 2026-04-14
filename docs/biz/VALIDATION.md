# Umbra — Plan de Validación TFG

> Documento maestro de la sección de Validación de la tesis. Define
> hipótesis, instrumentos, protocolos, datasets, umbrales de aceptación y
> análisis. Es la fuente primaria del capítulo "Metodología" y "Validación"
> del TFG.
>
> **Decisión adoptada**: Branch B (computacional) + M3 (think-aloud n=8-10).
> Ver [DECISIONS.md ADR-023](../DECISIONS.md) y [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Resumen ejecutivo

Umbra valida su aporte ingenieril con una metodología mixed-methods de dos pilares:

1. **Pilar computacional (primary evidence)** — tres hipótesis preregistradas
   en OSF que miden propiedades del sistema sin requerir sujetos humanos:
   - **H1** — Determinismo del análisis a `temperature=0` con modelo pinned
   - **H2** — Robustez a paráfrasis semánticamente preservantes
   - **H3** — Precision y recall del pipeline de detección de crisis
2. **Pilar con usuarios (secondary evidence)** — estudio think-aloud M3 con
   reclutamiento controlado de 8-10 participantes para capturar usabilidad
   percibida (SUS en español) y fricciones reales mediante coding temático.

La decisión de no adoptar M1 (estudio formal n≥30) o M2 (opt-in dependiente
de tráfico) se fundamenta en ADR-023: control total sobre variables, cero
dependencia de tráfico externo, plan B documentado, regla de Nielsen (1993)
que justifica n=5 como suficiente para detectar ~85% de problemas de
usabilidad.

## Preguntas de investigación

**RQ1** — ¿Puede un LLM con una base de conocimiento estructurada desde
fuentes primarias producir perfiles de personalidad consistentes a partir
de texto introspectivo?
→ Operacionalizado como **H1** (determinismo).

**RQ2** — ¿Qué tan robusto es el análisis frente a paráfrasis
semánticamente preservantes?
→ Operacionalizado como **H2** (robustez a paráfrasis, intra-vendor por
ADR-020).

**RQ3** — ¿Es el pipeline de detección de crisis lo suficientemente
preciso y sensible para ser éticamente defensible en un producto de
autoconocimiento?
→ Operacionalizado como **H3** (precision/recall del crisis classifier).

**RQ4** — ¿Es Umbra percibido como usable y alineado con autonomía y
competencia (Positive Computing) por usuarios reales?
→ Operacionalizado como **M3** (think-aloud + SUS + coding temático).

---

## H1 — Determinismo del análisis

### Hipótesis
Dado `temperature=0` y modelo SKU fijado (`claude-sonnet-4-6-20260301` por
ADR-014), analizar el mismo texto introspectivo produce scores de Big Five
con **desviación estándar < 2.5 puntos** (equivalente a un rango < 5 puntos)
a lo largo de 5 corridas consecutivas, sobre los 50 casos del eval suite.

### Diseño
- **Tipo**: estudio computacional observacional, sin manipulación.
- **Instrumento**: Claude Sonnet 4.6 pinned SKU actuando como instrumento
  estocástico. Eval cases son estímulos fijos.
- **Temperatura**: 0.
- **Prompt**: pinned al commit hash `<hash>` de `lib/prompts/analyze-profile.ts`.
- **Base de conocimiento**: pinned al commit hash de `lib/knowledge/`.
- **Ejecución**: 5 corridas por caso × 50 casos = 250 análisis totales.

### Muestra (eval cases)
- **n=50** casos distribuidos así:
  - **20 casos IPIP-NEO** adaptados de viñetas públicas (Goldberg 1999, ADR-015).
  - **20 casos Jung** adaptados de *Tipos Psicológicos* (Jung 1921, dominio público).
  - **10 casos adversariales** sintetizados por el autor para probar edge cases
    (tonos ambivalentes, contradicciones, narrativas breves).
- **Inter-rater check**: 10 de los 50 casos son etiquetados por 2 raters
  (autor + external). Cohen's kappa > 0.6 requerido antes de fijar el rango
  de casos.
- **Sample size justification**: 50 casos × 5 big five × 8 funciones Jung =
  3250 mediciones totales por corrida. Suficiente para detectar
  desviaciones > 5 puntos con poder estadístico alto.
- **Sin sujetos humanos**: toda la data es computacionalmente generada.

### Variables
- **Variables medidas por caso**: scores Big Five (5 × 0-100), funciones
  Jung (8 × 0-100), arquetipo asignado (categórico, 6 niveles).
- **Derivada para H1**: desviación estándar de cada dimensión a lo largo de
  las 5 corridas.

### Plan de análisis
- **Pass criterion**: `stddev(scores_per_run) < 2.5` para TODAS las
  dimensiones en TODOS los 50 casos.
- **Partial pass**: si el all-or-nothing falla, se reportan umbrales por
  dimensión. La tesis declara ambos.
- **Criterio de exclusión**: casos donde Claude rechace producir JSON
  válido (manejado con retry; si 2 retries fallan, el caso se excluye y se
  reporta).
- **Reproducibilidad**: committed cache snapshot en
  `lib/evals/.cache/snapshot-YYYYMMDD-<model>.json` permite replay offline
  a costo 0 (ADR-014).

### Código y datos
- Runner: `lib/evals/consistency.ts` (a escribir en Fase 5 — audit confirmó
  que `lib/evals/` no existe).
- Cases: `lib/evals/cases.ts`.
- Cache: `lib/evals/.cache/snapshot-YYYYMMDD-<model>.json` (committed por ADR-014).
- Resultados: `eval-results/H1-YYYYMMDD.json`.
- Script npm: `npm run eval:h1`.

---

## H2 — Robustez a paráfrasis semánticamente preservantes

### Hipótesis
Dadas 3 paráfrasis semánticamente preservantes producidas por Claude Sonnet
y Claude Haiku como rewriters (intra-vendor por ADR-020), los scores Big
Five del texto parafraseado desvían **< 10 puntos** (máximo delta pairwise)
respecto al original, sobre los 50 casos del eval suite.

### Diseño
- **Rewriters**: Claude Sonnet 4.6 pinned SKU + Claude Haiku 4.5 pinned SKU.
- **Temperatura del rewriter**: 0.3 (permite creatividad léxica sin cambiar
  semántica).
- **Temperatura del analyzer**: 0 (para aislar varianza del rewriter, no
  del analyzer).
- **Ejecución**: 50 casos × 3 paráfrasis × 2 analizadas (original + para) =
  300+ análisis.

### Muestra
- Los mismos 50 casos de H1.
- 3 paráfrasis por caso: 1 de Sonnet, 1 de Haiku, 1 híbrida (instruida a
  "reformular manteniendo el significado y cambiando 60% del léxico").

### Plan de análisis
- **Pass criterion**: `max_pairwise_delta < 10` para TODAS las dimensiones
  en TODOS los 50 casos.
- **Partial pass**: reportar por dimensión si el all-or-nothing falla.
- **Limitación documentada**: H2 es intra-vendor (Sonnet + Haiku), no
  cross-vendor. Ver ADR-020. Esto se declara explícitamente en la tesis
  como limitación metodológica; un test cross-vendor (GPT-4, Llama) queda
  como trabajo futuro.

### Código y datos
- Runner: `lib/evals/cross-model-paraphrase.ts` (a escribir en Fase 5).
- Resultados: `eval-results/H2-YYYYMMDD.json`.
- Script npm: `npm run eval:h2`.

---

## H3 — Precision y recall del pipeline de crisis

### Hipótesis
El pipeline de detección de crisis de 2 etapas (regex con idioms argentinos
→ Claude classifier fail-closed) alcanza **recall ≥ 0.95** y
**precision ≥ 0.85** sobre un dataset etiquetado de n=100 mensajes
distribuidos en 4 categorías balanceadas: crisis real, idiom argentino,
borderline, y safe.

### Diseño
- **Tipo**: evaluación de clasificador binario (is_crisis true/false) con
  severidad secundaria (low/med/high).
- **Instrumento bajo prueba**: [lib/chat/pipeline.ts](../../lib/chat/pipeline.ts)
  (crisis lexicon + Claude classifier). El pipeline actual tiene tests
  unitarios en [lib/chat/pipeline.test.ts](../../lib/chat/pipeline.test.ts)
  pero no mediciones agregadas sobre dataset etiquetado.
- **Ejecución**: 100 casos × 1 corrida del pipeline. Se computan matriz de
  confusión, precision, recall, F1 y false negative rate (el más crítico
  para safety).

### Muestra (dataset de crisis)
- **n=100** casos estructurados así:
  - **25 crisis reales** (parafraseados por el autor para no usar PII de
    nadie) cubriendo: ideación suicida explícita, autolesión activa,
    psicosis activa, consumo con riesgo vital, desesperanza sistémica con
    planes concretos.
  - **25 idioms argentinos** negativos que NO son crisis ("me quiero matar
    estudiando", "esto me mata", "morí de risa", "te re cagás"). Base:
    los 16 idioms en [lib/chat/crisis-lexicon.ts](../../lib/chat/crisis-lexicon.ts)
    + 9 adicionales.
  - **25 borderline** (ambiguos) — mensajes que un clasificador razonable
    podría etiquetar diferente. Fuerza al pipeline a decidir bajo
    incertidumbre.
  - **25 safe** — mensajes positivos, neutros, o tristes pero sin crisis.
- **Etiquetado**: draft inicial por el autor (Fase 4 T4.1). **Revisión por
  segundo par de ojos obligatoria** antes de correr eval (T4.0) —
  idealmente director/a o psicólogo de confianza.

### Variables
- **Predicha**: `is_crisis` ∈ {true, false} del pipeline.
- **Verdadera**: etiqueta humana del dataset.
- **Derivadas**: true positives, false positives, true negatives, false
  negatives, precision (TP / (TP+FP)), recall (TP / (TP+FN)), F1
  (2·P·R / (P+R)), false negative rate (FN / (FN+TP)).

### Plan de análisis
- **Pass criterion**: `recall >= 0.95 AND precision >= 0.85`.
- **Recall tiene prioridad sobre precision**: en safety, un falso negativo
  (no detectar una crisis real) es mucho más costoso que un falso positivo
  (bloquear una conversación que no era crisis). Por esto el umbral de
  recall es más alto.
- **Si falla**: iterar el prompt del classifier o expandir el lexicon,
  **documentar las iteraciones**, y re-correr. Registrar todas las
  iteraciones en VALIDATION.md para transparencia metodológica.
- **Test automatizado en CI**: `lib/evals/crisis-eval.test.ts` debe fallar
  si recall cae por debajo de 0.95 en futuro, evitando regresiones silentes.

### Código y datos
- Dataset: `lib/evals/crisis-dataset.ts` (Fase 4 T4.1).
- Runner: `lib/evals/crisis-eval.ts` (Fase 4 T4.2).
- Test automatizado: `lib/evals/crisis-eval.test.ts` (Fase 4 T4.3).
- Resultados: `eval-results/crisis-YYYYMMDD.json` (Fase 4 T4.4).

### Linked to
- [CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) — documentación del pipeline.
- [ADR-008](../DECISIONS.md) — observability de `crisis_events` via HMAC.
- [ETHICS.md](ETHICS.md) — línea roja #7-9 sobre claims clínicos y crisis.

---

## M3 — Think-aloud con reclutamiento controlado (secondary validation)

### Hipótesis/pregunta blanda
Umbra es percibido como usable y satisface dimensiones de autonomía y
competencia del Positive Computing (Calvo & Peters 2014) por usuarios
reales de perfil similar al target (estudiantes universitarios argentinos,
18-30 años, interesados en autoconocimiento). **Umbral de aceptación**:
SUS promedio ≥ 68 (baseline de usabilidad estándar según Sauro 2011).

### Diseño
- **Tipo**: estudio cualitativo mixed-methods. Pensamiento en voz alta
  (think-aloud) en sesión individual, seguido de cuestionario SUS y
  preguntas abiertas.
- **Modalidad**: M3 del research de modalidades (ver ADR-023). Reclutamiento
  controlado de amigos/compañeros; sin comité de ética formal (usability
  testing informal con consentimiento escrito simple).
- **Sin grupo control**: estudio descriptivo, no comparativo.
- **Fundamentación de n bajo**: Nielsen & Landauer (1993) demostraron que
  n=5 participantes detectan ~85% de los problemas de usabilidad de una
  interfaz; n=8-10 detectan ~95%. El TFG adopta n=8 como mínimo aceptable
  y n=10 como target.

### Reclutamiento
- **Población**: amigos y compañeros del autor (estudiantes Siglo 21 y
  contactos personales).
- **Criterios de inclusión**:
  - 18 años o más.
  - Español nativo o nivel alto (Umbra es rioplatense).
  - Acceso a navegador desktop o móvil con conexión estable.
  - Dispuesto a compartir pantalla y grabar audio en una videollamada de
    40 min.
- **Criterios de exclusión**:
  - Exposición previa al desarrollo de Umbra (beta testers, ayudantes de
    código).
  - Antecedentes psiquiátricos activos declarados (por precaución ética, no
    por prejuicio — el usuario puede decidir participar pero se recomienda
    consulta previa con profesional).
- **Tamaño objetivo**: 10 participantes.
- **Mínimo aceptable**: 8 participantes (plan B activado si <8).
- **Plan B**: si dos semanas después del kick-off hay <8 confirmaciones,
  se extiende una semana; si igual hay <8, se reporta honestamente el n
  alcanzado y la tesis se apoya más en H1/H2/H3. No se oculta el déficit.

### Consentimiento informado
- **Formato**: PDF imprimible o firmable digitalmente.
- **Contenido**: (1) propósito del estudio, (2) voluntariedad + derecho a
  retirar, (3) grabación pantalla + audio con permiso explícito, (4) uso
  de datos (transcripciones anonimizadas en la tesis, nombres no
  revelados), (5) retención (7 años post-TFG, luego borrado), (6) riesgo
  mínimo (es think-aloud de un producto web, no intervención clínica),
  (7) qué hacer si surge malestar emocional (pausar, escalar al autor,
  líneas de ayuda de salud mental argentinas incluidas en el consentimiento).
- **Archivado**: consentimientos firmados escaneados a carpeta privada,
  no committed al repo.
- **Fundamento legal**: Ley 25.326 art. 6 y art. 7 (consentimiento informado
  para datos personales). El texto del consentimiento se mantiene en
  `content/consent/research-m3-v1-es-AR.md` (versionado, igual que el
  consentimiento del producto — ADR-024).

### Protocolo de sesión (40 min)

| Minuto | Actividad |
|---|---|
| 0-3 | Bienvenida, agradecimiento, saludo informal |
| 3-5 | Repaso del consentimiento, confirmar que firmó, preguntar dudas |
| 5-7 | Pedir permiso explícito para grabar pantalla y audio. Iniciar grabación OBS |
| 7-10 | Introducción al estudio (sin explicar qué es Umbra) + instrucciones de think-aloud: "pensá en voz alta, decí todo lo que te pase por la cabeza, no hay respuestas correctas ni incorrectas" |
| 10-13 | Usuario abre la URL de Umbra (dev local con ngrok o local en pantalla compartida) |
| 13-30 | **Tarea principal**: completar el onboarding hasta recibir el perfil. El autor observa, toma notas, no interrumpe excepto para recordar "pensá en voz alta" si el usuario se queda en silencio >30s |
| 30-33 | Usuario explora el dashboard libremente |
| 33-36 | **SUS en español** (10 ítems, escala 1-5). Aplicado verbalmente o via Google Form |
| 36-39 | **Preguntas abiertas**: (1) ¿qué te sorprendió?, (2) ¿qué te incomodó?, (3) ¿qué cambiarías? |
| 39-40 | Cierre, agradecimiento, preguntas del participante, cerrar grabación |

### Instrumento cuantitativo: SUS en español

**System Usability Scale** (Brooke 1996), traducido al español rioplatense.
10 ítems, escala 1-5 (Muy en desacuerdo → Muy de acuerdo). Scoring:
- Ítems impares (1,3,5,7,9): `score - 1`
- Ítems pares (2,4,6,8,10): `5 - score`
- Suma total × 2.5 = SUS score final (rango 0-100)

Los 10 ítems (propuesta en español rioplatense, a validar con director/a):

1. Creo que me gustaría usar Umbra con frecuencia.
2. Encontré a Umbra innecesariamente complejo.
3. Pensé que Umbra era fácil de usar.
4. Creo que necesitaría ayuda técnica para poder usar Umbra.
5. Las funciones de Umbra estaban bien integradas entre sí.
6. Me pareció que había mucha inconsistencia en Umbra.
7. Imagino que la mayoría de la gente aprendería a usar Umbra muy rápido.
8. Encontré a Umbra muy incómodo de usar.
9. Me sentí muy seguro usando Umbra.
10. Necesité aprender muchas cosas antes de poder empezar a usar Umbra.

### Análisis cuantitativo (SUS)
- **Score promedio** de los n participantes.
- **Desviación estándar**.
- **Percentil benchmark** contra Sauro (2011): SUS > 68 = por encima del
  promedio de usabilidad; SUS > 80 = excelente.
- **Reporte en tesis**: tabla con score individual anonimizado + promedio +
  stddev + benchmark.

### Instrumento cualitativo: coding temático

**Método**: análisis temático inductivo (Braun & Clarke 2006) sobre las
transcripciones de las sesiones think-aloud y las respuestas a preguntas
abiertas.

**Pasos**:
1. **Transcripción** literal de grabaciones (con ayuda de Whisper si es
   necesario, revisión manual obligatoria).
2. **Anonimización**: reemplazar nombres propios por "P1", "P2"... "P10".
3. **Lectura inmersiva** de todas las transcripciones (primera pasada sin
   coding).
4. **Open coding**: etiquetar frases y momentos relevantes con códigos
   descriptivos.
5. **Agrupación en temas**: consolidar códigos en 3-7 temas recurrentes.
6. **Revisión**: releer buscando desconfirming evidence.
7. **Reporte**: cada tema se presenta con definición + 2-3 citas textuales
   anonimizadas.

**Temas esperados** (a confirmar con la data, no hardcoded):
- Percepción de profundidad vs superficialidad del análisis.
- Momentos de sorpresa / insight genuino.
- Fricciones en el onboarding (dónde se frustran).
- Dudas sobre "¿es esto acertado sobre mí?".
- Reacciones al lenguaje no clínico / evitación del diagnóstico.

### Código y datos
- Guión de sesión: `docs/research/M3-session-protocol.md` (Fase 4.5 T4.5.B).
- Consentimiento: `content/consent/research-m3-v1-es-AR.md` (Fase 4.5 T4.5.C).
- Grabaciones: carpeta privada fuera del repo (`~/umbra-m3-recordings/`).
- Transcripciones anonimizadas: `docs/research/transcripts/P{1..10}.md`.
- Scores SUS: `docs/research/sus-results.csv`.
- Análisis: script Python en `scripts/analyze-sus.py` (Fase 4.5 T4.5.H).

### Ética (M3)
- **Riesgo**: mínimo. Think-aloud de un producto web consumer.
- **Beneficio para participante**: acceso gratuito a Umbra, su propio
  perfil, y una conversación relajada.
- **Autonomía**: puede retirar en cualquier momento, borrar grabación a
  pedido.
- **Confidencialidad**: transcripciones anonimizadas; grabaciones nunca
  publicadas; nombres solo conocidos por el autor.
- **Conflict of interest**: el autor es investigador, desarrollador y
  amigo/compañero de los participantes. Se declara en el consentimiento y
  en la tesis (ver ETHICS.md "Conflict of interest disclosure").
- **Crisis protocol**: si durante una sesión el participante muestra
  malestar significativo, pausar, ofrecer parar la sesión, y entregar
  recursos de ayuda (línea 135 Argentina, Salud Mental Responde).

---

## Preregistro OSF (Standard Prereg)

Ver [TFG.md sección Preregistration](TFG.md#preregistration-osf-standard-prereg)
para la plantilla completa. Notas para la submisión final:

- **Hipótesis a incluir**: H1, H2, H3. M3 NO se preregistra en OSF — es
  validación secundaria cualitativa y OSF está diseñado para hipótesis
  cuantitativas confirmatorias.
- **Timing**: enviar a OSF **ANTES** de correr H1/H2/H3 por primera vez.
  Este es el momento epistémicamente crítico.
- **Advisor review**: director/a revisa la plantilla completa antes del
  submit. Es el último checkpoint antes de "congelar" la metodología.
- **Link al submit**: se guarda en TFG.md y README.md una vez obtenido.

---

## Gestión de datos

### Computacional (H1/H2/H3)
- **Eval cases**: en repo (`lib/evals/cases.ts`, `lib/evals/crisis-dataset.ts`).
- **Snapshots**: committed en `lib/evals/.cache/` por ADR-014.
- **Resultados**: committed en `eval-results/` como JSON.
- **Reproducibilidad**: cualquier reviewer clona el repo y corre
  `npm run eval -- --from-cache`.

### M3 con usuarios
- **Consentimientos firmados**: carpeta privada no versionada.
- **Grabaciones**: carpeta privada no versionada. Retención 7 años, borrado
  automático después (scripted si es posible).
- **Transcripciones anonimizadas**: committed en `docs/research/transcripts/`
  (sin grabaciones, sin nombres). Safe to commit.
- **SUS scores**: committed en `docs/research/sus-results.csv` (solo P1-P10
  + scores).
- **Plan de borrado**: 7 años post-defensa → borrar carpeta privada
  completa. Se documenta en el consentimiento y en la tesis.

---

## Umbrales de aceptación consolidados

| Hipótesis / estudio | Métrica | Umbral | Consecuencia de falla |
|---|---|---|---|
| H1 Determinismo | stddev por dimensión × corrida × caso | < 2.5 | Reporte por dimensión; investigar si afecta RQ1 |
| H2 Robustez paráfrasis | max pairwise delta | < 10 | Reporte por dimensión; limitación declarada |
| H3 Recall crisis | TP / (TP+FN) | ≥ 0.95 | Iterar prompt + re-test; documentar iteraciones |
| H3 Precision crisis | TP / (TP+FP) | ≥ 0.85 | Iterar lexicon + re-test |
| M3 SUS score | promedio | ≥ 68 | Reportar déficit + razones en Discusión |
| M3 n participantes | count completados | ≥ 8 | Plan B: reportar honest + apoyarse en H1/H2/H3 |

---

## Timeline de validación

Ver [IMPLEMENTATION_PLAN.md timeline](IMPLEMENTATION_PLAN.md#timeline-estimado)
para el calendario completo. Síntesis de validación:

| Fase | Duración | Entregables |
|---|---|---|
| Fase 4 (H3) | 2-3 días | Dataset crisis, runner, resultados, tabla en CHAT_SAFETY.md |
| Fase 5 T5.1 (H1) | 2 días | cases.ts, consistency.ts, H1 results |
| Fase 5 T5.2 (H2) | 1 día | cross-model-paraphrase.ts, H2 results |
| Fase 5 T5.3 (OSF) | 1 día | Prereg submitido (vos) |
| Fase 4.5 (M3) | 2 semanas | n=8-10 sesiones, SUS, transcripts, análisis |

---

## Referencias

- Brooke, J. (1996). SUS: A quick and dirty usability scale. In *Usability evaluation in industry*.
- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77-101.
- Calvo, R. A., & Peters, D. (2014). *Positive Computing: Technology for Wellbeing and Human Potential*. MIT Press.
- Goldberg, L. R. (1999). A broad-bandwidth, public domain, personality inventory measuring the lower-level facets of several five-factor models. In I. Mervielde et al. (Eds.), *Personality Psychology in Europe*, Vol. 7.
- Jung, C. G. (1921). *Tipos Psicológicos*.
- Nielsen, J., & Landauer, T. K. (1993). A mathematical model of the finding of usability problems. *Proceedings of ACM INTERCHI 93*.
- Sauro, J. (2011). A Practical Guide to the System Usability Scale. Denver: Measuring Usability LLC.
- [ADR-011](../DECISIONS.md) — Eval hypotheses H1 + H2.
- [ADR-014](../DECISIONS.md) — Committed cache snapshots + pinned SKU.
- [ADR-020](../DECISIONS.md) — H2 intra-vendor rewriters.
- [ADR-023](../DECISIONS.md) — Validación mixed-methods Branch B + M3.
- [ETHICS.md](ETHICS.md) — Declaración de Helsinki + Calvo & Peters.
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — plan de ejecución.
- [CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) — pipeline de crisis (objeto de H3).
- [TFG.md](TFG.md) — estructura de tesis + preregistro OSF.
