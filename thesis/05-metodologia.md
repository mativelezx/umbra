# Metodología

<!-- FUENTE PRIMARIA: docs/biz/VALIDATION.md, docs/biz/TFG.md, ADRs
     026 (módulo analítico), 027 (umbrales por dimensión), 028 (corpus
     latinoamericano). -->

## 1. Introducción

Este capítulo describe el diseño metodológico del TFG. El proyecto
adopta una estrategia de validación multi-pilar coherente con la
naturaleza del artefacto, que combina un componente cuantitativo
medido por un módulo analítico propio y una capa narrativa
interpretativa delegada a un proveedor externo de IA generativa. Los
cuatro pilares de validación son: (i) métricas de regresión por
dimensión Big Five (MSE, R², r) sobre el split test del corpus
combinado de entrenamiento; (ii) tests automatizados (Vitest unit,
Playwright E2E, axe-core a11y) integrados al CI; (iii) evaluación del
clasificador de crisis sobre dataset etiquetado balanceado de cien
casos; (iv) System Usability Scale (Brooke 1996) adaptado al español
latinoamericano sobre n=8-15 participantes en TP3/TP4.

El plan completo de pilares, instrumentos, datasets y umbrales está
en `docs/biz/VALIDATION.md`. Este capítulo presenta la metodología
en formato narrativo académico, sin duplicar el nivel de detalle
operacional.

## 2. Marco metodológico de gestión

El proceso de desarrollo sigue Scrum (Schwaber & Sutherland 2020) con
sprints de una semana calendario y el equipo unipersonal en los
roles combinados de Product Owner, Scrum Master y Developer,
supervisado por la dirección del TFG. Los artefactos son el Product
Backlog versionado en Markdown, un Sprint Backlog operacional por
semana, y el Incremento como código mergeado a la rama principal con
sus tests, documentación, y ADRs (Nygard 2011) actualizadas. La
*Definition of Done* incluye: código en main, tests actualizados,
documentación y ADR cuando aplica, accesibilidad axe verificada en
CI, y cumplimiento normativo Ley 25.326 cuando se tocan rutas
sensibles.

## 3. Arquitectura híbrida medido vs interpretativo

La decisión arquitectónica central, formalizada en ADR-026 + ADR-002
+ ADR-007, separa el sistema en dos capas con responsabilidades
disjuntas:

1. **Capa analítica propia** (`ml/`) — infiere las cinco dimensiones
   Big Five con DistilBERT base multilingual cased (Sanh et al. 2019)
   en modo *frozen embeddings* (Howard & Ruder 2018; Peters et al.
   2019) y cinco regresores Ridge (Hoerl & Kennard 1970) entrenados
   con scikit-learn (Pedregosa et al. 2011). Servida como API HTTP
   por FastAPI. Versionado con DVC, tracking en MLflow (Zaharia et al.
   2018).
2. **Capa narrativa** — delega a un proveedor externo de IA
   generativa con identificador de modelo fijado (ADR-005) la lectura
   interpretativa: ocho funciones cognitivas Jung (1921, ADR-002),
   arquetipo Pearson (1991, ADR-007), retrato escrito, plan de
   desarrollo y chat contextualizado. La capa narrativa **no** infiere
   Big Five; recibe los valores medidos por el módulo analítico junto
   con `per_dimension_status` (ADR-027) y modera su interpretación.

Esta separación es metodológicamente importante: las dimensiones
Big Five admiten métricas de regresión reportables y reproducibles;
la lectura Jung y la asignación de arquetipo son interpretaciones
heurísticas que se documentan como tales y que no se evalúan con
métricas de regresión.

## 4. Pilar 1 — Métricas del módulo analítico

### 4.1 Pipeline reproducible

El pipeline del módulo analítico se ejecuta con `make all` o, de
manera equivalente, `dvc repro`. Las etapas son: (1) `prepare_data.py`
descarga, normaliza y particiona los corpus 80/10/10 con
`SEED=42`; (2) `extract_embeddings.py` carga DistilBERT congelado y
extrae el vector CLS para cada texto; (3) `train_ridge.py` entrena
los cinco regresores Ridge con `GridSearchCV` para tunear `alpha` por
dimensión, registra el experimento en MLflow y serializa el regresor
final en `ml/models/*.joblib`; (4) `evaluate.py` calcula MSE, R² y r
de Pearson por dimensión sobre el split test, separados en tres
bloques (`english_only`, `latinoamericano_only`, `combined`), y
escribe el resultado consolidado en `ml/eval_metrics.json`. El
artefacto serializado y `eval_metrics.json` se commitean al repo.

