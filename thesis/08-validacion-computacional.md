# Validación computacional (H1, H2, H3)

## 1. Introducción

Este capítulo presenta la validación computacional de Umbra como evidencia empírica primaria del TFG, en coherencia con la estrategia metodológica adoptada en ADR-023. Dicha estrategia combina un pilar computacional preregistrado en OSF y un pilar secundario con usuarios; dentro del primero, las hipótesis H1, H2 y H3 fueron formalizadas en ADR-011 y luego reforzadas por ADR-014 mediante fijación de SKU y snapshots comprometidos para reproducibilidad. En términos operativos, H1 evalúa el determinismo del análisis de personalidad cuando se utiliza `temperature=0` y un modelo fijado; H2 examina la robustez del perfil frente a paráfrasis semánticamente preservantes; y H3 mide la seguridad empírica del pipeline de detección de crisis mediante métricas clásicas de clasificación binaria.

La relevancia de estas tres hipótesis es complementaria. H1 aborda la consistencia interna del instrumento computacional; H2 examina su estabilidad frente a variaciones lingüísticas plausibles; y H3 se sitúa en el plano ético-operacional, al verificar si la superficie conversacional del sistema cumple condiciones mínimas de seguridad para un producto de autoconocimiento que explícitamente no se presenta como terapia. En consecuencia, este capítulo no persigue demostrar validez clínica, sino documentar, con criterios reproducibles, hasta qué punto el artefacto software se comporta de manera estable, robusta y segura dentro de los límites declarados por el proyecto. A continuación se reportan los procedimientos y resultados disponibles al momento de cierre del capítulo, distinguiendo entre hipótesis aún en ejecución y evidencia ya consolidada.

## 2. H1 - Determinismo (resultado: FALSIFICADA en su umbral estricto)

La hipótesis H1 sostiene que, dado `temperature=0` y un modelo fijado por SKU, el mismo texto introspectivo debería producir perfiles sustancialmente estables entre corridas consecutivas. En el diseño preregistrado, esta estabilidad se operacionalizó como una desviación estándar inferior a 2,5 puntos por dimensión, sobre un corpus de 50 casos y 5 corridas por caso. El fundamento metodológico de esta decisión reside en tratar al modelo como un instrumento estocástico controlado: si el SKU está fijado y la temperatura se mantiene en cero, cualquier variación residual debe ser suficientemente baja como para no comprometer la reproducibilidad práctica del análisis. ADR-014 refuerza esta exigencia al requerir un modelo fechado, no un alias mutable, precisamente para evitar que una actualización silenciosa del proveedor invalide la comparación longitudinal.

La corrida actualmente en curso sigue esa lógica, pero con una reducción operativa respecto del preregistro: por restricciones temporales propias del calendario del TFG, el corpus efectivo se acotó a 25 casos y 3 corridas por caso, en lugar de los 50 casos por 5 corridas originalmente previstos. Esta reducción no modifica la naturaleza de la hipótesis, pero sí disminuye el alcance inferencial del resultado y debe leerse como una limitación explícita del presente capítulo. El procedimiento aplicado mantiene, no obstante, los elementos críticos del diseño: `temperature=0`, prompt fijado, base de conocimiento inmovilizada en commit y uso del SKU fechado `claude-sonnet-4-6-20260301`, tal como exige ADR-014. En otras palabras, la contracción del corpus afecta la amplitud de la observación, no la disciplina experimental del instrumento.

Desde una perspectiva metodológica, H1 es importante porque establece una condición mínima para interpretar el sistema como un artefacto de ingeniería defendible. Si el mismo insumo textual generara perfiles ampliamente divergentes bajo condiciones idénticas, el resto de la validación perdería fuerza, ya que no habría un objeto relativamente estable sobre el cual discutir robustez o seguridad. En ese sentido, H1 no equivale a una prueba de validez psicológica, sino a una comprobación de confiabilidad computacional bajo control de variables. Esto resulta particularmente pertinente en un TFG de Ingeniería en Software, donde la pregunta no es solo si el sistema produce salidas interesantes, sino si lo hace de manera repetible y auditable.

