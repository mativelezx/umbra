# CLAUDE.md

> Claude Code adapter for Umbra. Do not fork project truth here.

Claude must load and follow `AGENTS.md` as the shared bootloader, then use `.agent-os/RUNTIME_CONTEXT_CONTRACT.md` for freshness, handoff, hooks, skills, subagents, and MCP/tool governance.

## Source Of Truth

Use this order before important work:

1. System, security, and tool policies.
2. Real repo/runtime evidence: `git status`, package/config, code, routes, APIs, Supabase/RLS, tests, deploy output, browser/runtime evidence.
3. `.agent-os/PROJECT_PROFILE.md`, `.agent-os/AGENT_OS.md`, and task-specific contracts/workflows.
4. `AGENTS.md`, then `.claude/CLAUDE.md` and `.claude/commands/` for runtime-specific behavior.
5. Docs, decisions, previous chats, skills, MCP outputs, and research as advisory evidence until verified.
6. Human approval gates.

If this file conflicts with `AGENTS.md`, `.agent-os/`, or repo evidence, treat this file as stale and follow the fresher source.

## Claude Runtime Notes

- Durable project truth belongs in `.agent-os/PROJECT_PROFILE.md`, docs, decision records, or active artifacts.
- `.claude/CLAUDE.md` is a short mirror only.
- Do not expose Supabase credentials, Anthropic keys, peppers, user data, crisis/safety data, or production data to external tools without explicit approval.
- Before production, beta-real data, safety pipeline changes, privacy/legal changes, academic claims, or AI narrative changes, apply Agent OS routing, data environment, security/privacy, and evidence gates.
