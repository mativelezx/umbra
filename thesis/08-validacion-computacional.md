# Validación computacional

## 1. Introducción

Este capítulo presenta la validación computacional de Umbra como
evidencia primaria del aporte ingenieril del TFG, en coherencia con
la estrategia metodológica descrita en el capítulo 5. La validación
computacional se organiza en tres bloques complementarios: las
métricas de regresión por dimensión Big Five producidas por el
módulo analítico propio, los tests automatizados (unit, E2E y
accesibilidad) integrados al CI, y la evaluación del clasificador
de crisis sobre dataset etiquetado balanceado. Los tres bloques
operan sobre artefactos comprometidos al repositorio o sobre el
pipeline reproducible documentado en `ml/`.

La relevancia conjunta de estos tres bloques es complementaria. Las
métricas del módulo analítico abordan la calidad de la inferencia
cuantitativa por dimensión y delimitan honestamente qué puede
afirmarse sobre cada dimensión Big Five. Los tests automatizados
verifican integridad funcional, accesibilidad y propiedades de
seguridad transversales del frontend. La evaluación del clasificador
de crisis se sitúa en el plano ético-operacional, al verificar si
la superficie conversacional del sistema cumple condiciones mínimas
de seguridad para un producto de autoconocimiento que explícitamente
no se presenta como terapia. En consecuencia, este capítulo no
persigue demostrar validez clínica, sino documentar, con criterios
reproducibles, hasta qué punto el artefacto software se comporta
de manera estable, auditable y segura dentro de los límites
declarados por el proyecto.

## 2. Métricas del módulo analítico

### 2.1 Pipeline reproducible

El módulo analítico propio (`ml/`) infiere las cinco dimensiones
del modelo Big Five con la arquitectura documentada en ADR-026:
DistilBERT base multilingual cased (Sanh et al. 2019) en modo
*frozen embeddings* + cinco regresores Ridge multi-output (Hoerl
& Kennard 1970) entrenados con scikit-learn (Pedregosa et al.
2011). El pipeline se ejecuta deterministicamente con `make all`
o `dvc repro`. Las etapas son: preparación de datos (split 80/10/10
con seed fijo), extracción de embeddings, entrenamiento con
`GridSearchCV` para tunear `alpha` por dimensión, y evaluación
final sobre el split test. El experimento se registra en MLflow
y los regresores entrenados se serializan en `ml/models/*.joblib`.

### 2.2 Datasets

El corpus combinado tiene dos componentes documentados en
ADR-028: Essays (Pennebaker & King 1999) en inglés (~2500 textos
breves de estudiantes universitarios estadounidenses con Big Five
etiquetado) y un corpus latinoamericano propio inicial (n=20, voseo
argentino) construido con asistencia de IA generativa y validado
manualmente contra una rúbrica documentada en
`ml/data/latinoamericano/rubrica_validacion.md`. Ambos corpus se
versionan con DVC.

### 2.3 Métricas reportadas

Por cada una de las cinco dimensiones Big Five (apertura,
responsabilidad, extraversión, amabilidad, neuroticismo), tres
estadísticos clásicos de regresión: error cuadrático medio (MSE),
coeficiente de determinación (R²), y coeficiente de correlación
lineal r de Pearson. Las métricas se reportan en tres bloques:
`english_only`, `latinoamericano_only` y `combined`. El bloque
`latinoamericano_only` es el que sustenta la narrativa del TFG por
ser el idioma de uso real del producto.

### 2.4 Umbrales mínimos y `per_dimension_status`

Por cada dimensión, los umbrales mínimos conservadores
formalizados en ADR-027 son **R² > 0.20** y **r > 0.30**. Las
dimensiones que **no** alcancen ambos umbrales sobre el bloque
`latinoamericano_only` se marcan
`per_dimension_status: "low_confidence"` y se reportan
honestamente como "no incluidas en el componente cuantitativo del
perfil"; la capa narrativa recibe esta señal y modera
explícitamente su lectura interpretativa para esas dimensiones.
Las dimensiones que pasan ambos umbrales se marcan `"ok"`.

### 2.5 Tabla de resultados

> Espacio reservado para la tabla con valores numéricos de MSE, R²
> y r por dimensión sobre los tres bloques (`english_only`,
> `latinoamericano_only`, `combined`), una vez completado el
> Sprint ML 3 según el cronograma del TFG. La tabla incluirá la
> columna `per_dimension_status` indicando explícitamente qué
> dimensiones superan los umbrales y cuáles quedan como
> `low_confidence`.

### 2.6 CI gate

`.github/workflows/ml-validate.yml` ejecuta el pipeline ML en
cada PR que toque `ml/` y falla si el bloque
`latinoamericano_only` no cumple R² > 0.20 y r > 0.30 en al menos
tres de las cinco dimensiones. Esta verificación es parte del
criterio de aceptación de cada release del módulo analítico.

## 3. Tests automatizados

### 3.1 Unit tests con Vitest

La cobertura unitaria incluye, entre otros, la integridad del
pipeline de seguridad (`lib/chat/pipeline.test.ts`), el helper
de bloques de conocimiento (`lib/knowledge/build-block.test.ts`),
la verificación del comentario JSDoc obligatorio en cada item de
KB conforme a ADR-018 (`lib/knowledge/citation-check.test.ts`), y
la cobertura de Row Level Security sobre todas las tablas
públicas creadas por las migrations (`lib/supabase/rls-coverage.test.ts`).

### 3.2 Tests E2E con Playwright

