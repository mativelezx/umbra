# Metodología

<!-- FUENTE PRIMARIA: docs/biz/VALIDATION.md, ADR-011, ADR-012, ADR-014,
     ADR-020, ADR-023. -->

## 1. Introducción

Este capítulo describe el diseño metodológico de la validación del
TFG. La decisión central, documentada en ADR-023, es la adopción
de un enfoque mixed-methods con dos pilares complementarios. El
primero es una validación computacional con tres hipótesis
preregistradas en OSF (H1, H2 y H3) que examinan propiedades
estadísticas del sistema sin requerir sujetos humanos. El segundo
es un estudio con usuarios reales tipo think-aloud con
reclutamiento controlado de ocho a diez participantes (M3), que
evalúa la usabilidad percibida del producto mediante el
instrumento System Usability Scale adaptado al español rioplatense.
Esta estrategia fue elegida sobre alternativas más ambiciosas
(como un estudio formal con muestra probabilística de n≥30 y
aprobación de un comité de ética institucional) por razones de
factibilidad temporal y control metodológico sobre variables bajo
los límites de un trabajo final de grado.

El plan completo de hipótesis, instrumentos, datasets y análisis
estadístico está en `docs/biz/VALIDATION.md`. Este capítulo de la
tesis presenta la metodología en formato narrativo académico, sin
duplicar el nivel de detalle operacional. Las tablas de resultados
y los protocolos específicos se incluyen como referencia en los
capítulos 8, 9 y 15.

## 2. Enfoque mixed-methods Branch B + M3

### 2.1 Fundamentación del enfoque

La validación de un sistema software que produce análisis
psicológicos tiene dos dimensiones que deben evaluarse de manera
complementaria. La primera es la consistencia interna del
instrumento computacional, es decir, si el sistema produce
salidas coherentes, reproducibles y robustas bajo variaciones
controladas de entrada. La segunda es la experiencia percibida
por los usuarios reales, es decir, si el producto resulta útil,
comprensible y valioso en uso efectivo. Ninguna de las dos
dimensiones, por sí sola, constituye evidencia suficiente para
respaldar una tesis de ingeniería en software que combine
artefacto y argumento metodológico.

La tesis adopta, por tanto, un diseño mixed-methods explícito.
El pilar computacional provee evidencia falsificable sobre las
propiedades técnicas del sistema, mientras que el pilar con
usuarios provee evidencia interpretativa sobre su recepción. Los
dos pilares conversan en el capítulo 10 Resultados y en el
capítulo 11 Discusión, donde los hallazgos cuantitativos y
cualitativos se triangulan para construir una imagen integrada.

### 2.2 Por qué Branch B en lugar de Branch A

La decisión original del proyecto (ADR-017) contemplaba dos
ramas posibles de validación. La rama A implicaba recolectar un
dataset pseudonimizado de usuarios reales bajo consentimiento
informado y pretendía obtener aprobación institucional para
investigación con sujetos humanos. La rama B limitaba la
validación a evaluación puramente computacional del modelo como
instrumento estadístico.

Tras análisis del calendario académico, de los recursos
disponibles y del estado del arte en preregistros OSF de estudios
computacionales, el proyecto adoptó la rama B como pilar primario
(ADR-023). Las razones fueron tres. Primero, la rama B permite
ejecutar experimentos rigurosos sin burocracia ética institucional,
lo cual resulta indispensable en el tiempo disponible. Segundo, la
rama B produce evidencia replicable mediante committed cache
snapshots (ADR-014), un estándar emergente en investigación
computacional reproducible. Tercero, la literatura reciente que
trata a los LLMs como "instrumentos estocásticos" (capítulo 4 del
presente documento) ofrece un framing legítimo para este tipo de
estudio en ingeniería en software.

La validación con usuarios quedó restringida al estudio
think-aloud (M3) con reclutamiento controlado. Este estudio no
pretende reemplazar un estudio poblacional sino aportar señal
cualitativa y cuantitativa complementaria al pilar computacional.
Su legitimidad metodológica se apoya en la literatura clásica de
usabilidad (Nielsen y Landauer, 1993) que documenta empíricamente
que cinco participantes think-aloud detectan aproximadamente el
ochenta y cinco por ciento de los problemas de usabilidad de una
interfaz, y que el retorno marginal disminuye rápidamente a partir
de ocho o diez participantes.

## 3. Hipótesis preregistradas H1, H2, H3

Las tres hipótesis computacionales del TFG están formalizadas en
ADR-011 (con enmiendas en ADR-014) y presentan las siguientes
formulaciones operativas.

### 3.1 H1 — Determinismo del análisis

La hipótesis H1 sostiene que, dado `temperature=0` y un modelo
SKU fijado (`claude-sonnet-4-6-20260301` o equivalente alias
pinned en el archivo `.env.local`), analizar el mismo texto
introspectivo mediante el prompt `analyze-profile.ts` produce
puntuaciones Big Five con desviación estándar por dimensión
inferior a 2.5 puntos en escala 0-100, a lo largo de corridas
consecutivas independientes sobre un corpus fijo. El diseño
preregistrado contemplaba cinco corridas por caso sobre cincuenta
casos (doscientos cincuenta análisis totales).

