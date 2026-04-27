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
capítulo sigue el orden cronológico aproximado del desarrollo: la
fase web inicial (scaffolding, autenticación, consentimiento,
onboarding, dashboard, narrativa, chat con guardrails, plan,
export y polish) y los sprints del módulo analítico propio que se
ejecutan en paralelo según el cronograma del TFG.

## 2. Fase web inicial

La fase web inicial, documentada en `UMBRA_MASTER_BUILD.md`,
estableció la especificación completa del frontend antes de
escribir código. El documento incluyó arquitectura, tipos, schema
SQL, prompts, design tokens, plan de ejecución por fases y
checklists de QA por fase. Este enfoque de "especificación antes
de código" permitió que el desarrollo principal del frontend se
completara en siete fases secuenciales, cada una con criterios de
aceptación claros y entregables medibles.

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
usuario, invoca al módulo analítico propio para inferir las
dimensiones Big Five (ADR-026) y luego delega a la capa narrativa
la lectura interpretativa de funciones cognitivas Jung y arquetipo
Pearson a través de `lib/prompts/interpret-narrative.ts`. El
pipeline de rate limiting atómico (ADR-016, ADR-022) protege el
sistema contra costos descontrolados mediante estimación previa y
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

## 3. Sprints del módulo analítico

En paralelo a la fase web inicial, el cronograma del TFG (TP1
ya entregado, TP2 el 17 de mayo, TP3 el 7 de junio, TP4 el 28 de
junio) prevé tres sprints específicos del módulo analítico
propio (`ml/`).

### 3.1 Sprint ML 1 — Datasets + baseline

El primer sprint prepara los corpus de entrenamiento. El corpus
Essays (Pennebaker & King 1999) se obtiene por acceso académico y
se versiona localmente con DVC. El corpus latinoamericano propio
(ADR-028) se construye con asistencia de IA generativa, dirigido
por un prompt explícito que especifica una dimensión Big Five
target con dirección alta o baja, y se valida manualmente contra
una rúbrica documentada. La unión de ambos corpus se particiona
en train/val/test 80/10/10 con seed determinístico
(`SEED=42`). Como línea base, se entrena un Ridge multi-output
sobre representaciones TF-IDF para tener referencia.

### 3.2 Sprint ML 2 — Embeddings DistilBERT + Ridge

El segundo sprint extrae embeddings DistilBERT base multilingual
cased (Sanh et al. 2019) en modo *frozen* sobre la unión de
ambos corpus, sin fine-tuning. El vector CLS de 768 dimensiones
alimenta cinco regresores Ridge (Hoerl & Kennard 1970)
entrenados independientemente, uno por dimensión Big Five, con
`GridSearchCV` para tunear el hiperparámetro `alpha`. El
experimento se registra en MLflow con métricas (MSE, R², r) por
dimensión y los regresores se serializan en `ml/models/*.joblib`.

### 3.3 Sprint ML 3 — Validación + serving

El tercer sprint calcula y consolida las métricas finales sobre
el split test, estratificadas en los bloques `english_only`,
`latinoamericano_only` y `combined`. Las dimensiones que no
alcanzan los umbrales mínimos R² > 0.20 y r > 0.30 sobre el
bloque `latinoamericano_only` se marcan
`per_dimension_status: "low_confidence"` (ADR-027) y se reportan
honestamente en `eval_metrics.json`. Adicionalmente, este sprint
levanta el servicio FastAPI (`ml/src/api_server.py`) y verifica
la integración con el frontend Next.js a través de
`lib/ml-client.ts`.

## 4. Cierres técnicos transversales

Adicionalmente al desarrollo principal, se ejecutaron varios
cierres técnicos relevantes para la defensa académica:

- **Migration 004** (ADR-024, Ley 25.326 art. 7): agrega los
  campos `consent_text_hash` (SHA-256 verbatim) y `locale` a la
  tabla `consent_records`, con la actualización correspondiente
  de `app/api/consent/route.ts`.
- **Diagramas Mermaid** en `docs/tech/ARCHITECTURE.md` para
  topología, dependency graph y data flow.
- **Threat model STRIDE** en `docs/tech/THREAT_MODEL.md` por
  siete componentes (middleware, Edge routes, Node routes,
  Supabase, proveedor LLM externo, cliente, pipeline de crisis).
- **axe-core en CI** (`@axe-core/playwright`) para pruebas
  automatizadas de accesibilidad sobre las páginas principales.
- **Test de cobertura RLS** (`lib/supabase/rls-coverage.test.ts`)
  que verifica que toda tabla pública creada en migrations tenga
  RLS habilitada y al menos una política (o esté listada como
  service-role-only).
- **Materiales del estudio de usabilidad** SUS para TP3/TP4 en
  `docs/research/`, incluyendo el protocolo de sesión, copy de
  reclutamiento, cuestionario SUS adaptado al español
  latinoamericano y consentimiento informado con líneas de ayuda
  de salud mental argentinas.

## 5. Gestión del proyecto

El control de versiones usó Git con commits atómicos por unidad
de trabajo, cada uno con mensaje descriptivo que incluye la
justificación del cambio y las consecuencias esperadas. Las
decisiones arquitectónicas significativas se documentan como
Architecture Decision Records (Nygard 2011) en
`docs/DECISIONS.md`. El cronograma se ajusta al calendario
oficial del TFG: TP1 entregado, TP2 el 17 de mayo, TP3 el 7 de
junio, TP4 el 28 de junio, defensa en agosto/septiembre.

## 6. Deploy a producción

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

## 7. Convenciones de código mantenidas

El proyecto mantuvo consistencia estricta con las convenciones
establecidas en `CLAUDE.md`: TypeScript strict sin tipos `any`
en el código propio (las únicas excepciones son dependencias
transitivas de librerías sin types bundled, y ese caso específico
se resuelve mediante interfaces locales como `Html2PdfChain`);
Zod en toda frontera de entrada (rutas API, formularios, parsers
de respuestas de la capa narrativa); componentes React funcionales con
hooks y props tipadas mediante interfaces; tipos centralizados
en `types/index.ts`; prompts del modelo centralizados en
`lib/prompts/` y nunca inline en componentes o rutas; estilos
Tailwind utility-first con tokens custom en lugar de CSS
tradicional; iconos Phosphor exclusivamente, sin emoji en
interfaces de usuario; y español latinoamericano (voseo) en toda
cadena de texto visible al usuario, reservando el español
formal para la prosa académica de la tesis.