Los tests E2E cubren el flujo completo de usuario:
`e2e/full-flow.spec.ts` para register → consent → onboarding →
analyze → dashboard → narrativa → plan;
`e2e/chatgpt-seed-flow.spec.ts` para el flujo de seed externo;
`e2e/qa-screenshots.spec.ts` para producir capturas de las
superficies clave; y `e2e/a11y.spec.ts` que ejecuta axe-core
sobre las páginas principales.

### 3.3 axe-core en CI

`@axe-core/playwright` está integrado al workflow de CI. Las
violaciones críticas o serias bloquean el merge. El reporte
detallado queda disponible en `playwright-report/`.

## 4. Evaluación del clasificador de crisis

La evaluación del clasificador de crisis es la componente más
crítica del bloque computacional desde una perspectiva ética. El
pipeline implementado en `lib/chat/pipeline.ts` combina una etapa
de patrones regulares con pre-filtro de idiomatismos argentinos
con una segunda etapa de clasificación delegada a la capa
narrativa con semántica fail-closed. La observabilidad usa HMAC
con peppers versionados (ADR-008) y retención acotada a 30 días
sin almacenar texto crudo en `crisis_events`.

### 4.1 Dataset

`lib/evals/crisis-dataset.ts` contiene 100 casos sintéticos
balanceados (sin información personalmente identificable):
25 `real_crisis`, 25 `idiom`, 25 `borderline` y 25 `safe`. Los
casos de crisis real fueron parafraseados y desprovistos de
detalle operacional sobre métodos de autolesión, conforme a las
líneas rojas declaradas en `docs/biz/ETHICS.md`. El draft inicial
del dataset fue generado con asistencia de IA y queda pendiente
la revisión por persona con criterio clínico apropiado.

### 4.2 Umbrales operativos

Los umbrales operativos son `recall ≥ 0.95` (prioridad alta — los
falsos negativos son éticamente más costosos en una superficie de
salud mental) y `precision ≥ 0.85`.

### 4.3 Runner y test gate

`lib/evals/crisis-eval.ts` ejecuta el pipeline contra cada caso
del dataset y produce un reporte estructurado con matriz de
confusión, precision, recall, F1, false negative rate y desglose
por categoría. El test `lib/evals/crisis-eval.test.ts` falla en
CI si el recall cae por debajo del umbral sobre la corrida
controlada con `forceClassifierOnSafe: true`, que ejecuta el
clasificador sobre todos los casos para obtener una señal
determinística por caso.

### 4.4 Tabla de resultados

> Espacio reservado para la tabla con la matriz de confusión y
> métricas finales (precision, recall, F1, false negative rate)
> globales y por categoría, una vez completada la revisión humana
> del dataset y la corrida final del runner.

### 4.5 Recomendación operacional

La política de invocación del clasificador en producción es una
decisión operativa que se documenta junto con el reporte: el
sistema puede ejecutar el clasificador solo cuando el regex
dispara, o forzarlo sobre todos los mensajes para maximizar el
recall a costa de mayor latencia y costo. La elección final se
documenta en `docs/tech/CHAT_SAFETY.md` y queda alineada con la
preferencia ética por minimizar falsos negativos en una
superficie sensible.

## 5. Limitaciones declaradas

La validación computacional presentada en este capítulo opera
dentro de los siguientes límites declarados:

1. **Heterogeneidad de los corpus** entrenamiento: Essays en
   inglés con población universitaria estadounidense vs corpus
   latinoamericano propio en español argentino con n acotado.
   Mitigación documentada en ADR-027 (umbrales por dimensión y
   `per_dimension_status`) y reflejada en el reporte separado
   por bloques.
2. **Sesgo del corpus latinoamericano** generado con asistencia
   IA, mitigación con la rúbrica manual documentada (ADR-028).
   Validación cruzada con muestras humanas declarativas
   identificada como trabajo posterior recomendable.
3. **Dataset de crisis** draft-generado con asistencia IA sin
   revisión clínica externa al cierre del capítulo. La corrida
   reportable de la evaluación del clasificador se posterga hasta
   completar esa revisión.
4. **Capa narrativa** delegada a un proveedor LLM externo con
   identificador de modelo fijado: la inferencia interpretativa
   (Jung, arquetipo) no produce métricas reproducibles del estilo
   MSE/R²/r y se documenta como tal.

Estas limitaciones acompañan toda afirmación cuantitativa del
capítulo y se retoman en la discusión del capítulo 11.

## 6. Cierre del capítulo

La validación computacional de Umbra se apoya en tres bloques
complementarios y reproducibles: las métricas del módulo
analítico propio reportadas por dimensión Big Five con umbrales
explícitos y `per_dimension_status`; los tests automatizados
(unit, E2E, axe-core) integrados al CI; y la evaluación del
clasificador de crisis sobre dataset etiquetado balanceado. El
pipeline del módulo analítico es reproducible externamente con
`make all` o `dvc repro` sobre el snapshot de datos versionado
con DVC. La honestidad metodológica se concentra en declarar
explícitamente qué dimensiones superan los umbrales mínimos y
cuáles se marcan como lectura preliminar, en lugar de presentar
un único score global que oculte la heterogeneidad real entre
dimensiones.

Los resultados consolidados de los tres bloques se integrarán
en el capítulo 10 Resultados, y el capítulo 11 Discusión retomará
las observaciones para analizar amenazas a la validez,
implicancias éticas y prioridades de trabajo futuro.