La motivación metodológica de esta hipótesis es que, si un
sistema LLM no es reproducible bajo condiciones idénticas,
cualquier análisis posterior pierde fundamento: no hay un objeto
estable sobre el cual discutir robustez ni validez. H1 constituye,
por tanto, una condición necesaria pero no suficiente para
interpretar el artefacto como un sistema de ingeniería defendible.

### 3.2 H2 — Robustez a paráfrasis semánticamente preservantes

La hipótesis H2 es más exigente que H1. Sostiene que, dadas tres
paráfrasis semánticamente preservantes de un mismo texto
introspectivo, generadas por modelos Claude Sonnet y Claude Haiku
actuando como reescritores, las puntuaciones Big Five derivadas
del texto original y las paráfrasis no deben diferir en más de
diez puntos (máximo delta pairwise) en ninguna dimensión. Esta
configuración es intra-vendor (ADR-020), es decir, limita la
evaluación a reescritores de la misma familia Anthropic; una
versión cross-vendor usando modelos de otras familias como GPT
o Llama habría sido metodológicamente más fuerte pero quedó
descartada por restricciones de automatización en el entorno de
ejecución disponible.

H2 aborda una pregunta distinta a H1: no si el modelo es estable
frente a entradas idénticas, sino si es estable frente a la
reformulación lingüística del mismo contenido. Una inestabilidad
en H2 indicaría que el sistema es sensible a la superficie lexical
del texto en lugar del significado subyacente, lo cual sería un
hallazgo relevante para cualquier aplicación que pretenda
inferir rasgos estables de personalidad a partir de texto libre
no estandarizado.

### 3.3 H3 — Precisión y recall del pipeline de safety

La hipótesis H3 evalúa el pipeline de detección de crisis
implementado en `lib/chat/pipeline.ts`. Este pipeline combina un
filtro regex con un clasificador LLM fail-closed y constituye la
pieza más crítica del sistema desde una perspectiva ética: si
falla, un usuario en crisis real no recibe los recursos
profesionales que el producto promete ofrecer.

La formulación de H3 sostiene que el pipeline alcanza un recall
mayor o igual a 0.95 y una precisión mayor o igual a 0.85 sobre
un dataset etiquetado de cien mensajes distribuidos en cuatro
categorías balanceadas: veinticinco crisis reales, veinticinco
expresiones idiomáticas argentinas (que contienen palabras
asociadas a crisis pero no lo son), veinticinco casos borderline
ambiguos y veinticinco mensajes seguros. El recall se pondera
más alto que la precisión porque, en un producto de salud mental,
los falsos negativos (no detectar una crisis real) son éticamente
más costosos que los falsos positivos (bloquear temporalmente
una conversación segura).

## 4. Diseño muestral y corpus

El corpus de evaluación para H1 y H2 consta de cincuenta casos
distribuidos así: veinte casos basados en viñetas adaptadas del
instrumento IPIP-NEO de dominio público (Goldberg, 1999), veinte
casos basados en tipología junguiana adaptados de *Tipos
Psicológicos* (Jung, 1921, dominio público) y diez casos
adversariales sintetizados para probar comportamientos edge como
tonos ambivalentes, narrativas contradictorias, entradas muy
cortas y mezclas de voseo con tuteo. Este corpus está
committeado en `lib/evals/cases.ts` y constituye el estímulo
fijo de las evaluaciones H1 y H2.

El dataset para H3 consta de cien casos etiquetados en
`lib/evals/crisis-dataset.ts`. Los casos fueron redactados como
mensajes sintéticos verosímiles en español rioplatense, sin
información personalmente identificable ni detalles operacionales
específicos sobre métodos de autolesión (ética red line en
`docs/biz/ETHICS.md`). El draft inicial del dataset fue generado
con asistencia de codex y posteriormente requiere revisión humana
con criterio clínico formal (tarea T4.0 del plan de
implementación, pendiente al cierre del presente capítulo).

## 5. Procedimiento y configuración técnica

Las tres evaluaciones se ejecutan mediante runners TypeScript
committeados en el repositorio. El runner H1 (`lib/evals/consistency.ts`)
carga los cincuenta casos, ejecuta cinco análisis consecutivos
por caso con `temperature=0` mediante el helper `claudeText` del
cliente Anthropic, almacena los resultados en memoria y calcula
la desviación estándar por dimensión para cada caso. El runner
H2 (`lib/evals/cross-model-paraphrase.ts`) genera tres paráfrasis
por caso usando tres reescritores configurados (Claude Sonnet base,
Claude Haiku base y Claude Sonnet en modo lexical híbrido),
analiza cada paráfrasis con `temperature=0` en el analizador y
calcula el máximo delta pairwise entre los cuatro análisis
resultantes. El runner H3 (`lib/evals/crisis-eval.ts`) ejecuta el
pipeline completo de `runSafetyPipeline()` sobre cada caso del
dataset de cien, captura las excepciones `CrisisDetected` y
construye la matriz de confusión correspondiente.

