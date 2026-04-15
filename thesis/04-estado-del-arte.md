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
flujo conversacional dinámico en español rioplatense.

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
no está adaptado al español rioplatense ni a contextos culturales
argentinos específicos.

### 2.5 Productos emergentes con IA generativa (2024-2026)

En los últimos dos años han aparecido productos nuevos que usan
LLMs para generar análisis de personalidad en lenguaje natural.
Ejemplos incluyen aplicaciones que toman diarios personales,
transcripciones de terapia o entradas de journaling y devuelven
"retratos" generados por modelos GPT o Claude. Estos productos son,
en su mayoría, experimentales y presentan dos problemas sistémicos
desde una perspectiva académica. En primer lugar, ninguno reporta
determinismo, robustez o calibración de su modelo; los usuarios
reciben análisis con apariencia autoritaria sin indicadores de
incertidumbre. En segundo lugar, ninguno preregistra sus hipótesis
ni publica cache snapshots reproducibles, lo cual imposibilita
replicación externa.

## 3. Tabla comparativa

| Producto | Base teórica | IA generativa | Trazabilidad metodológica | Validación empírica pública | Open source | Adaptación cultural ES-AR |
|---|---|---|---|---|---|---|
| 16Personalities | MBTI | No | Baja | No publica | No | No |
| Crystal Knows | DISC | Parcial | Baja | No publica | No | No |
| Pattern | MBTI + astrología | Sí | Muy baja | No publica | No | No |
| Truity | Big Five, Enneagram | No | Media | Papers citados | No | No |
| Experimentales LLM 2024-2026 | Variable | Sí | Baja | No publican | Algunos | Escaso |
| **Umbra** | **Jung + Big Five (IPIP-NEO) + Pearson + Positive Computing** | **Sí (Claude)** | **Alta (25 ADRs, KB con citation comments)** | **H1/H2/H3 preregistradas + resultados committeados** | **Sí** | **Voseo rioplatense nativo** |

## 4. Literatura académica relevante

### 4.1 Modelos dimensionales vs tipológicos

La literatura en psicometría contemporánea favorece los modelos
dimensionales (como el Big Five) sobre los tipológicos (como el
MBTI) por razones empíricas: las dimensiones continuas capturan
mejor la realidad estadística de la variabilidad humana y
presentan mayor estabilidad test-retest. Stein y Swan (2019)
realizaron un análisis exhaustivo de la validez construct del
MBTI y documentan que el instrumento presenta problemas sistemáticos
de confiabilidad en las asignaciones de tipo, particularmente en
los cortes cerca de la mediana poblacional. Pittenger (1993) ya
había anticipado estas limitaciones tres décadas antes. Umbra adopta
esta crítica como decisión explícita (ADR-002): utilizar las
funciones cognitivas de Jung directamente, sin pasar por la
tipología MBTI, y apoyarse en la reinterpretación contemporánea
de Sauer (2020) que enmarca dichas funciones como la arquitectura
cognitiva que genera los rasgos Big Five.

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
chat. La validación empírica de este pipeline (hipótesis H3)
constituye, en sí misma, una respuesta al vacío de literatura
publicada sobre la precisión real de los sistemas de safety en
chatbots del mercado actual.

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
discute cómo los hallazgos empíricos de H1, H2 y H3 se alinean o
tensionan con los principios del marco.

### 4.4 Metodología LLM como instrumento

Una línea de trabajo emergente en 2024-2026 ha comenzado a tratar
a los LLMs como instrumentos estadísticos en lugar de oráculos
deterministas. Este enfoque, consistente con el *model = instrument*
framing adoptado en ADR-012 de Umbra, reconoce que un modelo
generativo presenta variabilidad inherente incluso bajo condiciones
controladas (temperatura cero, prompts fijos) y propone reportar
métricas de consistencia como parte del protocolo experimental.
Los hallazgos empíricos de H1 en la presente tesis (capítulo 8)
confirman la necesidad de este framing: el modelo Claude Sonnet 4.6
exhibe variance no trivial en las salidas Jung cuando se lo
ejecuta múltiples veces sobre el mismo texto, aunque sí resulta
determinista para las puntuaciones Big Five.

## 5. Google PAIR — People + AI Guidebook

El *People + AI Guidebook* publicado por el equipo PAIR de Google
constituye la referencia operativa más completa para el diseño de
interfaces de usuario en productos con componentes de IA generativa.
El documento organiza su contenido en seis capítulos temáticos:
(1) User Needs + Success Definition, (2) Data Collection +
Evaluation, (3) Mental Models, (4) Explainability + Trust,
(5) Feedback + Control, y (6) Errors + Graceful Failure. Cada
capítulo articula heurísticas accionables respaldadas por
investigación empírica de equipos de usabilidad.

Umbra adopta explícitamente estas heurísticas como marco de
justificación metodológica para las decisiones de diseño de su
fase 1 (ver ADR-025). En particular, la *confidence surface*
visible en el dashboard responde al capítulo 4 sobre explicabilidad
y confianza, los *pull quotes* y el *sticky TOC* con scroll-spy
responden al capítulo 3 sobre modelos mentales, y el *autonomy
dial* del chat (modo espejo, guía, reto) responde al capítulo 5
sobre feedback y control del usuario. Esta alineación explícita
permite defender cada decisión de interfaz en términos de
heurística establecida y no como preferencia estética.

## 6. Gap que Umbra llena

La revisión del estado del arte revela tres brechas simultáneas
que Umbra intenta cubrir. Primero, ningún producto comercial
combina los tres marcos teóricos que Umbra integra (Big Five
empírico, funciones Jung directas, arquetipos Pearson aplicados y
Positive Computing como marco ético), ni lo hace en voseo
rioplatense con adaptación cultural argentina explícita. Segundo,
ningún producto del mercado comercial reporta hipótesis
preregistradas ni publica sus eval snapshots para replicación
externa; todos son "cajas negras" desde el punto de vista
metodológico. Tercero, la literatura académica sobre LLMs aplicados
a inferencia de personalidad es emergente y carece de protocolos
replicables; Umbra ofrece precisamente esto como contribución
metodológica.

La combinación de estas tres brechas cubiertas convierte a Umbra
en un artefacto doblemente valioso: como producto orientado al
usuario final y como objeto académico auditable, con una base de
código abierta, decisiones arquitectónicas documentadas en 25
ADRs, experimentos reproducibles y una narrativa metodológica
honesta sobre las limitaciones de los instrumentos LLM
contemporáneos.

## Referencias del capítulo

Las referencias bibliográficas completas con formato APA 7ª edición
se encuentran en el capítulo 14 Referencias. Este capítulo cita,
entre otros, a Brooke (1996), Calvo y Peters (2014), Goldberg
(1999), Jung (1921), Pearson (1991), Sauer (2020), Stein y Swan
(2019) y los informes de Brown University (2024) sobre riesgos
éticos en chatbots.
