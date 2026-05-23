---
name: design-system-review
description: 'Review UI/UX plans, design-system changes, designer handoffs, rebrands, app shell/navigation decisions, and important user-facing UI before implementation. Trigger on: design review, design-system review, UI/UX critique, visual consistency, designer handoff, rebrand, tokens, primitives, shell/navigation, sidebar, mobile/iOS UI readiness, or when a feature changes important screens.'
---

# Design System Review

Use this skill before implementing important UI, large visual refactors, app shell/navigation changes, designer handoffs, rebrands, or audit phases that judge design-system coherence.

This is a plan/review skill. It does not replace browser QA or visual screenshots after implementation.

## Inputs

Read only what is needed:

1. `.agent-os/PROJECT_PROFILE.md`
2. `.agent-os/DESIGN_SYSTEM_CONTRACT.md`
3. `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` if naming, labels, copy, metaphors, or AI trust language change
4. `.agent-os/EVIDENCE_REQUIREMENTS.md`
5. Current audit/workflow artifact if the task belongs to an audit
6. Relevant design docs, screenshots, routes, or components for the requested scope

For project-specific products, read the project overlay before judging visual decisions.

## Review Dimensions

Score each dimension from 0 to 10:

| Dimension                | What Good Looks Like                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| User flow clarity        | The user understands what this screen/module is for and what to do next.                                     |
| Information architecture | Navigation, hierarchy, and grouping match the product mental model.                                          |
| Product language         | Labels, CTAs, states, metaphors, and AI trust language follow the product-language contract.                 |
| Visual hierarchy         | Type, spacing, surfaces, and emphasis create a readable order.                                               |
| Token fit                | Colors, type, spacing, radius, shadow, motion, and state styling use approved tokens.                        |
| Primitive fit            | Buttons, cards, forms, tables, nav, empty/loading/error states use shared primitives.                        |
| Shell/navigation fit     | Top-level navigation, sidebar/rail/tab/topbar, overlays, and local actions are consistent.                   |
| Accessibility            | Contrast, focus, keyboard, labels, touch targets, reduced motion, and recovery states are covered.           |
| Platform readiness       | Desktop, mobile web, PWA, iOS/native, Android/native, or other targets are handled or explicitly scoped out. |
| Rebrand readiness        | A designer can change brand choices centrally without rewriting screens.                                     |
| Evidence plan            | Screenshots, Playwright/browser QA, accessibility checks, docs updates, and decision records are defined.    |

## Output Format

```md
Status: pass | warn | fail

Scores:
| Dimension | Score | Why |
| --------- | ----- | --- |

Critical gaps:

1. ...

Design decisions needed:

1. ...

Revised plan:

1. ...

Implementation guardrails:

- Tokens:
- Primitives:
- Shell/navigation:
- Accessibility:
- Platform/mobile/native:
- QA evidence:
- Docs/decision sync:

Rerun needed:

- Phase/workflow impact:
- Why:
```

## Rules

- Be direct. A pretty plan that cannot be maintained is not a good plan.
- Do not invent a new visual language when a project design system exists.
- Do not copy proprietary layouts, copy, assets, or screenshots from references.
- References such as Mobbin/Movi/Figma provide principles and constraints; the repo owns implementation.
- For naming, navigation labels, CTAs, metaphors, and AI trust language, apply `product-language-review` or `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`.
- If the project has no designer or design source, mark the design source as provisional and require a minimal token/primitive contract before large UI work.
- If the review changes product scope, public positioning, brand identity, platform targets, or beta inclusion, require founder approval.
- If a screen needs implementation after review, hand off to normal feature execution and verify with browser/Playwright evidence.