Todos los runners soportan un flag `--from-cache` que permite
replay offline de los resultados sin realizar llamadas nuevas a
la API Anthropic, leyendo en su lugar los snapshots committeados
en `lib/evals/.cache/`. Esta capacidad, documentada en ADR-014,
es condición necesaria para que la replicación externa del
experimento sea viable sin que cada revisor deba pagar el costo
de API completo.

La configuración del modelo usa el alias `claude-sonnet-4-6`
leído desde la variable de entorno `ANTHROPIC_MODEL_ID`. El
preregistro original exigía un SKU fechado (como
`claude-sonnet-4-6-20260301`) para garantizar estabilidad
longitudinal, pero la ejecución efectiva del experimento se
realizó con el alias debido a que la versión fechada no estaba
disponible en el catálogo al momento de la corrida. Esta
desviación respecto del preregistro queda documentada como
limitación explícita en el capítulo 8.

## 6. Estudio M3 con usuarios reales

El estudio M3 es de naturaleza cualitativa con componente
cuantitativo. El protocolo completo, los materiales de
reclutamiento, el formulario de consentimiento informado
(alineado con los artículos 6 y 7 de la Ley 25.326 argentina de
protección de datos personales) y el cuestionario System
Usability Scale en versión español rioplatense están en
`docs/research/` y `content/consent/research-m3-v1-es-AR.md`.

El procedimiento contempla sesiones individuales de cuarenta
minutos. En cada sesión, el participante recibe una computadora
con Umbra abierto en su página de landing y se le solicita que
complete el flujo de onboarding pensando en voz alta. El
investigador observa, toma notas escritas sin intervenir salvo
para recordar la instrucción de verbalizar, y registra la
sesión en audio y video mediante OBS Studio con consentimiento
explícito. Al finalizar la interacción con el producto, el
participante completa el cuestionario SUS y responde tres
preguntas abiertas sobre qué le sorprendió, qué le incomodó y
qué cambiaría.

El análisis cuantitativo consiste en calcular el promedio y la
desviación estándar del SUS sobre los participantes completados,
y comparar el promedio contra el benchmark de sesenta y ocho
puntos que Sauro (2011) identifica como el umbral por debajo del
cual una interfaz es considerada peor que el promedio de la
industria. El análisis cualitativo aplica análisis temático
inductivo de Braun y Clarke (2006) sobre las transcripciones
anonimizadas, identificando tres a cinco temas recurrentes con
dos o tres citas textuales por tema.

## 7. Ética de la investigación

El estudio M3 adopta los principios de la Declaración de
Helsinki para investigación con sujetos humanos, adaptados al
contexto de usabilidad informal de software. Estos principios
están documentados en `docs/biz/ETHICS.md` e incluyen
beneficencia (el producto debe ser diseñado para beneficio del
usuario), no maleficencia (protocolos de escalamiento claros en
caso de malestar emocional durante una sesión), autonomía
(consentimiento informado explícito, derecho a retirarse en
cualquier momento, opciones de borrado posterior) y justicia
(acceso gratuito al producto durante el estudio).

Los principios del marco Positive Computing de Calvo y Peters
(2014) operan como una capa adicional de revisión ética orientada
al diseño: cada decisión técnica o de interfaz se evalúa contra
los ocho factores operativos del marco (autonomía, competencia,
relación, atención plena, emoción positiva, involucramiento,
resiliencia y autocompasión) para verificar que contribuye al
bienestar subjetivo del usuario en lugar de erosionarlo.

El cumplimiento con la Ley 25.326 argentina de protección de
datos personales se aborda mediante tres mecanismos concretos
documentados en `docs/biz/LEGAL.md`: consentimiento expreso
verificable (artículo 7), derechos de acceso y rectificación
(artículos 14 y 16) implementados mediante endpoints API
propios, y procedimientos de cancelación con cascade delete
seguro mediante magic link con token de vida breve.

## 8. Reproducibilidad

El experimento completo es reproducible externamente mediante
tres mecanismos. Primero, el código fuente del proyecto es open
source y está disponible en su totalidad en el repositorio
correspondiente, lo cual permite auditar tanto el artefacto
evaluado como los runners de evaluación. Segundo, los cache
snapshots committeados en `lib/evals/.cache/` permiten
reproducir los resultados sin realizar llamadas nuevas a la API
Anthropic, eliminando tanto el costo económico como la variabilidad
asociada a cambios futuros en el modelo. Tercero, el preregistro
OSF (cuando sea submitido) proveerá un timestamp independiente
que certifica que las hipótesis fueron formuladas antes de la
observación de los resultados.

La tesis cita explícitamente el commit hash del repositorio
correspondiente al estado del código en el momento de cada
corrida. Los revisores que clonen el repositorio en ese hash y
ejecuten `npm run eval -- --from-cache` pueden reproducir los
resultados reportados sin requerir acceso a servicios externos
ni credenciales privadas.