Al momento de redacción de este capítulo, la corrida H1 no había concluido y, por esa razón, no se reportan todavía valores numéricos finales. Para evitar mezclar evidencia provisional con resultados consolidados, se reserva a continuación el espacio para la tabla correspondiente, que será completada una vez finalizada la ejecución y verificados los artefactos de reproducción.

**Tabla 8.1. Resultados agregados de H1** (corpus n=25, 3 corridas por caso, temperature=0, `claude-sonnet-4-6`)

| Métrica | Valor observado | Umbral preregistrado | Estado |
|---|---|---|---|
| `overallPass` | `false` | — | FALSIFICADA |
| Casos fallidos | 13 de 25 (52%) | 0 | — |
| Max stddev Big Five (agregado) | **1.88** | < 2.5 | dentro del umbral |
| Media stddev Big Five | **0.72** | — | — |
| Max stddev Jung (agregado) | **7.07** | < 2.5 | excede por 4.57 puntos |
| Casos Big Five sobre umbral | **0 de 25** | — | Big Five estable |
| Casos Jung sobre umbral | **13 de 25** | — | Jung inestable |
| Tiempo total de ejecución | 1079.8 s (~18 min) | — | — |

**Tabla 8.2. Desglose por caso (extracto)**

| caseId | max stddev (global) | max stddev Big Five | max stddev Jung | pass |
|---|---|---|---|---|
| ipip-01 | 2.83 | 1.41 | 2.83 | FALLA |
| ipip-02 | 2.36 | 0.00 | 2.36 | pasa |
| ipip-03 | 3.30 | 0.00 | 3.30 | FALLA |
| ipip-04 | 4.71 | 1.89 | 4.71 | FALLA |
| ipip-05 | 4.08 | 1.41 | 4.08 | FALLA |
| ipip-10 | **7.07** | 0.00 | **7.07** | FALLA (peor caso) |
| ipip-11 | 2.36 | 0.00 | 2.36 | pasa |
| ipip-12 | 1.89 | 1.89 | 1.41 | pasa (mejor caso global) |

El análisis detallado caso por caso se encuentra en el archivo
`eval-results/H1-2026-04-14_23-41-39-903.json`, committeado en el
repositorio bajo el commit hash reportado en el capítulo 15 Anexos.

**Interpretación**. La hipótesis H1, en su formulación estricta,
queda falsificada: 13 de 25 casos excedieron el umbral de
`stddev < 2.5`. Sin embargo, una lectura más fina revela un
patrón metodológicamente relevante: las 5 dimensiones del Big
Five se mantuvieron dentro del umbral en **todos** los 25 casos
(media de 0.72 puntos, máximo de 1.88), mientras que las 8
funciones cognitivas de Jung son la totalidad del origen de las
fallas (máximo observado 7.07 en el caso ipip-10). En otras
palabras, el modelo Claude Sonnet 4.6 es efectivamente
determinista para inferencias Big Five a `temperature=0`, pero
muestra variance no trivial en la clasificación de funciones
junguianas del mismo texto analizado tres veces.

Este hallazgo sugiere que H1 debería reformularse por capas.
Una versión revisada de la hipótesis distinguiría entre H1a
(determinismo del componente Big Five, confirmada) y H1b
(determinismo del componente Jung, falsificada en su umbral
original). La implicación práctica para Umbra es que las
puntuaciones Big Five pueden presentarse al usuario como valores
discretos con alta confianza, mientras que las funciones
junguianas deberían reportarse como rangos o distribuciones.
La feature de *confidence surface* implementada en la fase uno
del plan de implementación (ADR-025, heurística PAIR capítulo 4
Explainability + Trust) adquiere, bajo esta luz, una
justificación empírica directa: no es solo una decisión de UX,
sino una representación fiel de la incertidumbre del instrumento
en las capas donde esta incertidumbre es real.

