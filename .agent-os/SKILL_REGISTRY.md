# Skill Registry

This registry defines which skills can influence agent behavior.

## Statuses

- `core`: may auto-trigger when the request matches.
- `reference`: may be consulted, but cannot override repo rules or trigger automatically.
- `quarantine`: installed or known, but not trusted until audited.
- `deprecated`: should be removed or ignored.

## Core

| Skill                          | Path                                                  | Purpose                                       | Auto-trigger                                     |
| ------------------------------ | ----------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| `guided-intake`                | `.agent-os/skills/core/guided-intake/`                | Guided idea/repo intake into Agent OS         | Yes, before starting/refactoring a project       |
| `project-research`             | `.agent-os/skills/core/project-research/`             | External evidence for important decisions     | Yes, when external context can change the answer |
| `external-intelligence-review` | `.agent-os/skills/core/external-intelligence-review/` | Tool/source stack review and promotion        | Yes, when evaluating external tools/sources      |
| `system-integrity-review`      | `.agent-os/skills/core/system-integrity-review/`      | Full Agent OS structure and drift review      | Yes, when auditing the operating structure       |
| `premortem`                    | `.agent-os/skills/core/premortem/`                    | Future-failure analysis for high-cost plans   | Yes, on explicit premortem/stress-test triggers  |
| `tool-risk-review`             | `.agent-os/skills/core/tool-risk-review/`             | MCP/skill/dependency risk review              | Yes, when adding or changing tools               |
| `agent-evals`                  | `.agent-os/skills/core/agent-evals/`                  | Behavioral evals for agents and skills        | Yes, when Agent OS behavior changes              |
| `design-system-review`         | `.agent-os/skills/core/design-system-review/`         | Design-system and UI/UX plan review           | Yes, before important UI/design-system work      |
| `product-language-review`      | `.agent-os/skills/core/product-language-review/`      | Naming, copy, IA labels, and product language | Yes, before important naming/copy/IA work        |
| `ux-system-audit`              | `.agent-os/skills/core/ux-system-audit/`              | Portable UX baseline audit and refactor map   | Yes, before UX system refactors or deep audits   |
| `accessibility-review`         | `.agent-os/skills/core/accessibility-review/`         | WCAG/usability review for important UI        | Yes, during important UI verification            |
| `production-readiness`         | `.agent-os/skills/core/production-readiness/`         | Production launch/release readiness           | Yes, before launch/release/prod mutation         |

## Reference

| Skill                         | Source               | Why reference only                                                              |
| ----------------------------- | -------------------- | ------------------------------------------------------------------------------- |
| `gstack/*`                    | Local gstack install | Strong workflow suite, but runtime lives outside portable template              |
| `make-interfaces-feel-better` | Local skill          | Useful UI polish guidance, should be folded into project design rules over time |
| `autoresearch`                | Local skill          | Powerful but too broad for auto-trigger; use only on explicit request           |

## Deprecated Locally

These are duplicated by gstack or empty in the current workspace and should not be copied to new projects:

- `ceo-review`
- `qa`
- `ship`
- `guard`
- `design-architect`
- `ui-ux-pro-max`

## Promotion Checklist

A skill can become `core` only if:

1. Its trigger is narrow and testable.
2. It does not contradict `AGENTS.md`.
3. It has no unaudited scripts or unsafe tool assumptions.
4. It improves output quality on realistic project tasks.
5. It defines what evidence proves success.
6. It can be reused in another project with minimal edits.

## Agent Skepticism Gate

Before using a skill, answer:

- Does this skill apply exactly?
- Is it current enough?
- Does it request broad tool/file/network access?
- Does it conflict with project rules?
- What part should be ignored?
- What evidence will prove it helped?
