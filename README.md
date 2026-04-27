# Umbra

Plataforma de autoconocimiento basada en Big Five (IPIP-NEO) + funciones cognitivas Jung + Positive Computing, en español latinoamericano. TFG de Ingeniería en Software, Universidad Siglo 21.

**Producción**: https://umbra-sigma.vercel.app
**Status**: deployed, migraciones 001-006 documentadas, módulo ML propio en `ml/` con pipeline reproducible, QA risk mitigation y readiness de defensa documentados.

**Docs clave**: [Defense readiness](docs/DEFENSE_READINESS.md), [QA risk mitigation](docs/QA_RISK_MITIGATION.md), [Dataset expansion](ml/DATASET_EXPANSION.md), [Database schema](docs/tech/DATABASE.md).

## Lo que hace Umbra

1. **Onboarding**: el usuario escribe sobre sí mismo (guiado en 5 áreas, o texto libre, o flujo dinámico conducido).
2. **Análisis**: arquitectura híbrida de dos capas:
   - **Capa analítica propia** — módulo ML en `ml/` (DistilBERT base multilingual cased congelado + Ridge multi-output) infiere las 5 dimensiones Big Five con métricas reportables (MSE, R², r) por dimensión y `per_dimension_status: "ok" | "low_confidence"` (ADR-026, ADR-027).
   - **Capa narrativa** — proveedor externo de IA generativa con identificador de modelo fijado produce la lectura interpretativa: 8 funciones cognitivas Jung (1921, lectura, no medida — ADR-002), arquetipo Pearson (1991, 6 fijos, ADR-007), retrato escrito y plan de desarrollo.
3. **Narrativa**: 800-1200 palabras en voseo argentino, streameada vía SSE, escrita como un mentor que te conoce.
4. **Dashboard**: arquetipo con SVG custom, Big Five radar, 8 Jung function bars, carta al futuro.
5. **Chat con safety pipeline crítica**: banner permanente "no es terapia" + regex lexicon + idiom pre-filter de expresiones argentinas + classifier fail-closed + crisis card con recursos argentinos (135, 911, Salud Mental Responde, Centros de Salud Mental Comunitaria). 45 min session timeout. Rate limits atómicos.
6. **Plan de desarrollo**: 3 áreas con acciones y micro-objetivos chequeables.
7. **PDF export**: informe imprimible con print-safe stylesheet.
8. **Ley 25.326 compliance**: 5 mecanismos técnicos — consentimiento informado bloqueante con SHA-256 del texto verbatim (ADR-024), exportación integral, rectificación, cancelación con magic link single-use, oposición al tratamiento con fines de investigación.
9. **Carta al futuro**: al final del onboarding, el usuario le escribe a su vos de 180 días. Se desbloquea sola.

## Stack

### Web
- **Next.js 14.2.35** (App Router, Edge + Node runtimes)
- **TypeScript strict**
- **Tailwind CSS 3.4** con tokens custom (`umbra-*`, `violet-*`, `accent-*`, `text-*`)
- **Supabase** (Auth + PostgreSQL + RLS) via `@supabase/ssr`
- **Anthropic Claude** como proveedor externo de IA generativa para la capa narrativa, identificador de modelo fijado por `ANTHROPIC_MODEL_ID`
- **Zustand 5** para stores de cliente
- **Recharts** para el radar chart
- **framer-motion** con `LazyMotion` + `domAnimation` tree-shaking (~17kb gzip)
- **Phosphor Icons** (nunca emoji en UI)
- **html2pdf.js 0.14.0** client-side para export
- **Zod** para validación en todo boundary
- **Vitest** para unit tests
- **Playwright** + `@axe-core/playwright` para E2E + a11y automatizada

### Módulo analítico (`ml/`)
- **Python** + **Hugging Face Transformers** (Wolf et al. 2020) para cargar DistilBERT (Sanh et al. 2019) y extraer embeddings congelados.
- **scikit-learn** (Pedregosa et al. 2011) para Ridge multi-output.
- **MLflow** (Zaharia et al. 2018) tracking de experimentos.
- **Data Version Control (DVC)** para versionado de datasets y artefactos.
- **FastAPI** para servir el endpoint de inferencia.
- **joblib** para serializar el regresor.
- **GitHub Actions** verifica métricas mínimas en CI (`.github/workflows/ml-validate.yml`).

## Setup local

### 1. Dependencias del frontend

```bash
npm install
```

### 2. Env vars

