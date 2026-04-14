# Trabajo futuro

<!-- FUENTE: docs/biz/IMPLEMENTATION_PLAN.md sección "Scope explícitamente
     FUERA del TFG (Trabajo Futuro)". -->

> Este capítulo documenta explícitamente los ítems que quedaron fuera
> del scope del TFG pero que forman parte del roadmap natural del
> producto. Incluirlos por escrito cumple dos funciones: (1) protege
> al autor de objeciones del tipo "¿por qué no hiciste X?", (2) deja
> un mapa claro para la continuación del proyecto post-defensa.

## Continuaciones cortas (1-2 semanas c/u)

### Completar el corpus H1/H2 a n=50

Cases `ipip-01..17` quedan como TODO en
[`lib/evals/cases.ts`](../lib/evals/cases.ts). El draft de codex truncó
esas entradas por límite de output. Una vez completadas, re-correr H1
y H2 y actualizar los resultados reportados en capítulo 08.

### Fix del P1 en ChatGPT seed flow

Documentado en commit `f185d25`. El raw text pasted por el usuario no
se propaga al analizador final, lo que degrada la calidad del perfil
seeded. Fix requiere ~6 cambios coordinados (session-store,
OnboardingNextResponse, route envelope, Zustand store, DynamicFlow,
serialize helper).

### CI test de cobertura RLS

Documentado como amenaza residual en
[`docs/tech/THREAT_MODEL.md`](../docs/tech/THREAT_MODEL.md) sección
4. Script que parsea todas las migrations y falla si alguna tabla
nueva no tiene `ENABLE ROW LEVEL SECURITY` + al menos una policy.

## Continuaciones medianas (1-2 meses c/u)

### Validación con usuarios formal (M1, n≥30)

El TFG adoptó M3 (think-aloud con n=8-10) por riesgo mínimo. Una
continuación natural es un estudio formal con n≥30, reclutamiento
externo, y — si la universidad lo requiere — revisión de un comité
de ética institucional. Los instrumentos (SUS en español, METUX,
Chatbot Usability Questionnaire) ya están identificados en
[`docs/biz/VALIDATION.md`](../docs/biz/VALIDATION.md).

### Instrumentación UMUX-Lite + METUX in-app

Originalmente en Fase 2 del IMPLEMENTATION_PLAN.md, fue movida a
trabajo futuro por ADR-023. Permitiría recolectar datos de usabilidad
continua vía opt-in dentro del producto — un "Branch A lite" sin
comité de ética si el producto se shipea a producción.

### H2 cross-vendor

La limitación `intra-vendor` de ADR-020 (Sonnet + Haiku, misma familia
Anthropic) es la amenaza metodológica más clara. Una extensión natural
es correr H2 cross-vendor con OpenAI GPT-4 + Meta Llama 3 como
rewriters alternativos, comparando la estabilidad de los scores.

### UX estructural (framer-motion, disclosure, chat persistente, autonomy dial)

Fases 3 y 2 del IMPLEMENTATION_PLAN.md fueron cortadas del TFG. Cada
item tiene su ADR planeado en el plan maestro. El research de UX del
research inicial los mapea a heurísticas PAIR.

## Continuaciones largas (6+ meses)

### Longitudinal test-retest con usuarios reales

El pattern "mismo usuario, mismo texto, 7 días después → scores
similares" es el estándar dorado de validez test-retest en psicometría.
Requiere consentimiento especial, participación sostenida, y un análisis
estadístico distinto (ICC, Cronbach's alpha temporal). Fuera de scope
para TFG pero publicable como paper continuation.

### Shipeo a producción + analytics real

Umbra no se desplegó a producción pública durante el TFG. Un MVP público
con telemetría opt-in permitiría estudios observacionales a escala —
pero abre preguntas complejas de Ley 25.326, escalabilidad de Claude
API, y responsabilidad civil si alguien en crisis real usa el chat.

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
