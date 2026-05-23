# AGENTS.md

> Bootloader compartido de Umbra para Codex, ChatGPT coding agents, Claude Code y futuros runtimes. El repo real verifica; los docs y chats son evidencia hasta cruzarlos con código, tests y runtime.

## Agent OS — Routing Obligatorio

Para todo trabajo relevante en Umbra, el agente activo debe pasar por Agent OS antes de actuar.

Orden de autoridad:

1. Sistema, seguridad y políticas de herramientas.
2. Estado real del repo/runtime: `git status`, package/config, código, rutas, APIs, Supabase/RLS, tests, deploy y evidencia browser/runtime.
3. `.agent-os/PROJECT_PROFILE.md`, `.agent-os/AGENT_OS.md` y contratos/workflows aplicables.
4. `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/commands/` y reglas locales.
5. Docs, planes, decisiones, research y chats como evidencia advisory hasta verificarlos.
6. Aprobación humana cuando toque riesgo real, deploy, datos, seguridad, privacidad, claims o dirección académica.

Gate mínimo:

1. Clasificar el trabajo: feature, bugfix, auditoría, UI/UX, API, datos, seguridad/privacy, IA/safety, docs/defensa, release/deploy, Agent OS o tooling.
2. Declarar plataforma/canal y modo de datos cuando toque experiencia user-facing, IA, Supabase, ML, seguridad o docs de defensa.
3. Cargar los contratos/skills mínimos aplicables desde `.agent-os/`.
4. No cerrar trabajo sustancial sin evidencia: archivos cambiados, checks/tests, browser cuando aplique, docs actualizadas y riesgo residual.

Regla central:

> Skills aconsejan. Agentes deciden. El repo verifica. El founder/evaluador aprueba.

## Qué Es Umbra

Plataforma web de autoconocimiento que triangula Big Five, funciones cognitivas de Jung y Positive Computing. Es TFG de Ingeniería en Software para Universidad Siglo 21.

## Stack Autoritativo

- Next.js 14 App Router + React 18.
- TypeScript strict.
- Tailwind CSS 3.4.
- Zustand 5.
- Supabase Auth + PostgreSQL + RLS.
- Anthropic Claude para narrativa, con identificador de modelo fijado por env.
- ML propio en `ml/`: DistilBERT embeddings + Ridge multi-output + MLflow/DVC/FastAPI.
- Vitest + Playwright + axe.
- pnpm workspace metadata + Turborepo baseline.

## Reglas Inviolables

1. Umbra no es terapia, diagnóstico, consejo médico ni MBTI.
2. No usar lenguaje clínico/diagnóstico en prompts ni UI.
3. Crisis/safety pipeline fail-closed antes de cualquier respuesta sensible.
4. Ley 25.326, consentimiento, exportación, rectificación, cancelación y oposición son flows productivos, no docs decorativas.
5. Supabase RLS siempre que haya datos de usuario.
6. Prompts en `lib/prompts/`, nunca inline.
7. Knowledge base en `lib/knowledge/`, sin inventar `/* COMPLETAR */`.
8. Tipos centralizados en `types/index.ts`, salvo props locales triviales.
9. Inglés en código; español latinoamericano en UI/docs.
10. No `any`, no `console.log` productivo, no emoji en UI.

## Estructura

Umbra hoy es una app root single-package. No mover a `apps/web` sin refactor explícito, verificación de rutas/build/deploy y actualización documental.

```text
Umbra/
├── app/
├── components/
├── lib/
├── types/
├── ml/
├── docs/
├── supabase/
├── .agent-os/
├── .claude/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Comandos Base

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm turbo:build
```