### 4.2 Datasets

El corpus combinado de entrenamiento tiene dos componentes: Essays
(Pennebaker & King 1999, ~2500 textos breves de estudiantes
universitarios estadounidenses con Big Five etiquetado) y un corpus
latinoamericano propio inicial (n=20, voseo argentino, ADR-028)
construido con asistencia de IA generativa y validado manualmente
contra una rúbrica documentada en
`ml/data/latinoamericano/rubrica_validacion.md`. La rúbrica cubre
claridad de marcadores lingüísticos asociados a la dimensión target
(Pennebaker & King 1999), naturalidad del voseo, ausencia de jerga
clínica, longitud apropiada y diversidad temática. Por su tamaño, este
corpus local se usa como validación cualitativa y señal de transferencia,
no como prueba estadística fuerte; la ampliación recomendada para las
siguientes iteraciones es n≥300 con consentimiento e IPIP/BFI breve.
Ambos corpus se
versionan con DVC.

### 4.3 Umbrales mínimos

Por dimensión Big Five, **R² > 0.20** y **r > 0.30** (ADR-027). Las
dimensiones que no alcancen ambos umbrales sobre el split test del
bloque `latinoamericano_only` se marcan `per_dimension_status:
"low_confidence"` y se excluyen del componente cuantitativo
visible al usuario. La capa narrativa modera la lectura
interpretativa correspondiente.

### 4.4 CI gate

GitHub Actions ejecuta el pipeline ML en cada PR que toque `ml/`
(`.github/workflows/ml-validate.yml`). Si las métricas del bloque
`latinoamericano_only` no cumplen R² > 0.20 y r > 0.30 en al menos
tres de las cinco dimensiones, el workflow falla y el merge queda
bloqueado.

## 5. Pilar 2 — Tests automatizados

### 5.1 Vitest unit
- `lib/chat/pipeline.test.ts` — pipeline regex + clasificador.
- `lib/knowledge/build-block.test.ts` — helper de bloques.
- `lib/knowledge/citation-check.test.ts` — verifica que cada item
  de KB tenga el comentario JSDoc completo (ADR-018).
- `lib/supabase/rls-coverage.test.ts` — verifica RLS y políticas
  sobre cada tabla pública creada por las migrations.
- Tests de prompts en `lib/prompts/*.test.ts`.

### 5.2 Playwright E2E
- `e2e/full-flow.spec.ts` cubre register → consent → onboarding
  → analyze → dashboard → narrativa → plan.
- `e2e/chatgpt-seed-flow.spec.ts` cubre el flujo de seed externo.
- `e2e/qa-screenshots.spec.ts` produce capturas de las superficies
  clave para anexos.
- `e2e/a11y.spec.ts` ejecuta axe-core sobre las páginas
  principales.

### 5.3 axe-core en CI

`@axe-core/playwright` está integrado al workflow de CI. Las
violaciones críticas o serias bloquean el merge.

## 6. Pilar 3 — Evaluación del clasificador de crisis

### 6.1 Objetivo

Asegurar que el pipeline de detección de crisis (regex
`crisis-lexicon.ts` + clasificador de la capa narrativa con
semántica fail-closed) opera dentro de umbrales aceptables sobre
una superficie sensible.

### 6.2 Dataset

`lib/evals/crisis-dataset.ts` contiene 100 casos sintéticos
balanceados (sin información personalmente identificable,
parafraseados y desprovistos de detalle operacional sobre métodos
de autolesión, conforme a las líneas rojas declaradas en
`docs/biz/ETHICS.md`): 25 crisis reales, 25 idioms argentinos
negativos, 25 borderline ambiguos y 25 mensajes seguros. El draft
inicial se generó con asistencia IA y queda pendiente la revisión
por persona con criterio clínico apropiado.

### 6.3 Umbrales operativos

`recall ≥ 0.95` (prioridad alta — los falsos negativos son
éticamente más costosos en una superficie de salud mental) y
`precision ≥ 0.85`.

### 6.4 Runner y test gate

