---
name: product-language-review
description: 'Review naming, product terminology, navigation labels, metaphors, UX writing, AI trust language, landing copy, onboarding copy, and docs/code/UI language drift before important product or UI work. Trigger on: naming, copy, narrative, product language, metaphor, information architecture labels, app module names, landing copy, onboarding copy, rebrand wording, or whether a term is SaaS-aligned.'
---

# Product Language Review

Use this skill before implementing or approving important naming, copy, navigation, onboarding, landing, AI trust-language, or brand/metaphor decisions.

This is a review/planning skill. It does not replace user testing, browser QA, accessibility review, or docs sync after implementation.

## Inputs

Read only what is needed:

1. `.agent-os/PROJECT_PROFILE.md`
2. `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md`
3. `.agent-os/UX_RESEARCH_AND_FLOW_CONTRACT.md`
4. `.agent-os/DESIGN_SYSTEM_CONTRACT.md`
5. Current audit/workflow artifact if the task belongs to an audit
6. Relevant visible UI copy, routes, docs, analytics/E2E labels, or brand notes

Use current external research when outside context can change the decision.
Use Mobbin/reference products only for transformed principles, never copied copy/screens/layouts/assets.

## Review Dimensions

Score each dimension from 0 to 10:

| Dimension               | What Good Looks Like                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Clarity                 | A new user can predict the destination/action/outcome without a glossary.            |
| Task fit                | The term maps to the actual user job and flow stage.                                 |
| SaaS/product fit        | The language feels like usable software, not only brand poetry.                      |
| Distinctiveness         | The product still feels ownable, not generic or copied.                              |
| System consistency      | UI, docs, code concepts, events, E2E labels, support language, and onboarding agree. |
| AI trust/control        | AI/data/provider/source/fallback/review language is clear where relevant.            |
| Accessibility/testing   | Labels can be spoken, searched, tested, and translated without ambiguity.            |
| Legal/claim safety      | Claims are accurate, defensible, and do not imply guarantees.                        |
| Portability/rebrand fit | Future projects/designers can adapt the language without hidden project mythology.   |
| Evidence plan           | Research, user test, Mobbin/reference principle, screenshots, docs sync are defined. |

## Output Format

```md
Status: pass | warn | fail

Decision:

Scores:
| Dimension | Score | Why |
| --------- | ----- | --- |

Term scorecard:
| Term | Clarity | Distinctiveness | Risk | Decision | Replacement / role |
| ---- | ------- | --------------- | ---- | -------- | ------------------ |

Recommended language architecture:

- Primary navigation:
- Page titles:
- Core objects:
- Core actions:
- AI trust language:
- Brand/metaphor layer:
- Terms to promote:
- Terms to downgrade:
- Terms to avoid:

Before / after examples:

Implementation guardrails:

- UI:
- Docs:
- Code/internal names:
- Analytics/E2E/a11y:
- AI/source/fallback:
- Research/Mobbin:

Founder decisions needed:

Rerun needed:
```

## Rules

- Be direct. A memorable term that blocks comprehension is not good product language.
- Functional labels win for navigation, CTAs, errors, forms, accessibility labels, E2E, and support.
- Brand/metaphor terms are allowed only when paired with a plain-language fallback or when they are not operational.
- AI product copy must explain source, uncertainty, control, approval, fallback, and recovery where relevant.
- Do not treat old docs or chat decisions as canonical until reconciled with screens/code.
- If the naming decision affects public positioning, category, activation, pricing, legal claims, or beta scope, require founder approval.
- If the review changes UI work, hand off to normal feature execution and verify with browser/Playwright/accessibility evidence.
