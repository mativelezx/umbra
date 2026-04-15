# Trabajo futuro

<!-- FUENTE: docs/biz/IMPLEMENTATION_PLAN.md sección "Scope explícitamente
     FUERA del TFG" + items que surgieron durante la ejecución. -->

> Este capítulo documenta explícitamente los ítems que quedaron fuera
> del scope del TFG pero que forman parte del roadmap natural del
> producto. Incluirlos por escrito cumple dos funciones: (1) protege
> al autor de objeciones del tipo "¿por qué no hiciste X?", (2) deja
> un mapa claro para la continuación del proyecto post-defensa.
>
> **Actualización 2026-04-14**: durante la ejecución completa de
> las fases del plan, varios items originalmente listados como
> "trabajo futuro" fueron efectivamente completados. Esta versión
> del capítulo refleja el estado real al cierre del proyecto: lo
> que quedó pendiente y lo que originalmente era trabajo futuro
> pero ya está hecho.

## Items cerrados durante la ejecución del TFG

Los siguientes items aparecían como trabajo futuro en versiones
anteriores del plan y fueron efectivamente completados durante
la sesión de implementación del 14 de abril de 2026. Se listan
aquí para trazabilidad histórica.

### Completar el corpus H1/H2 a n=50 — **HECHO**

Los casos `ipip-01..17` que quedaban como TODO en
`lib/evals/cases.ts` fueron escritos manualmente por el autor
en commit `65370a5` siguiendo la estructura de los casos ya
draftados por codex. El corpus completo ahora tiene cincuenta
casos distribuidos como preregistrado (20 IPIP, 20 Jung, 10
adversariales).

### Fix del P1 en ChatGPT seed flow — **HECHO**

El bug documentado originalmente en commit `f185d25` fue
efectivamente corregido en commit `791bbdc`. Los cambios
coordinados incluyen `lib/onboarding/session-store.ts` para
persistir el `rawSeedText` en `flags.seedText`,
`app/api/analyze/route.ts` para aceptar `sessionId` opcional y
leer el seed text del flags para prepend al texts array, y
`components/onboarding/DynamicFlow.tsx` para pasar el
`sessionId` en el POST body al endpoint de analyze. Los perfiles
seeded ahora se construyen sobre el corpus completo (retrato
ChatGPT + turnos de refinamiento) en lugar de perderlo
silenciosamente.

### CI test de cobertura RLS — **HECHO**

El script `lib/supabase/rls-coverage.test.ts` fue creado en
commit `9c57109`. Tiene ocho tests que verifican: la migraciones
directory no está vacía, existen tablas foundational, toda tabla
pública tiene `ENABLE ROW LEVEL SECURITY` en las migrations,
toda tabla no listada como service-role-only tiene al menos una
`CREATE POLICY`. Las tres tablas service-role-only
(`crisis_events`, `research_dataset`, `delete_confirmations`)
están listadas explícitamente en el test con referencia a las
ADRs que justifican su configuración.

### Instrumentación UMUX-Lite + METUX in-app — **HECHO** (infraestructura)

Originalmente planeada como fase 2 del IMPLEMENTATION_PLAN.md,
esta instrumentación fue implementada completa en commit
`f3e930d`. Incluye la migración 005 con la tabla
`usability_responses`, tipos en `types/research.ts`, los cuatro
instrumentos completos en `lib/research/instruments.ts`
(UMUX-Lite dos ítems, METUX nueve ítems, CUQ dieciséis ítems,
SUS diez ítems, todos en español rioplatense), el endpoint
Edge POST `/api/research/usability` y el componente
`UsabilityPrompt.tsx` con escala Likert 7. La infraestructura
está lista pero no integrada en el flujo principal del
producto; su activación es una decisión de producto posterior.

### Shipeo a producción — **HECHO** (parcial)

Umbra fue desplegado a Vercel en `https://umbra-sigma.vercel.app`
durante la sesión del 14 de abril. Las cinco migraciones de
Supabase están aplicadas en prod. Lo que queda pendiente: (a)
configurar `RESEND_API_KEY` para habilitar el flujo de magic
link de borrado, (b) definir dominio custom propio en lugar del
subdominio de Vercel, (c) decidir si el producto acepta
registros abiertos o permanece en modo invitación para el TFG.

### UX estructural (framer-motion, disclosure, chat persistente, autonomy dial) — **HECHO**

Todas las subfases de la fase 3 del IMPLEMENTATION_PLAN.md
fueron implementadas durante la sesión del 14 de abril:
disclosure de dos capas en dashboard (commit `e90954a`),
framer-motion con LazyMotion (mismo commit), chat persistente
con sidebar (commit `ced532d`), undo de onboarding (commit
`eceb6c5`), link de PDF export desde dashboard (commit
`a6f97b2`) y autonomy dial en el chat (commit `d012530`).

## Continuaciones pendientes cortas (1-2 semanas)

### Revisión clínica del dataset H3

El dataset de cien casos etiquetados en
`lib/evals/crisis-dataset.ts` fue draft-generado por codex y
revisado por el autor, pero requiere revisión formal por una
persona con criterio clínico (psicólogo, psiquiatra o profesional
con formación en salud mental) antes de considerar H3 como
validación externa completa. La tarea T4.0 del plan de
implementación queda abierta. Si esta revisión produce cambios
significativos en las etiquetas, corresponde re-ejecutar el
experimento H3 sobre el dataset revisado.

