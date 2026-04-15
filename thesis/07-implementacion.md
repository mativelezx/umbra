# Implementación

<!-- FUENTE PRIMARIA: UMBRA_MASTER_BUILD.md + docs/features/* +
     docs/biz/IMPLEMENTATION_PLAN.md. -->

## 1. Introducción

Este capítulo relata la construcción de Umbra como artefacto de
software. No se trata de una documentación exhaustiva de
implementación (para ello están los documentos de
`docs/features/`), sino de una narrativa académica que explica
cómo se tomaron las decisiones, qué restricciones operaron en
cada momento y cómo el proyecto evolucionó desde la especificación
inicial hasta el estado productivo final. La estructura del
capítulo sigue el orden cronológico aproximado del desarrollo,
distinguiendo dos grandes bloques: el master build inicial (fases
1 a 7) y las fases posteriores específicas del TFG (fases 0 a 6
del plan de implementación).

## 2. Fase de construcción inicial (master build)

El master build, documentado en `UMBRA_MASTER_BUILD.md`, estableció
la especificación completa del producto antes de escribir
código. El documento incluía arquitectura, tipos, schema SQL,
prompts, design tokens, plan de ejecución por fases y checklists
de QA por fase. Este enfoque de "especificación antes de código"
permitió que el desarrollo principal se completara en siete fases
secuenciales, cada una con criterios de aceptación claros y
entregables medibles.

### 2.1 Fase 1 — Scaffolding

La primera fase estableció la estructura base del proyecto Next
14 con App Router, TypeScript strict, Tailwind 3.4, configuración
de `tsconfig`, ESLint, Prettier y convenciones de carpetas. Se
definieron los tokens de diseño custom (`umbra-*`, `violet-*`,
`accent-*`, `text-*`) y las cuatro familias tipográficas
(Instrument Serif, Space Grotesk, Inter, JetBrains Mono).

### 2.2 Fase 1.5 — SSR migration + errores + peppers + testing

Antes de construir features, se consolidó la infraestructura
transversal: migración a `@supabase/ssr` desde el paquete
deprecado `@supabase/auth-helpers-nextjs` (ADR-004), creación de
la jerarquía de errores tipados en `lib/errors.ts`, implementación
del sistema de peppers HMAC versionados (ADR-021), configuración
de vitest como test runner (ADR-009), configuración de Playwright
para E2E y ejecución de la migración 002 con las siete tablas
nuevas y las RPC de rate limiting.

### 2.3 Fase 2 — Auth, consent y Ley 25.326

La segunda fase implementó la ruta de landing pública, el flujo
de registro y login con Supabase Auth, la página bloqueante de
consentimiento (`/consent`) y los endpoints del artículo 13 al 17
de la Ley 25.326: acceso (`/api/account/export`), rectificación
(`/settings/profile`), cancelación (con magic link single-use de
cinco minutos de TTL) y oposición (`/api/account/research-opt-out`).
Esta fase sentó las bases éticas y legales del producto antes
de permitir cualquier procesamiento de datos sensibles.

### 2.4 Fase 3 — Onboarding y análisis

La tercera fase construyó el onboarding conversacional dinámico,
con seis tipos de preguntas (texto libre, multi-choice, escenario,
ranking, polaridad y metáfora) orquestadas por un prompt
conductor en `lib/prompts/onboarding-conductor.ts`. La ruta
`/api/analyze` (Edge runtime, ADR-001) combina los textos del
usuario con los bloques de conocimiento de `lib/knowledge/` y
genera un perfil psicológico completo en dos pasadas (Pass 1 Big
Five + Jung + arquetipo, Pass 2 evidencia textual). El pipeline
de rate limiting atómico (ADR-016, ADR-022) protege el sistema
contra costos descontrolados mediante estimación previa y
reconciliación posterior.

### 2.5 Fase 4 — Dashboard

La cuarta fase implementó el dashboard con el archetype card
como elemento visual primario, narrative section con streaming
SSE, Big Five radar chart (Recharts), ocho barras de funciones
Jung y carta al futuro como hook de retención temporal. La
jerarquía visual prioriza arquetipo y narrativa sobre los
gráficos cuantitativos, siguiendo el principio de que los
usuarios de primera visita necesitan una "historia" antes que
datos.

### 2.6 Fase 5 — Narrative streaming y chat

La quinta fase añadió el streaming progresivo de la narrativa
vía Server-Sent Events y el sistema completo de chat con
pipeline de seguridad. El pipeline de dos etapas (regex
`crisis-lexicon.ts` + clasificador Claude fail-closed en
`classifier.ts`) constituye la pieza más crítica del producto
desde una perspectiva ética. Esta fase también implementó el
guardado de `crisis_events` con observabilidad mediante hashes
salteados (ADR-008), la preservación de turnos asistentes
parciales en caso de fallo de stream y la integración con el
sistema de rate limits.

### 2.7 Fase 6 — Plan de desarrollo y PDF export

La sexta fase generó el plan de desarrollo personal (tres áreas
con acciones y micro-objetivos) y el export a PDF del perfil
mediante `html2pdf.js` client-side (ADR-006). Esta decisión
evitó construir un servicio de rendering server-side, que habría
agregado complejidad operacional sin beneficio proporcional.
También se construyeron las vistas de configuración de cuenta
(`/settings/*`) con los cuatro endpoints de derechos de datos.

### 2.8 Fase 7 — Polish y deploy

La séptima fase cerró el master build con SEO (robots.txt,
sitemap.xml, Open Graph), error boundaries, landing de
configuración, pass de accesibilidad (labels de formulario,
semántica de checkbox, focus management de modales), integración
de Resend para emails de borrado, workflow de CI en GitHub
Actions y configuración de despliegue en Vercel. Al cierre de
esta fase, el producto estaba técnicamente completo y desplegable.

## 3. Fase de validación y refinamiento académico (sesión TFG)

El segundo bloque de desarrollo, ejecutado en una sesión extensa
el 14 de abril de 2026, corresponde al plan de implementación
específico del TFG documentado en
`docs/biz/IMPLEMENTATION_PLAN.md`. Este bloque añadió siete
fases (numeradas 0 a 6, con subfases en la 3 y 4) orientadas a
transformar el producto funcional en un artefacto académicamente
defendible con evidencia empírica.

### 3.1 Fase 0 — Fundación académica

La fase 0 no agregó código de producto, sino documentación
académica vertebrada. Se redactaron ADR-023 (adopción de Branch
B + M3), ADR-024 (hash verbatim del consentimiento), ADR-025
(aplicación de heurísticas PAIR), se creó
`docs/biz/VALIDATION.md` con el plan completo de hipótesis H1,
H2, H3 y protocolo M3, se creó el plan maestro
`docs/biz/IMPLEMENTATION_PLAN.md` con QA Gate estándar y se
actualizó `docs/biz/TFG.md` con la metodología de validación.
Esta fase constituye el andamiaje académico sobre el cual se
ejecutan todas las fases posteriores.

### 3.2 Fase 1 — Aplicación de heurísticas PAIR

La fase 1 reformuló siete mejoras de UX como aplicación explícita
de las heurísticas del *People + AI Guidebook* de Google (ver
capítulo 4 y ADR-025). Las mejoras incluyeron: una *confidence
surface* visible en el dashboard que muestra qué tan seguro
está el análisis (heurística capítulo 4 Explainability + Trust),
*pull quotes* italics destacados dentro de la narrativa
(heurística capítulo 3 Mental Models), *sticky TOC* con
scroll-spy que muestra la sección actual (heurística capítulo 5
Feedback + Control), *InfoPopover* en cada dimensión Big Five y
función Jung que provee definición plain en español, *InsightPing*
colapsable durante el onboarding, *QuickPromptChips* siempre
visibles en el chat (incluso durante la conversación, no solo en
empty state) y acotamiento de ancho de línea a sesenta y cinco
caracteres en la narrativa para optimizar la legibilidad
(Bringhurst, 2005).

### 3.3 Fase 2 — Instrumentación in-app de métricas de usabilidad

La fase 2 añadió instrumentación opt-in para recolectar datos de
usabilidad dentro del producto. Se creó la migración 005 con la
tabla `usability_responses`, un endpoint POST `/api/research/usability`,
una biblioteca `lib/research/instruments.ts` con los cuatro
instrumentos completos (UMUX-Lite, METUX, CUQ, SUS) en español
rioplatense, y un componente `UsabilityPrompt.tsx` que renderiza
el cuestionario con escala Likert de siete puntos. Esta
infraestructura quedó preparada pero no activada en el flujo
principal del producto, a la espera de la decisión futura sobre
cuándo presentar los cuestionarios a los usuarios reales.

### 3.4 Fase 3 — Mejoras estructurales de UX

La fase 3 agregó seis mejoras estructurales de interacción en el
producto:

- **3.1** Progressive disclosure de dos capas en el dashboard,
  ocultando la sección de data visualizations por default hasta
  que el usuario pulse "Ver perfil completo". Reduce carga
  cognitiva inicial y crea un momento de exploración elegida
  (ADR-025, heurística capítulo 3 PAIR).
- **3.2** Integración de framer-motion mediante `LazyMotion` con
  `domAnimation` features tree-shaking (~17 kB gzip), provider
  global `MotionProvider.tsx` y `MotionConfig` con
  `reducedMotion="user"` para respetar preferencias de
  accesibilidad. Animación spring en la expansión del disclosure.
- **3.3** Chat persistente con sidebar de historial. Dos endpoints
  nuevos (`GET /api/chat/conversations` y `GET /api/chat/conversations/[id]`)
  alimentan un componente `ConversationsSidebar.tsx` visible en
  desktop. El usuario puede retomar conversaciones previas,
  iniciar conversaciones nuevas y navegar su historial.
- **3.4** Undo del último turno de onboarding. Nueva ruta
  `/api/onboarding/undo` con helper `undoLastAnsweredTurn` en
  `session-store.ts` permite al usuario revisar su respuesta
  anterior sin perder el progreso anterior.
- **3.5** Link a PDF export desde el dashboard (originalmente la
  feature existía pero no estaba entrada desde la interfaz) y
  fix de tipo `Html2PdfChain` interface que elimina un casting
  `as any` previamente violatorio de la convención estricta del
  proyecto.
- **3.6** Autonomy dial en el chat. Tres modos (espejo, guía,
  reto) seleccionables mediante un radiogroup pequeño arriba
  del chat. El modo seleccionado modifica el system prompt que
  envía el cliente al endpoint del chat, alterando el grado de
  asertividad de Umbra en la respuesta.

### 3.5 Fase 4 — Infraestructura H3 de safety empírica

La fase 4 construyó la infraestructura necesaria para medir
empíricamente el pipeline de detección de crisis. Se creó el
dataset etiquetado `lib/evals/crisis-dataset.ts` con cien casos
distribuidos en cuatro categorías balanceadas, un runner
`lib/evals/crisis-eval.ts` que ejecuta el pipeline contra cada
caso y computa matriz de confusión y métricas derivadas, un
test de integridad `lib/evals/crisis-eval.test.ts` que valida
que el dataset tenga la estructura esperada, y un script
ejecutable `scripts/run-crisis-eval.ts` que corre la evaluación
completa y escribe los resultados en `eval-results/`.

### 3.6 Fase 5 — Infraestructura H1 y H2 y cierres técnicos

La fase 5 agregó la infraestructura para H1 y H2, más varios
cierres técnicos pendientes. Se creó `lib/evals/cases.ts` con el
corpus de cincuenta casos (veinte IPIP, veinte Jung, diez
adversariales),
`lib/evals/consistency.ts` con el runner H1 y
`lib/evals/cross-model-paraphrase.ts` con el runner H2. Los
scripts ejecutables correspondientes están en `scripts/run-h1.ts`
y `scripts/run-h2.ts`. Adicionalmente se ejecutó la migración
004 con el campo `consent_text_hash` y `locale` en
`consent_records` (ADR-024, Ley 25.326 artículo 7), se convirtieron
los diagramas ASCII de `ARCHITECTURE.md` a bloques Mermaid, se
creó el documento `THREAT_MODEL.md` con análisis STRIDE completo
por siete componentes, se integró `@axe-core/playwright` en el
workflow de CI para pruebas automatizadas de accesibilidad, y
se agregó un test de cobertura RLS en `lib/supabase/rls-coverage.test.ts`
que verifica que toda tabla pública creada en migrations tenga
RLS habilitada y al menos una política (o esté listada como
service-role-only de manera explícita).

### 3.7 Fase 4.5 — Materiales para el estudio M3

La fase 4.5 produjo los materiales necesarios para el estudio
think-aloud con usuarios. Se redactaron el protocolo de sesión
minuto a minuto, el formulario de consentimiento informado en
voseo rioplatense (alineado con Ley 25.326 artículos 6 y 7), la
traducción del System Usability Scale al español rioplatense
(manteniendo la estructura de Brooke 1996 pero adaptando la
redacción al registro oral argentino) y tres variantes de copy
de reclutamiento para diferentes canales de comunicación. Los
materiales quedan en `docs/research/` y
`content/consent/research-m3-v1-es-AR.md`, listos para ser usados
cuando el autor ejecute las sesiones reales.

### 3.8 Fase 6 — Esqueleto de la tesis

La fase 6 construyó el esqueleto de dieciséis archivos markdown
numerados en la carpeta `thesis/`, correspondientes a los
capítulos del documento académico. Se incluyó un archivo
`thesis/README.md` con la tabla de mapeo capítulo a fuente
primaria del repositorio, un archivo `thesis/pandoc.yaml` con
metadata y estilo para la compilación a PDF, y un script
`thesis/build.sh` que concatena los capítulos y ejecuta Pandoc
con XeLaTeX. Tres capítulos técnicos (03 Marco teórico, 06
Arquitectura y 08 Validación computacional) fueron drafteados
con asistencia de codex y luego refinados manualmente.

## 4. Gestión del proyecto y herramientas de colaboración

El desarrollo combinó dos herramientas de IA generativa como
asistentes: Claude Code (como IDE agent principal responsable de
editar el código directamente) y OpenAI codex CLI (como segundo
par de ojos para code review independiente y como generador de
drafts de capítulos técnicos de la tesis). Esta combinación
permitió ejecutar auditoría cruzada del código antes de cerrar
cada fase, y delegar tareas de redacción extensa sin sacrificar
supervisión humana final. El uso de codex review detectó, entre
otras cosas, una regresión P1 en el flujo de importación desde
ChatGPT que había pasado inadvertida durante el merge del WIP
inicial; la regresión fue corregida posteriormente y queda
documentada en el capítulo 11 como ejemplo de disciplina de
revisión cruzada.

El control de versiones usó Git con commits atómicos por fase,
cada uno con mensaje descriptivo extenso que incluye la
justificación del cambio y las consecuencias esperadas. Al
cierre del proyecto, el histórico de commits relevantes para el
TFG abarca treinta y dos entradas cronológicas entre la fase 0
y la sincronización final de documentación.

## 5. Deploy a producción

El producto fue desplegado a producción en dos plataformas
cloud. El frontend y las rutas API se alojan en Vercel bajo el
proyecto `umbra` (identificador `prj_8S4KbDfaF0Yl8fLo8qeF8RUUm5wM`),
con la URL pública `https://umbra-sigma.vercel.app`. La base de
datos y el sistema de autenticación se alojan en Supabase
en la región São Paulo (referencia `abhtdinyegnwrnycwsca`). Las
cinco migraciones del esquema SQL están aplicadas en producción
y son verificables mediante `supabase migration list --linked`.

La configuración de variables de entorno en Vercel incluye
quince entradas que cubren las credenciales de Supabase
(URL, anon key, service role key), la API key de Anthropic y
los identificadores de modelo, los cuatro peppers HMAC
versionados, los límites diarios de tokens y costo, y la URL
pública del sitio. La única variable de entorno pendiente es
`RESEND_API_KEY`, necesaria para habilitar el envío real de
magic links en el flujo de borrado de cuenta; su ausencia no
afecta el resto del sistema pero queda documentada como
continuación.

## 6. Convenciones de código mantenidas

El proyecto mantuvo consistencia estricta con las convenciones
establecidas en `CLAUDE.md`: TypeScript strict sin tipos `any`
en el código propio (las únicas excepciones son dependencias
transitivas de librerías sin types bundled, y ese caso específico
se resuelve mediante interfaces locales como `Html2PdfChain`);
Zod en toda frontera de entrada (rutas API, formularios, parsers
de respuestas de Claude); componentes React funcionales con
hooks y props tipadas mediante interfaces; tipos centralizados
en `types/index.ts`; prompts del modelo centralizados en
`lib/prompts/` y nunca inline en componentes o rutas; estilos
Tailwind utility-first con tokens custom en lugar de CSS
tradicional; iconos Phosphor exclusivamente, sin emoji en
interfaces de usuario; y español rioplatense (voseo) en toda
cadena de texto visible al usuario, reservando el español
formal para la prosa académica de la tesis.