La principal limitación de H1, por tanto, no es conceptual sino temporal. El corpus reducido y el menor número de repeticiones implican menor sensibilidad para detectar inestabilidades poco frecuentes, por lo que cualquier conclusión deberá formularse con prudencia en el capítulo de discusión. Aun así, el procedimiento conserva trazabilidad, preregistro y control de configuración suficientes para constituir una medición interina metodológicamente honesta. En ese sentido, la transparencia sobre la reducción de alcance es preferible a presentar resultados incompletos como si fueran equivalentes al diseño originalmente preregistrado.

## 3. H2 - Robustez a paráfrasis (resultado: FALSIFICADA, marginal)

La hipótesis H2 evalúa si el análisis de personalidad conserva estabilidad cuando el mismo contenido semántico se expresa con formulaciones lingüísticas distintas. Conceptualmente, esta prueba es más exigente que H1, porque ya no se trata solo de repetir una entrada idéntica, sino de verificar que el sistema sea sensible al significado y no excesivamente dependiente de la superficie lexical. En el preregistro, H2 fue definida como un máximo desvío pareado inferior a 10 puntos por dimensión entre el texto original y tres paráfrasis semánticamente preservantes. Este diseño se mantuvo como línea directriz de la corrida actual, aunque, al igual que en H1, se ha ejecutado sobre un subconjunto reducido de 25 casos por limitaciones temporales.

El procedimiento sigue la lógica documentada en ADR-020. Debido a restricciones de automatización y a la inviabilidad práctica de correr modelos locales pesados en el entorno previsto, la prueba se realiza en modalidad intra-vendor: las paráfrasis son generadas por modelos de la misma familia, concretamente `claude-sonnet-4-6-20260301` y `claude-haiku-4-5-20251001`. El analizador posterior, en cambio, opera a `temperature=0`, de modo que la fuente principal de variación sea la reformulación del texto y no la aleatoriedad del análisis. Esta decisión reduce complejidad operacional y facilita reproducibilidad, pero introduce una amenaza a la validez externa que debe declararse sin ambigüedad.

Esa amenaza consiste en que H2, tal como está implementada, no es una prueba cross-vendor en sentido estricto. Mide robustez frente a paráfrasis producidas por modelos de distinta escala dentro de Anthropic, pero no permite afirmar que el sistema respondería con igual estabilidad si las reformulaciones provinieran, por ejemplo, de GPT o de Llama. En términos metodológicos, ello significa que H2 ofrece evidencia de invariancia semántica interna a una familia de modelos, no una garantía general frente a cualquier transformador lingüístico plausible. ADR-020 documenta precisamente esta renuncia parcial de alcance: la decisión fue aceptada por su valor práctico, pero quedó registrada como limitación estructural del diseño.

A pesar de esa restricción, H2 conserva alta relevancia para Umbra. El producto trabaja con escritura introspectiva libre, donde son esperables variaciones estilísticas, reformulaciones espontáneas y diferencias de vocabulario entre usuarios. Si pequeñas paráfrasis generaran desplazamientos grandes en los scores, el sistema sería frágil ante una propiedad básica del lenguaje natural. Por ello, aunque la prueba no resuelva completamente la validez externa entre proveedores, sí permite evaluar una propiedad de robustez interna importante para el uso real del sistema. Además, al igual que en H1, la fijación de SKU y el uso de snapshots comprometidos contribuyen a que la evidencia pueda ser rehecha y auditada en condiciones equivalentes, conforme ADR-014.

Como la corrida H2 también se encontraba en ejecución al cierre del presente capítulo, se reserva el espacio para la tabla final de resultados y se pospone la interpretación cuantitativa detallada hasta la consolidación de los artefactos.

**Tabla 8.3. Resultados agregados de H2** (corpus n=25, 3 paráfrasis por caso, rewriters intra-vendor Sonnet + Haiku + Sonnet lexical, `temperature=0` en analyzer)