Copiá `.env.local.example` a `.env.local` y completá con keys reales. Las variables relevantes son las credenciales de Supabase, la API key de Anthropic, los identificadores de modelo, los cuatro peppers HMAC versionados (`CONSENT_IP_PEPPER_V1`, `CRISIS_PEPPER_V1`, `RESEARCH_PEPPER_V1`, `DELETE_TOKEN_PEPPER_V1`), los caps de presupuesto diario, la URL pública del sitio, y `ML_API_URL` apuntando al módulo analítico (por defecto `http://localhost:8000`).

### 3. Supabase migrations

En el SQL Editor del dashboard de Supabase, correr en orden, o usar `supabase db push --linked --include-all`:

1. `supabase/migrations/001_initial_schema.sql` (tablas base + RLS)
2. `supabase/migrations/002_core_tables.sql` (7 tablas nuevas + charge_rate_limit RPC + RLS)
3. `supabase/migrations/003_onboarding_sessions.sql` (onboarding_sessions table con flags JSONB + RLS)
4. `supabase/migrations/004_consent_text_hash.sql` (ADR-024: consent_text_hash + locale en consent_records)
5. `supabase/migrations/005_usability_responses.sql` (tabla `usability_responses` para SUS in-app)
6. `supabase/migrations/006_enable_pg_cron_purges.sql` (retención 30 días para payloads sensibles y limpieza de tokens)

### 4. Módulo analítico (`ml/`)

```bash
cd ml
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
make all          # prepare_data → baseline → train → evaluate
make serve        # FastAPI en localhost:8000
```

Detalle completo en [`ml/README.md`](ml/README.md).

### 5. Ejecutar la web

```bash
npm run dev           # Dev server en http://localhost:3000
npm run typecheck     # tsc --noEmit
npm run lint          # next lint
npm run test          # Vitest units
npm run build         # Production build
npm run test:e2e      # Playwright E2E (requiere dev server)
```

### 6. Demo mode (sin backend)

```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

Esto seedea un perfil, una narrativa de 800+ palabras en latinoamericano, un plan de 3 áreas, y una carta al futuro archivada. El middleware saltea el consent gate y la UI carga todo desde `lib/demo/seed.ts`.

## Flujo de usuario completo

```
/ (landing)
  → /register
    → /consent (Ley 25.326 form blocking)
      → /onboarding (mode selector → guided/freetext/dynamic flow)
        → /api/analyze (Edge)
            → módulo ML propio: Big Five inferido por DistilBERT+Ridge
            → capa narrativa (proveedor externo): Jung + arquetipo + retrato
              → progressive load animation
                → carta al futuro opcional
                  → /dashboard
                    ├─ archetype card (custom SVG + name + secondary)
                    ├─ narrative section (SSE streaming, Instrument Serif)
                    ├─ Big Five radar chart con `per_dimension_status`
                    ├─ 8 Jung function bars (lectura interpretativa)
                    └─ carta al futuro (locked/unlocked)
                      ├─ /chat (crisis pipeline + IA contextualizada)
                      ├─ /plan (3 areas + micro-goal checkboxes)
                      └─ /export (client-side html2pdf)

Settings:
  /settings                  — landing con 4 entries
  /settings/profile          — editar nombre
  /settings/export           — descargar JSON con todos tus datos
  /settings/research-opt-out — toggle modo investigación
  /settings/delete           — magic link 5min single-use → cascade delete