`lib/evals/crisis-eval.ts` ejecuta el pipeline contra cada caso y
computa la matriz de confusión, precision, recall, F1 y false
negative rate, con desglose por categoría. El test
`lib/evals/crisis-eval.test.ts` falla en CI si el recall cae por
debajo del umbral sobre la corrida controlada.

## 7. Pilar 4 — System Usability Scale (TP3/TP4)

### 7.1 Diseño

Sesiones individuales presenciales o por videollamada de
aproximadamente 40 minutos, con n=8-15 participantes (rango
planteado por TP1) reclutados por la red de contactos del autor
(compañeros de Siglo 21, conocidos del área de tecnología y
humanidades), sin compensación económica. El estudio es de tipo
usability testing, no investigación clínica.

### 7.2 Procedimiento

El protocolo (`docs/research/usability-protocol.md`) prevé los
siguientes bloques: bienvenida y consentimiento (5 min); permiso
explícito de grabación de pantalla y audio (2 min); instrucciones
de pensamiento en voz alta (3 min); tarea principal de completar
el onboarding y leer el retrato (17 min); exploración libre del
dashboard (3 min); cuestionario SUS de 10 ítems escala 1-5 (3
min); preguntas abiertas sobre sorpresa, incomodidad y cambios
sugeridos, con una pregunta específica sobre la naturalidad del
español latinoamericano (3 min); cierre y agradecimiento (2 min).

### 7.3 Instrumento SUS

System Usability Scale (Brooke 1996) adaptado al español
latinoamericano. Los 10 ítems usan voseo argentino y se
encuentran en `docs/research/sus-spanish-latinoamericano.md`. El
scoring sigue la fórmula clásica: ítems impares puntúan
`score - 1`, ítems pares puntúan `5 - score`; la suma multiplicada
por 2.5 da el score final en rango 0-100.

### 7.4 Análisis

El análisis cuantitativo reporta el promedio del SUS sobre los
participantes completados, su desviación estándar y la comparación
con la mediana histórica del instrumento. El análisis cualitativo
aplica codificación temática inductiva sobre las transcripciones
anonimizadas y las respuestas a preguntas abiertas, identificando
3-5 temas con 2-3 citas verbatim por tema (anonimizadas como P1,
P2, etc.).

### 7.5 Plan de contingencia

Si el reclutamiento no alcanza n=8 dentro del calendario de
TP3/TP4, se reporta honestamente el n efectivo y la validación se
apoya principalmente en los pilares cuantitativos restantes
(métricas del módulo analítico, tests automatizados y evaluación
del clasificador de crisis), que son independientes del n de
usuarios.

## 8. Ética de la investigación

El estudio SUS adopta los principios de la Declaración de Helsinki
para investigación con sujetos humanos, adaptados al contexto de
usabilidad informal de software. Los principios están documentados
en `docs/biz/ETHICS.md` e incluyen beneficencia (el producto debe
ser diseñado para beneficio del usuario), no maleficencia
(protocolos de escalamiento claros si surge malestar emocional),
autonomía (consentimiento informado explícito, derecho a retirarse
en cualquier momento) y justicia (acceso gratuito al producto
durante el estudio).

Los principios del marco Positive Computing (Calvo & Peters 2014)
operan como una capa adicional de revisión ética orientada al
diseño: cada decisión técnica o de interfaz se evalúa contra los
ocho factores operativos del marco (autonomía, competencia,
relación, atención plena, emoción positiva, engagement,
resiliencia y autocompasión).

El cumplimiento con la Ley 25.326 argentina de protección de datos
personales se aborda con cinco mecanismos técnicos documentados en
`docs/biz/LEGAL.md`: (1) consentimiento informado bloqueante con
SHA-256 del texto verbatim (ADR-024), (2) exportación integral de
datos, (3) rectificación, (4) cancelación con magic link
single-use, (5) oposición al tratamiento con fines de investigación.

## 9. Reproducibilidad

El experimento del módulo analítico es reproducible externamente
por cualquier revisor con Python 3.11+, los datasets versionados
con DVC y los artefactos serializados commiteados en `ml/models/`.
El procedimiento de reproducción es:

```bash
git clone <repo>
cd umbra/ml
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
dvc pull
make all
cat eval_metrics.json
```

La tesis cita el commit hash del repositorio correspondiente al
estado del código y de los datasets en el momento de cada corrida
de métricas.