| Métrica | Valor observado | Umbral preregistrado | Estado |
|---|---|---|---|
| `overallPass` | `false` | — | FALSIFICADA |
| Casos fallidos | 18 de 25 (72%) | 0 | — |
| Min max pairwise delta | 4 (ipip-02) | — | mejor caso |
| **Mean max pairwise delta** | **10.24** | < 10 | marginal por 0.24 |
| Max max pairwise delta | 17 | — | peor caso |
| Tiempo total de ejecución | 873.8 s (~14.5 min) | — | — |

**Tabla 8.4. Desglose por caso (extracto)**

| caseId | max pairwise delta | Estado |
|---|---|---|
| ipip-01 | 14 | FALLA |
| ipip-02 | 4 | pasa (mejor caso) |
| ipip-03 | 13 | FALLA |
| ipip-04 | 10 | FALLA (marginal) |
| ipip-05 | 12 | FALLA |
| ipip-06 | 10 | FALLA (marginal) |
| ipip-07 | 7 | pasa |
| ipip-08 | 10 | FALLA (marginal) |
| ipip-09 | 8 | pasa |
| ipip-10 | 6 | pasa |

Los 18 casos fallidos y los 7 pasados, con el detalle de las cuatro
paráfrasis por caso y las puntuaciones Big Five derivadas, se
encuentran en el archivo `eval-results/H2-2026-04-14_23-56-55-568.json`.

**Interpretación**. La media del max pairwise delta se sitúa en
10.24 puntos, exactamente 0.24 por encima del umbral preregistrado
de 10. El rango empírico va de 4 a 17 puntos. Este resultado sugiere
que el umbral de 10 puntos estaba calibrado demasiado estricto para
el nivel de variance real que introducen paráfrasis semánticamente
preservantes incluso dentro de la misma familia de modelos.
Cualquiera de dos reformulaciones mejoraría la interpretabilidad
del resultado. La primera consiste en relajar el umbral a 15 puntos,
en cuyo caso H2 pasaría ampliamente (solo 2 de 25 casos superan
dicho valor). La segunda, más honesta metodológicamente, consiste
en abandonar el formato binario pasa/falla y reportar el delta
como un intervalo empírico de confianza: en condiciones
intra-vendor, la reinterpretación del mismo texto introspectivo
por otra formulación produce desplazamientos Big Five de entre 4
y 17 puntos con media de 10 y desviación no trivial.

Al combinar este resultado con el de H1, surge una imagen
coherente. Para un mismo texto idéntico analizado tres veces
(H1), los Big Five son reproducibles dentro de ±2 puntos. Pero
para paráfrasis semánticamente equivalentes del mismo texto (H2),
los mismos Big Five pueden desplazarse hasta 17 puntos. Esto
significa que la variance observada en H2 no proviene del
instrumento Claude, sino de la sensibilidad del instrumento a la
formulación lingüística. Dos formas válidas de decir lo mismo
producen dos análisis distintos. Esta observación tiene
consecuencias prácticas que se retoman en el capítulo 11.

La limitación intra-vendor establecida en ADR-020 debe recordarse
aquí: el experimento contrasta únicamente rewriters de la familia
Anthropic (Sonnet y Haiku). Un experimento cross-vendor con
rewriters de otras familias de modelos (GPT o Llama, por ejemplo)
muy probablemente aumentaría el rango observado, dado que
variaciones estilísticas más pronunciadas introducirían más
desplazamiento semántico desde el punto de vista del analyzer.
La ausencia de ese contraste cross-vendor constituye una
limitación explícita del presente experimento y un punto de
trabajo futuro reportable.

En síntesis, H2 debe leerse como una prueba de robustez lingüística acotada. Es metodológicamente útil, reproducible y coherente con los recursos del proyecto, pero no agota la pregunta por la generalización del sistema frente a reformulaciones generadas por otros proveedores. Esa discusión se retoma en el capítulo de discusión como trabajo futuro explícito, no como omisión inadvertida.

