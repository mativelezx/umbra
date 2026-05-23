# Umbra — Claude Code Mirror

@../AGENTS.md
@../.agent-os/RUNTIME_CONTEXT_CONTRACT.md

This file is a Claude runtime mirror only. The shared bootloader is `AGENTS.md`; durable operating context lives in `.agent-os/PROJECT_PROFILE.md`.

## Critical Reminders

- Umbra is not therapy, diagnosis, medical advice, or MBTI.
- Do not use diagnostic/clinical language in prompts or UI.
- Prompts live in `lib/prompts/`; no inline prompts in routes/components.
- Knowledge blocks live in `lib/knowledge/`; do not invent missing theory content.
- Types stay centralized in `types/index.ts` unless the type is a trivial local prop.
- Validate boundaries with Zod and keep Supabase RLS/privacy flows intact.
- No `any`, no production `console.log`, no emoji in UI.

## Standard Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