```

## Architecture highlights

### Arquitectura híbrida (módulo ML + capa narrativa)
La capa cuantitativa Big Five se infiere por el módulo ML propio en `ml/`
(DistilBERT congelado + Ridge multi-output) — código Python, servido como
API HTTP por FastAPI, consumido desde Next.js via
[`lib/ml-client.ts`](lib/ml-client.ts). La capa narrativa (Jung como
lectura interpretativa, arquetipo Pearson, retrato y plan) se delega a un
proveedor externo de IA generativa con identificador de modelo fijado.
Ver [docs/tech/ARCHITECTURE.md](docs/tech/ARCHITECTURE.md) y ADR-026.

### Chat safety pipeline (`lib/chat/`)
Tres capas en serie para cada mensaje:
1. **Regex lexicon** (`crisis-lexicon.ts`): idiom pre-filter + patrones de crisis. Zero-latency. No puede ser bypasseado por prompt injection porque corre antes de la IA generativa.
2. **Classifier de la capa narrativa** (`classifier.ts`): solo corre si regex hit o sampling. **Fail-closed**: cualquier error → trata como crisis.
3. **Hard block**: si detectó crisis, **NO llama a la IA generativa**, retorna 451 con recursos, loggea `crisis_event` con `user_hash + message_hash` (nunca texto plano).

### Rate limiting (`lib/claude/pricing.ts` + `charge_rate_limit` RPC)
Atómico via Supabase RPC con `FOR UPDATE` lock y `SECURITY DEFINER` + `SET search_path` hardening. Estimate + reconcile en finally block — si la API externa falla, el usuario no paga tokens.

### HMAC peppers (`lib/security/peppers.ts`)
Web Crypto API (Edge-compatible). 4 peppers version-pinned (CRISIS, RESEARCH, CONSENT_IP, DELETE_TOKEN). Rotación migration-free vía `pepper_version` column en cada tabla.

### Knowledge base (`lib/knowledge/`)
4 archivos con contenido académico real:
- `big-five.ts` — IPIP-NEO (Goldberg 1999, public domain)
- `jung-functions.ts` — Tipos Psicológicos (Jung 1921), insumo narrativo
- `archetypes.ts` — Pearson applied system (1991), insumo narrativo
- `positive-computing.ts` — Calvo & Peters (2014), guardrails de tono

Cada item tiene citation block JSDoc (`@source`, `@reference`, `@page_or_section`, `@verbatim`). Enforceable con CI linter.

## Documentation

Todo en `docs/`:

- [`docs/PLAN.md`](docs/PLAN.md) — entry point, status dashboard
- [`docs/SYSTEM_SPEC.md`](docs/SYSTEM_SPEC.md) — system specification
- [`docs/API_MAP.md`](docs/API_MAP.md) — todas las routes con schemas
- [`docs/FEATURE_MAP.md`](docs/FEATURE_MAP.md) — inventory con state matrix
- [`docs/PROMPT_ARCHITECTURE.md`](docs/PROMPT_ARCHITECTURE.md) — prompts + KB injection
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — ADRs (módulo ML, RLS, peppers, consent text hash, etc.)
- [`docs/biz/`](docs/biz/) — documentación de negocio/académica:
  - [`TFG.md`](docs/biz/TFG.md) — estructura de tesis + cronograma + defensa
  - [`VALIDATION.md`](docs/biz/VALIDATION.md) — plan de validación (métricas ML por dimensión + a11y axe + unit + E2E + SUS Brooke 1996 n=8-15 en TP3/TP4)
  - [`ETHICS.md`](docs/biz/ETHICS.md) — Helsinki + Calvo & Peters
  - [`LEGAL.md`](docs/biz/LEGAL.md) — Ley 25.326 con consent_text_hash
  - [`MARKET.md`](docs/biz/MARKET.md) — competitive landscape
  - [`IMPLEMENTATION_PLAN.md`](docs/biz/IMPLEMENTATION_PLAN.md) — plan operativo
- [`docs/features/`](docs/features/) — feature specs detallados
- [`docs/tech/`](docs/tech/) — deep-dives:
  - [`ARCHITECTURE.md`](docs/tech/ARCHITECTURE.md) — topología con diagramas Mermaid
  - [`THREAT_MODEL.md`](docs/tech/THREAT_MODEL.md) — STRIDE por componente
  - [`CHAT_SAFETY.md`](docs/tech/CHAT_SAFETY.md) — pipeline de crisis
  - `DATABASE.md`, `AUTH.md`, `RATE_LIMITING.md`, `SECURITY.md`, `EVALS.md`, `OBSERVABILITY.md`
- [`docs/research/`](docs/research/) — materiales para el estudio de usabilidad SUS:
  - `usability-protocol.md` — guion minuto a minuto de sesiones
  - `usability-recruitment.md` — copy de reclutamiento
  - `sus-spanish-latinoamericano.md` — cuestionario SUS adaptado
- [`thesis/`](thesis/) — esqueleto de la tesis con 16 capítulos + Pandoc build
- [`ml/`](ml/) — módulo analítico propio (Python, DistilBERT + Ridge + MLflow + DVC + FastAPI)

## Prohibiciones (CLAUDE.md)

- NO MBTI. Usamos funciones Jung directamente como lectura narrativa.
- NO lenguaje diagnóstico ni clínico.
- NO `console.log` en producción (salvo structured JSON logs).
- NO `any` en TypeScript.
- NO prompts inline. Siempre en `lib/prompts/`.
- NO emoji en UI. Phosphor Icons.
- NO olvides rotar peppers cuando sospeches compromise.

## Licencia

TFG académico. Código open-source. El contenido de la knowledge base cita fuentes públicas (IPIP-NEO, Jung, Pearson, Calvo & Peters) — la knowledge base en sí está bajo la misma licencia que el código.

---

**Umbra no es terapia.** Si estás en crisis: 135 (Argentina) · 911 · Salud Mental Responde · Centros de Salud Mental Comunitaria.