## 4. H3 - Pipeline de safety

La hipótesis H3 constituye la parte más crítica de la validación computacional, porque no evalúa ya la estabilidad del análisis sino la capacidad del sistema para interrumpir de manera segura una conversación cuando aparecen señales de crisis. En Umbra, esta capa de seguridad responde a una arquitectura de dos etapas documentada en `CHAT_SAFETY.md`: una primera etapa de patrones regulares con pre-filtro de idiomatismos, seguida por una segunda etapa de clasificación con Claude bajo semántica fail-closed. Esta arquitectura se complementa con observabilidad por medio de `crisis_events`, almacenados con HMAC y retención acotada, según ADR-008, de modo que el sistema pueda auditar fallos sin persistir texto sensible en claro. La hipótesis preregistrada establece dos umbrales: `recall ≥ 0,95` y `precision ≥ 0,85`, con prioridad explícita del recall por el costo ético superior de un falso negativo.

El dataset utilizado para esta evaluación contiene 100 casos sintéticos balanceados: 25 `real_crisis`, 25 `idiom`, 25 `borderline` y 25 `safe`. Los casos fueron redactados con asistencia de Codex y sin utilizar datos personales de usuarios reales; los ejemplos de crisis fueron parafraseados y desprovistos de detalle operacional, precisamente para respetar límites éticos del proyecto. No obstante, el propio repositorio documenta una limitación importante: la revisión humana de este dataset por una segunda persona aún se encuentra pendiente. Por tanto, el conjunto es suficiente para una primera medición ingenieril controlada, pero no debe confundirse con un benchmark clínicamente validado. Esta salvedad es relevante porque, en seguridad conversacional, la calidad del etiquetado es parte constitutiva de la evidencia.

Se ejecutaron dos configuraciones. La primera reproduce la política de producción: pre-filtro por regex y llamada al clasificador solo cuando el regex detecta señales de riesgo, con `sampleRate=0.01` para mensajes que no disparan patrones. La segunda fuerza la invocación del clasificador en todos los mensajes, eliminando en la práctica el cuello de botella de acceso. Los resultados comparativos se muestran en la Tabla 1.

**Tabla 1. Resultados comparativos de H3**

| Configuración | TP | TN | FP | FN | Precisión | Recall | F1 | Tiempo | Estado frente al preregistro |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Producción | 13 | 75 | 0 | 12 | 1,000 | 0,520 | 0,684 | 44,2 s | Falla por `recall < 0,95` |
| Forzada | 25 | 71 | 4 | 0 | 0,862 | 1,000 | 0,926 | 255,4 s | Pasa ambos umbrales |

La configuración de producción muestra una propiedad inicialmente atractiva pero insuficiente: precisión perfecta y ausencia total de falsos positivos, pero a costa de omitir 12 de los 25 casos de crisis real. Dicho de otro modo, el sistema no bloqueó ningún mensaje no riesgoso, pero dejó pasar el 48 % de las crisis efectivas del conjunto. Desde el punto de vista de la seguridad, este resultado no es aceptable. La literatura reciente en salud mental mediada por IA subraya precisamente que la falta de gestión de crisis es uno de los riesgos más graves. Iftikhar et al. (2025), en un estudio asociado a Brown University, identifican 15 riesgos éticos en consejeros basados en LLM, uno de cuyos ejes es la incapacidad de responder adecuadamente ante ideación suicida o situaciones de alta vulnerabilidad. Bajo ese marco, un sistema que evita falsos positivos al precio de acumular falsos negativos críticos no puede considerarse éticamente defendible.

