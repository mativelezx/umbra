# Estado del arte

<!-- FUENTE PRIMARIA: docs/biz/MARKET.md + outputs del skill /research
     que revisaron el paisaje 2026. -->

## 1. Panorama del autoconocimiento digital en 2026

El mercado de productos digitales de autoconocimiento ha crecido
significativamente en los últimos años, impulsado por tres vectores
principales. Primero, la adopción masiva de modelos de lenguaje de
gran escala (LLMs) permitió que la inferencia de perfiles
psicológicos a partir de texto libre dejara de ser exclusiva de
gabinetes clínicos. Segundo, la normalización cultural del discurso
sobre salud mental generó demanda por herramientas que acompañen la
reflexión personal sin medicalizar la experiencia cotidiana. Tercero,
el auge de las metodologías de *positive computing* en la
investigación en interacción humano-computadora aportó un marco
normativo para diseñar productos orientados al bienestar y no
únicamente a la eficiencia tarea-objetivo.

En ese contexto, los productos comerciales existentes cubren un
espectro amplio que va desde tests psicométricos tradicionales
digitalizados hasta experiencias conversacionales con IA
generativa. Umbra se ubica en la intersección de ambos mundos al
combinar una base de conocimiento psicológica estructurada con un
flujo conversacional dinámico en español latinoamericano.

## 2. Productos comerciales relevantes

### 2.1 16Personalities

**Enfoque**: test MBTI simplificado, gratis en la versión base,
con descripciones extensas por tipo. Alcanza aproximadamente siete
millones de usuarios únicos mensuales. Es posiblemente el producto
más masivo de personalidad en la web actual.

**Fortalezas**: diseño cuidado, contenido largo por tipo (3000-5000
palabras), secciones de relaciones y carrera, comunidad alrededor
de los 16 tipos, caras ilustradas distintivas.

**Debilidades relevantes para Umbra**: (a) usa MBTI como tipología
cerrada, pese a que la literatura psicométrica de las últimas dos
décadas ha documentado limitaciones sustanciales de la validez
construct del instrumento (Stein y Swan, 2019; Pittenger, 1993);
(b) no reporta grados de confianza ni variabilidad en sus asignaciones
de tipo; (c) no publica su metodología interna ni permite auditoría
externa; (d) no usa IA generativa adaptativa, el flujo es un
cuestionario estático con ramas fijas.

### 2.2 Crystal Knows

**Enfoque**: perfil DISC inferido a partir de señales digitales
(perfiles públicos de LinkedIn, emails) para contextos de ventas y
relaciones profesionales. Integración con Gmail, LinkedIn, Zoom.