### Correr H1 y H2 con corpus completo n=50

Las corridas efectivas de H1 y H2 reportadas en el capítulo 8
usaron un subset reducido de veinticinco casos con tres
iteraciones en lugar de los cincuenta preregistrados con cinco
iteraciones, debido a restricciones de tiempo durante la sesión
de ejecución. El código del runner acepta cualquier tamaño de
corpus, así que basta con ejecutar
`npx tsx scripts/run-h1.ts` (sin flags) para correr el corpus
completo. La corrida tomará aproximadamente setenta y cinco
minutos con Claude Sonnet 4.6 y costará alrededor de cinco a
diez dólares en llamadas a la API.

### Submit del preregistro OSF

El texto completo del preregistro OSF Standard está en
`docs/research/osf/preregistration-standard.md`, listo para
copy-paste en la interfaz de `osf.io/prereg/new`. El submit
efectivo queda pendiente de revisión por parte del director del
TFG y del autor. El DOI resultante debería citarse en el
capítulo 14 Referencias y en el README del repositorio.

### Correr el estudio M3 con usuarios reales

Los materiales del estudio think-aloud (`docs/research/` y
`content/consent/research-m3-v1-es-AR.md`) están completos y
listos para usar. Lo que falta es la ejecución: reclutar ocho a
diez participantes, agendar sesiones de cuarenta minutos,
ejecutarlas con grabación consentida, transcribir las
grabaciones, aplicar análisis temático y completar el capítulo
9 Validación con usuarios con los resultados reales.

## Continuaciones pendientes medianas (1-2 meses)

### Validación con usuarios formal (M1, n≥30)

El TFG adoptó M3 (think-aloud con n=8-10) por riesgo mínimo. Una
continuación natural es un estudio formal con n≥30, reclutamiento
externo, y si la universidad lo requiere, revisión de un comité
de ética institucional. Los instrumentos (SUS en español, METUX,
Chatbot Usability Questionnaire) ya están implementados como
infraestructura, así que la extensión consistiría básicamente
en activar los `UsabilityPrompt` dentro del flujo del producto
y esperar volumen suficiente de respuestas.

### H2 cross-vendor

La limitación `intra-vendor` de ADR-020 (Sonnet + Haiku, misma
familia Anthropic) es la amenaza metodológica más clara al
experimento H2. Una extensión natural es correr H2 cross-vendor
con OpenAI GPT-4 y Meta Llama 3 como rewriters alternativos,
comparando la estabilidad de los scores. Esto requeriría adaptar
`lib/evals/cross-model-paraphrase.ts` para aceptar rewriters
configurables via parámetro y agregar conectores para los otros
proveedores. Como mínimo exigiría credenciales de API para ambos
proveedores y presupuesto adicional.

### Calibración del umbral en H1 y H2

Los umbrales estrictos de H1 (stddev < 2.5) y H2 (max delta <
10) quedaron falsificados en la corrida efectiva. Una
continuación útil es recalibrar los umbrales empíricamente
mediante una corrida piloto más extensa y reportar los valores
observados como "intervalos de confianza del instrumento" en
lugar de umbrales pasa/falla. Esta recalibración transforma la
hipótesis binaria en una caracterización descriptiva del
comportamiento del modelo.

### Resend API key y flow de borrado en producción

El código del flow de borrado con magic link está implementado
y testeado unitariamente, pero requiere una API key de Resend
(`RESEND_API_KEY`) configurada en Vercel para enviar los
emails reales en producción. La integración queda pendiente por
razones de calendario pero no involucra cambios de código
adicionales.

## Continuaciones largas (6+ meses)

### Longitudinal test-retest con usuarios reales

El pattern "mismo usuario, mismo texto, 7 días después → scores
similares" es el estándar dorado de validez test-retest en
psicometría. Requiere consentimiento especial, participación
sostenida y un análisis estadístico distinto (ICC, Cronbach's
alpha temporal). Fuera de scope para TFG pero publicable como
paper continuation.

### MVP público con telemetría opt-in

Si el producto se abre a registros públicos con telemetría
opt-in, permitiría estudios observacionales a escala — pero
abre preguntas complejas de Ley 25.326, escalabilidad de
Claude API y responsabilidad civil si alguien en crisis real
usa el chat. Requiere un análisis de riesgo legal y ético
previo a cualquier decisión.

## Extensiones académicas

### Paper resumen en CLEI / JAIIO

El preregistro OSF + eval suite open-source + committed cache snapshots
hacen a Umbra publicable como conference paper corto (~8-12 páginas)
en CLEI (Conferencia Latinoamericana de Informática) o JAIIO (Jornadas
Argentinas de Informática). El TFG sirve como base para ese paper.

### Comparación con modelos open-source locales

Correr el mismo eval suite contra Llama 3 local permitiría comparar
costo, latencia, y calidad contra Claude sin dependencia de vendor.
Interesante desde una perspectiva de soberanía de datos para productos
de salud mental.