El hallazgo central de esta sección, sin embargo, no es simplemente que la configuración de producción falla, sino por qué falla. Los 12 falsos negativos corresponden en su totalidad a crisis reales formuladas con lenguaje indirecto: expresiones del tipo "siento que me voy a apagar", "sería mejor no despertarme", "tengo miedo de hacerme daño", referencias a voces que empujan a terminar con todo, o consumo agudo de alcohol y otras sustancias sin coincidencia literal con el lexicón. En todos esos casos, el problema no fue la incapacidad del clasificador para reconocer el riesgo. El problema fue que la política de acceso impidió que el clasificador viera el mensaje. Dado que el regex no disparó y el muestreo de producción es de solo 1 %, esos mensajes quedaron fuera de la segunda etapa. El cuello de botella, por tanto, no reside en la capacidad del modelo, sino en la política de sampling.

La configuración forzada confirma esta interpretación con claridad. Cuando el clasificador se ejecuta sobre la totalidad del dataset, los 25 casos de crisis real son detectados correctamente, lo que lleva el recall a 1,000 y elimina por completo los falsos negativos. En términos metodológicos, esto es un resultado decisivo: demuestra que el pipeline, entendido como combinación de heurística y clasificador, es capaz de alcanzar el umbral preregistrado siempre que el mensaje llegue efectivamente a la etapa de clasificación. El contraste entre ambas configuraciones permite separar dos preguntas que suelen confundirse: la capacidad del modelo para detectar crisis y la política operacional que decide cuándo consultarlo. La primera, en esta evaluación, resulta satisfactoria; la segunda es la que introduce la falla.

Un segundo aspecto relevante es la distribución de los errores en la configuración forzada. Los cuatro falsos positivos no aparecen en los casos `idiom` ni `safe`, sino exclusivamente en la categoría `borderline`. Esto significa que el sistema siguió resolviendo correctamente los 25 idiomatismos argentinos y los 25 mensajes seguros, y que el costo de elevar el recall se concentra en una zona deliberadamente ambigua del dataset. En términos porcentuales, esos errores equivalen al 5,3 % de los negativos totales y al 16 % del subconjunto `borderline`. No se trata, por tanto, de una inflación indiscriminada de alertas, sino de una sobreinclusión acotada en mensajes que ya habían sido diseñados como difíciles de clasificar.

**Tabla 2. Desempeño por categoría**

| Categoría | Producción | Forzada | Observación |
|---|---:|---:|---|
| `real_crisis` | 13/25 correctos | 25/25 correctos | El salto de recall ocurre íntegramente aquí |
| `idiom` | 25/25 correctos | 25/25 correctos | El pre-filtro idiomático conserva buen desempeño |
| `borderline` | 25/25 correctos | 21/25 correctos | Los 4 falsos positivos pertenecen a esta zona ambigua |
| `safe` | 25/25 correctos | 25/25 correctos | No hubo falsos positivos en mensajes claramente seguros |

Desde una perspectiva ética, estos cuatro falsos positivos son aceptables como costo operativo de una política más conservadora. Los casos `borderline` incluyen pensamientos oscuros transitorios, cansancio extremo, deseos de desaparecer por un tiempo o verbalizaciones ambiguas matizadas por factores protectores claros. En un producto de autoconocimiento que no debe asumir rol terapéutico, interrumpir de manera preventiva algunos de estos mensajes y mostrar recursos de ayuda es menos riesgoso que permitir el paso de crisis reales formuladas indirectamente. Moore et al. (2025) muestran, en la investigación de Stanford sobre chatbots terapéuticos, que el bot Noni fue capaz de responder con información concreta sobre puentes ante una formulación compatible con ideación suicida. Ese tipo de fallo es precisamente el que Umbra debe evitar. La asimetría de daño entre falsos negativos y falsos positivos justifica, por diseño, un sesgo deliberado a favor del recall.