**Fortalezas**: inferencia automática sin requerir input explícito
del usuario; orientación práctica ("cómo comunicarte con esta
persona"); mapeo a DISC, que si bien tiene debates académicos, es
reconocido en entornos corporativos.

**Debilidades**: (a) usa DISC en lugar de Big Five, lo cual reduce
granularidad psicométrica; (b) centra la privacidad en el sujeto
observado (que puede no haber consentido al análisis); (c) no es
apto para autoexploración íntima, sino para uso instrumental
relacional; (d) no publica evaluación empírica de la precisión de
sus inferencias.

### 2.3 Pattern (astrología + MBTI)

**Enfoque**: combinación de MBTI, astrología natal y narrativa
generada. Producto popular entre audiencias jóvenes interesadas en
autoexploración.

**Fortalezas**: narrativa atractiva, interfaz moderna, combinación
inusual que genera contenido diferenciado.

**Debilidades**: (a) mezcla astrología (no científica) con MBTI
(debatido académicamente) sin distinguir claramente las dos
fuentes; (b) no publica metodología ni tiene validación empírica
de ningún tipo; (c) imposible auditar desde una perspectiva
académica.

### 2.4 Truity

**Enfoque**: portal académico-comercial con versiones digitales
del Big Five, Enneagram, Career tests y otros instrumentos
tradicionales.

**Fortalezas**: cita fuentes académicas, incluye el Big Five como
uno de sus instrumentos principales, ofrece versiones gratuitas y
pagas, tiene mayor rigor científico que las alternativas anteriores.

**Debilidades**: (a) no usa IA generativa adaptativa; el análisis
se limita a puntuaciones numéricas + descripciones de facetas sin
narrativa personalizada; (b) no ofrece un flujo conversacional; (c)
no está adaptado al español latinoamericano ni a contextos culturales
argentinos específicos.

### 2.5 Productos emergentes con IA generativa (2024-2026)

En los últimos dos años han aparecido productos nuevos que usan
modelos de lenguaje de gran escala para generar análisis de
personalidad en lenguaje natural. Ejemplos incluyen aplicaciones que
toman diarios personales, transcripciones de terapia o entradas de
journaling y devuelven "retratos" generados por modelos comerciales.
Estos productos son, en su mayoría, experimentales y presentan dos
problemas sistémicos desde una perspectiva académica. En primer
lugar, ninguno reporta métricas reproducibles por dimensión sobre
sus inferencias psicológicas; los usuarios reciben análisis con
apariencia autoritaria sin indicadores de incertidumbre. En segundo
lugar, ninguno publica el pipeline de inferencia ni los datasets que
sustentan sus afirmaciones, lo cual imposibilita la replicación
externa y el escrutinio académico.

## 3. Tabla comparativa

| Producto | Base teórica | IA generativa | Trazabilidad metodológica | Validación empírica pública | Open source | Adaptación cultural ES-AR |
|---|---|---|---|---|---|---|
| 16Personalities | MBTI | No | Baja | No publica | No | No |
| Crystal Knows | DISC | Parcial | Baja | No publica | No | No |
| Pattern | MBTI + astrología | Sí | Muy baja | No publica | No | No |
| Truity | Big Five, Enneagram | No | Media | Papers citados | No | No |
| Experimentales LLM 2024-2026 | Variable | Sí | Baja | No publican | Algunos | Escaso |
| **Umbra** | **Big Five (IPIP-NEO) + Jung + Pearson + Positive Computing** | **Sí (capa narrativa con identificador de modelo fijado)** | **Alta (ADRs + KB con citation comments)** | **Métricas MSE/R²/r por dimensión, pipeline ML reproducible (DVC + MLflow), evaluación de seguridad del clasificador de crisis** | **Sí** | **Voseo latinoamericano nativo** |

## 4. Literatura académica relevante

### 4.1 Modelos dimensionales vs tipológicos

La literatura en psicometría contemporánea favorece los modelos
dimensionales (como el Big Five) sobre los tipológicos (como el
MBTI) por razones empíricas: las dimensiones continuas capturan
mejor la realidad estadística de la variabilidad humana y
presentan mayor estabilidad test-retest. Stein y Swan (2019)
realizaron un análisis sobre la validez del MBTI y documentan que
el instrumento presenta problemas sistemáticos de confiabilidad en
las asignaciones de tipo, particularmente en los cortes cerca de
la mediana poblacional. Pittenger (2005) ya había anticipado estas
limitaciones. Umbra adopta esta crítica como decisión explícita
(ADR-002): utilizar las funciones cognitivas de Jung directamente
como lectura interpretativa de la capa narrativa, sin pasar por la
tipología MBTI ni inferirlas como dimensiones medidas.

### 4.2 Safety en chatbots de salud mental

La literatura 2023-2025 sobre riesgos de chatbots de "terapia"
digital ha identificado patrones preocupantes. Un estudio de Brown
University (2024) documentó quince riesgos éticos concretos en
aplicaciones comerciales de este tipo, entre ellos la normalización
de ideación suicida mediante respuestas empáticas sin escalamiento,
la ausencia de protocolos de crisis formales y la recolección
indiscriminada de datos sensibles sin consentimiento informado
adecuado. Un caso paradigmático, conocido como caso Noni, involucró
a un chatbot que proporcionó información sobre ubicaciones de
puentes tras un mensaje del usuario mencionando pérdida de empleo,
sin activar ningún protocolo de seguridad. La respuesta regulatoria
incluye legislación emergente como la *Wellness and Oversight for
Psychological Resources Act* sancionada en Illinois en 2025, que
exige supervisión profesional licenciada para cualquier producto
que ofrezca intervención psicológica digital.

Umbra adopta una postura preventiva ante estos riesgos. El pipeline
de detección de crisis implementado combina filtros regex con
clasificador LLM fail-closed, y el producto declara explícitamente
y de manera visible que "no es terapia" en cada superficie del
chat. La evaluación empírica de este pipeline contra un dataset
etiquetado con métricas precision/recall constituye, en sí misma,
una respuesta al vacío de literatura publicada sobre la precisión
real de los sistemas de safety en chatbots del mercado actual.

### 4.3 Positive Computing

Calvo y Peters (2014) proponen en *Positive Computing: Technology
for Wellbeing and Human Potential* un marco teórico que desplaza
el centro del diseño de interacción humano-computadora desde la
eficiencia tarea-objetivo hacia el bienestar psicológico como
meta primaria. Los ocho factores operativos del modelo (autonomía,
competencia, relación, atención plena, emoción positiva,
involucramiento, resiliencia, autocompasión) derivan de la teoría
de la autodeterminación de Ryan y Deci y constituyen un
vocabulario normativo para evaluar si una pieza de software
contribuye o erosiona el bienestar subjetivo de sus usuarios.

El marco teórico de Umbra adopta este lenguaje de manera explícita
al construir su sistema de prompts. El bloque de conocimiento
`lib/knowledge/positive-computing.ts` codifica los ocho factores
como reglas de "hacer" y "no hacer" que el prompt del chat
inyecta en cada turno, y el capítulo 11 de la presente tesis
discute cómo las decisiones arquitectónicas y de evaluación
empírica se alinean o tensionan con los principios del marco.

### 4.4 Inferencia de personalidad por texto con embeddings preentrenados

La línea de investigación que infiere rasgos de personalidad a
partir de texto libre se apoya en dos pilares: (a) la observación
empírica de que el estilo lingüístico correlaciona con dimensiones
de personalidad (Pennebaker & King, 1999), y (b) la disponibilidad
de modelos preentrenados de lenguaje cuyas representaciones
intermedias capturan información semántica relevante para esa
tarea. La estrategia de *frozen embeddings* (Howard & Ruder, 2018;
Peters et al., 2019) propone usar el modelo preentrenado como
extractor fijo de features y entrenar encima un regresor clásico,
evitando el costo y los riesgos de fine-tuning. Umbra adopta
explícitamente esta estrategia con DistilBERT (Sanh et al., 2019)
como extractor congelado y regresores Ridge multi-output (Hoerl &
Kennard, 1970) sobre las cinco dimensiones Big Five (ADR-026). La
elección de modelo cuantitativo independiente del proveedor LLM
externo permite calcular métricas reproducibles por dimensión y
auditarlas contra un split test fijado.

## 5. Diseño centrado en explicabilidad para sistemas con IA

El diseño de productos con componentes de IA generativa exige
considerar la explicabilidad y la confianza del usuario como
propiedades de primera clase del sistema. Umbra implementa esa
exigencia con tres mecanismos concretos: (i) el campo
`per_dimension_status` del módulo analítico (ADR-027) que expone
explícitamente cuáles dimensiones Big Five superan los umbrales
mínimos y cuáles se reportan como lectura preliminar; (ii) la
separación arquitectónica medido vs interpretativo (ADR-002 +
ADR-007) que evita atribuir falsa precisión psicométrica a la
lectura de funciones Jung y arquetipo Pearson; y (iii) la
trazabilidad de la base de conocimiento mediante comentarios
JSDoc estandarizados (ADR-018), que permiten auditar qué cita
sustenta cada bloque inyectado al system prompt.

## 6. Gap que Umbra llena

La revisión del estado del arte revela tres brechas simultáneas
que Umbra intenta cubrir. Primero, ningún producto comercial
combina los marcos teóricos que Umbra integra (Big Five empírico
medido por un módulo propio, funciones Jung como lectura
interpretativa, arquetipos Pearson aplicados y Positive Computing
como marco normativo de diseño), ni lo hace en voseo
latinoamericano con adaptación cultural argentina explícita.
Segundo, ningún producto del mercado comercial publica su pipeline
de inferencia ni los datasets que lo sustentan, lo cual impide la
auditoría externa; Umbra publica el pipeline completo (DistilBERT
congelado + Ridge multi-output) bajo DVC y MLflow. Tercero, la
literatura académica sobre productos de autoconocimiento asistidos
por IA es emergente y carece de protocolos replicables que separen
componente cuantitativo medido y componente interpretativo
delegado; Umbra ofrece precisamente esa separación como
contribución metodológica.

La combinación de estas tres brechas cubiertas convierte a Umbra
en un artefacto doblemente valioso: como producto orientado al
usuario final y como objeto académico auditable, con una base de
código abierta, decisiones arquitectónicas documentadas en ADRs y
una narrativa metodológica honesta sobre los límites de la
inferencia de rasgos a partir de texto libre.

## Referencias del capítulo

Las referencias bibliográficas completas con formato APA 7ª edición
se encuentran en el capítulo 14 Referencias. Este capítulo cita,
entre otros, a Brooke (1996), Calvo y Peters (2014), Goldberg
(1999), Hoerl y Kennard (1970), Howard y Ruder (2018), Jung (1921),
Pearson (1991), Pedregosa et al. (2011), Pennebaker y King (1999),
Peters et al. (2019), Pittenger (2005), Sanh et al. (2019), Stein
y Swan (2019).