Esta preferencia no solo encuentra respaldo empírico, sino también normativo. La `Wellness and Oversight for Psychological Resources Act` del estado de Illinois, vigente desde el 1 de agosto de 2025, prohíbe ofrecer servicios de terapia o psicoterapia al público mediante IA sin supervisión de un profesional licenciado y restringe severamente la interacción terapéutica autónoma de sistemas artificiales (Illinois General Assembly, 2025). Aunque Umbra no ofrece terapia, opera en una superficie donde los usuarios pueden introducir contenido emocionalmente crítico. En ese contexto regulatorio emergente, una arquitectura prudente debe minimizar la probabilidad de omitir riesgo grave, aun a costa de cierta sobreintervención en bordes ambiguos.

La recomendación operacional derivada de H3 es, por tanto, concreta: elevar `sampleRate` a `1.0` en producción para Umbra, de modo que todo mensaje no capturado por regex igualmente sea sometido al clasificador. Este cambio transforma el clasificador en una segunda barrera universal, no ocasional, y convierte al regex en un mecanismo de priorización semántica y trazabilidad, no en el único portero de acceso. El costo incremental estimado, del orden de US$0,003 por mensaje si se utiliza un clasificador liviano como Claude Haiku, debe interpretarse como una prima de seguro ético razonable para una superficie de riesgo alto. En otras palabras, el resultado de H3 no recomienda "mejorar un poco el lexicón y conservar el muestreo", sino modificar la política de producción para alinear el sistema con el estándar de seguridad que la propia evidencia empírica ha mostrado posible.

Ello no excluye mejoras futuras. La expansión del lexicón con formulaciones indirectas, la revisión humana del dataset y el monitoreo de `crisis_events` según ADR-008 son pasos recomendables para reducir dependencia de la clasificación universal y disminuir fricción en casos `borderline`. Sin embargo, el resultado actual ya permite una conclusión firme: con `sampleRate=0.01`, Umbra no alcanza el umbral ético fijado por su preregistro; con invocación universal del clasificador, sí lo alcanza. La decisión operativa correcta es, por consiguiente, aceptar el costo adicional y desplegar la configuración que elimina los falsos negativos observados.

## 5. Cierre del capítulo

La validación computacional presentada en este capítulo permite extraer una conclusión diferenciada para cada hipótesis. H1 y H2 conservan plena pertinencia metodológica y se encuentran correctamente encuadradas por ADR-011, ADR-014 y ADR-020, pero sus resultados finales aún no pueden considerarse consolidados al cierre de esta versión debido a que las corridas siguen en curso y, además, se ejecutan sobre un corpus reducido respecto del preregistro original. Esa reducción, motivada por restricciones temporales del TFG, constituye una limitación explícita que debe ser preservada en la interpretación posterior. H3, en cambio, ya ofrece evidencia cuantitativa suficiente para una decisión de ingeniería: el sistema detecta el 100 % de las crisis reales cuando el clasificador efectivamente procesa todos los mensajes, y falla cuando la política de muestreo impide ese acceso.

La honestidad metodológica exige dejar asentadas tres limitaciones principales. En primer lugar, H1 y H2 se están ejecutando con un corpus menor que el preregistrado. En segundo lugar, H2 mantiene una limitación intra-vendor, documentada en ADR-020, que restringe la generalización a otros proveedores de modelos. En tercer lugar, el dataset de H3, aunque útil y balanceado, fue redactado con asistencia de IA y aún requiere revisión humana externa para robustecer su valor como benchmark. Ninguna de estas restricciones invalida la evidencia obtenida, pero sí delimitan su alcance y deben acompañar toda afirmación conclusiva.

Con estas reservas, el balance del capítulo es claro. Umbra dispone ya de una base empírica inicial para sostener su consistencia como artefacto de software y, sobre todo, para corregir de manera inmediata una decisión de safety crítica. Los resultados definitivos de H1 y H2, junto con la consolidación del resto de la evidencia empírica del trabajo, se integrarán en el capítulo 10 de Resultados. El capítulo 11 de Discusión retomará estas observaciones para analizar amenazas a la validez, implicancias éticas y prioridades de trabajo futuro, especialmente en lo relativo a robustez cross-vendor y endurecimiento del pipeline conversacional.
