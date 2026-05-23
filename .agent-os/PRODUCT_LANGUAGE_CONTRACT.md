# Product Language Contract

> Portable contract for naming, navigation labels, product terminology, metaphors, UX writing, AI trust language, and documentation sync.

Use this during project bootstrap, brand/narrative decisions, UX/UI audits, onboarding or navigation changes, landing/copy work, important user-facing features, AI product behavior changes, designer handoffs, rebrands, and post-audit documentation sync.

## Principle

Product language is architecture.

Names, labels, CTAs, empty states, errors, AI status messages, docs, events, and E2E labels shape how users understand the product. They must be governed like routes, tokens, schemas, and APIs.

Core rule:

> Functional language first. Concrete outcome always. Brand or metaphor only when it adds memory without slowing the task.

Portable UX language rule:

> Brand voice lives in the wrapper, never in the work.

Daily test:

> Would Linear ship this copy in this exact surface?

## Surface Level Taxonomy

Use this taxonomy before naming, navigation, CTA, state, empty, onboarding, AI, billing, legal, or error copy decisions.

| Level | Surface | Language rule |
| --- | --- | --- |
| 0 | Auth, billing, legal, privacy, permissions, destructive actions, source labels, errors, production status, data/fallback labels | Functional only. No metaphor. No hidden risk. |
| 1 | Primary navigation, CTAs, forms, settings, repeated workflow controls, filters, tables, queues, status chips | Functional first. Optional flavor only in secondary helper copy. |
| 2 | Onboarding, empty states, transitional states, success states, feature help | Personality after value, truth, and next step. |
| 3 | Landing, editorial, reports, emails, brand campaigns, social/share surfaces | Brand voice allowed, but concrete value and claim safety stay visible. |

Rules:

- Metaphor cannot be the only operational label in Level 0 or Level 1.
- CTAs use verb + object.
- AI/source/data language must explain source, freshness, confidence or limit, review state, and recovery before any personality.
- Banned words and metaphor systems require founder approval before becoming product rules.

## Why This Exists

Small teams often drift into three failure modes:

1. **Founder mythology becomes navigation.** Internal metaphors become labels the user has to decode.
2. **Docs and UI split.** Docs call a thing one name, screens call it another, code calls it a third.
3. **AI products sound magical instead of trustworthy.** The copy hides source, uncertainty, fallback, control, recovery, and human approval.

This contract prevents those failures before a product scales.

## Required Inputs

Read or create:

```md
Project category:
Primary user:
Primary user vocabulary:
Primary problem:
Activation event:
Top-level modules/navigation:
Core product objects:
Core user actions:
AI/provider behavior visible to user:
Business/legal/compliance-sensitive claims:
Brand source:
Design source:
Docs source:
Reference products / Mobbin / Figma:
Terms to use:
Terms to avoid:
Existing UI labels:
Existing code/internal names:
Existing docs names:
Existing analytics/E2E labels:
Founder approval needed:
```

Docs, old chats, competitor references, design mocks, and founder taste are hypotheses until checked against users, screens, code, and current research.

## Product Language Layers

Every product should define these layers explicitly.

| Layer                  | Purpose                                       | Good examples                                         | Anti-patterns                                        |
| ---------------------- | --------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Category               | How the market understands the product        | `AI CRM`, `creative production system`, `billing OS`  | Abstract category before value is clear              |
| Primary navigation     | Where the user goes                           | `Home`, `Create`, `Projects`, `Analytics`, `Clients`  | Metaphor-only labels, internal codenames             |
| Product objects        | Things the user creates, edits, owns, exports | `Project`, `Invoice`, `Campaign`, `Profile`, `Report` | Cute names for objects the user must operate daily   |
| User actions           | What the user can do                          | `Create`, `Save`, `Approve`, `Export`, `Invite`       | Vague verbs: `Go`, `Start magic`, `Weave`, `Unlock`  |
| AI trust language      | How the system explains AI behavior           | `Source`, `Confidence`, `Needs review`, `Fallback`    | Magical claims, hidden automation, unclear authority |
| Brand/world language   | What makes the product memorable              | Metaphor, tone, signature naming, campaigns           | Brand language doing navigation's job                |
| Internal/code language | Stable implementation concepts                | English semantic names, typed contracts               | Public copy leaking from local codenames             |
| Analytics/E2E language | Deterministic verification                    | Event names and test labels mapped to visible copy    | Tests depending on old copy or ambiguous labels      |
| Docs language          | Durable product truth after verification      | Glossary, decision records, feature maps              | Docs preserved as mythology after UI changes         |

## Naming Scorecard

Score important names before shipping them.

| Dimension             | Question                                                                 | 1 = weak                              | 5 = strong                                  |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------- |
| Clarity               | Can a new user predict what happens here?                                | Needs explanation                     | Obvious on first scan                       |
| Task fit              | Does it match the job-to-be-done?                                        | Decorative                            | Directly maps to task/outcome               |
| Distinctiveness       | Does it feel ownable without becoming obscure?                           | Generic or copied                     | Memorable and still clear                   |
| Scalability           | Can it survive more features, roles, platforms, docs, E2E, and support?  | Breaks outside one screen             | Works across product system                 |
| Trust                 | Does it reduce uncertainty, especially in AI/data/legal-sensitive flows? | Hides source, risk, or control        | Makes source/control/recovery clear         |
| Localization          | Does it travel across language, culture, and platform constraints?       | Pun/metaphor locked to one context    | Translable or intentionally local           |
| Legal/claim safety    | Could it overpromise, imply guarantee, or hide material limits?          | Risky claim                           | Accurate and defensible                     |
| Accessibility/testing | Can assistive tech and tests use it deterministically?                   | Ambiguous, visual-only, metaphor-only | Clear accessible name and stable test label |

Rule:

- Primary navigation and CTAs should average **4+** on clarity and task fit.
- Brand/world terms may score lower on clarity only if they are never the only operational label.
- Any term below 3 on trust is blocked for AI, billing, auth, legal, public profile, destructive, or data-sensitive flows.

## Primary Navigation Rules

Top-level navigation must be:

- stable;
- short;
- familiar to the target user;
- task/category based;
- consistent across app, docs, onboarding, command palette, and E2E;
- paired with route ownership and app-shell rules in `DESIGN_SYSTEM_CONTRACT.md`.

Allowed:

```md
Primary label: functional noun or verb
Secondary flavor: optional brand/metaphor subtitle
```

Example:

```md
Primary: Clients
Secondary: optional "workspace" or brand flavor
```

Avoid:

```md
Primary: poetic metaphor only
Secondary: none
```

If a metaphor is strategically important, use one of these patterns:

| Pattern                      | Example structure                     | When to use                                   |
| ---------------------------- | ------------------------------------- | --------------------------------------------- |
| Functional primary           | `Brand`                               | Default for navigation                        |
| Functional + brand secondary | `Brand / [brand world term]`          | Transitional or onboarding moments            |
| Brand title + plain subtitle | `[brand world term]` + "Brand system" | Editorial sections only, not core nav         |
| Brand visual only            | Visual motif, icon, motion, texture   | When the metaphor should be felt, not decoded |

## Product Object Rules

Core objects must be concrete enough for:

- UI labels;
- URLs when applicable;
- database/types/API contracts;
- analytics events;
- support conversations;
- docs;
- export/import;
- permissions;
- E2E tests;
- future mobile/native clients.

For each object:

```md
Canonical public word:
Internal/code word:
Plural:
User-owned or system-owned:
Can be created?
Can be edited?
Can be exported/shared?
Can be deleted?
Related route/API/DB/type:
Forbidden synonyms:
```

## CTA And Microcopy Rules

CTAs are not brand poetry. CTAs are promises.

Use:

- action verbs;
- specific objects;
- immediate next step;
- visible consequence.

Avoid:

- vague verbs;
- internal architecture;
- metaphors;
- "magic" claims;
- irreversible actions without explicit confirmation.

CTA format:

```md
Verb + object
```

Examples:

```md
Create project
Analyze profile
Approve change
Invite client
Export report
Save draft
```

## Expressive Copy Budget

Brand personality, metaphor, humor, poetry, and narrative are allowed, but only where they support the task.

Use a risk-based copy budget. This is the same taxonomy as the Surface Level model above:

| Level | Surface type                                                         | Expressive copy budget | Rule                                                            |
| ----- | -------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| 0     | Auth, billing, legal, permissions, destructive actions, errors, E2E  | None or near-none      | Clear operational language only.                                |
| 1     | Navigation, CTAs, forms, settings, source/degraded labels            | Low                    | Functional first; optional flavor only in helper text.          |
| 2     | Onboarding, empty states, blank slates, success states, feature help | Medium                 | Personality is allowed after reason, value, and next step.      |
| 3     | Landing, editorial sections, reports, emails, brand moments, visuals | High, still truthful   | More narrative is allowed, but concrete user value stays clear. |

Rules:

- Metaphor can decorate the path; it must not replace the map.
- The UI element that lets the user progress stays functional.
- The more anxious, costly, sensitive, or irreversible the moment is, the less poetic the copy should be.
- Repeated messages should be more concise and less playful than one-time milestone messages.
- AI/data messages must never use metaphor to hide source, uncertainty, provider fallback, user control, privacy, or cost.

## Metaphor And Visual Grammar Rules

If a product uses a recurring metaphor, define it as a system, not as scattered decoration.

For each metaphor:

```md
Metaphor:
Plain-language meaning:
User value it clarifies:
Allowed surfaces:
Forbidden surfaces:
Visual primitives:
Motion behavior:
Accessibility behavior:
Reduced-motion fallback:
Platform/mobile behavior:
Terms to use:
Terms to avoid:
Test question:
```

Rules:

- The metaphor must map to a real product behavior: memory, continuity, progress, relationship, ownership, confidence, review, or output.
- Visual metaphor can be stronger than copy metaphor when the UI still labels actions plainly.
- Decorative metaphor must be `aria-hidden` or have an accessible text alternative if it communicates meaning.
- Motion metaphor must show spatial relationship, progress, causality, or feedback; it must not fake progress or hide latency.
- Reduced-motion must preserve meaning without animation.
- Platform-specific clients, especially mobile/native, must not rely on hover-only or desktop-only metaphor cues.
- A metaphor that makes the product feel slower, childish, magical, opaque, or unserious should be downgraded to campaign/editorial use.

Recommended metaphor surfaces:

| Surface                                | Safe use                                                            |
| -------------------------------------- | ------------------------------------------------------------------- |
| Logo, brand marks, app icons           | Identity and recall.                                                |
| Onboarding and first-run progress      | Relationship, setup, personal context forming.                      |
| Empty/blank states                     | Encouragement after reason and next action are clear.               |
| Success and saved states               | Continuity and memory.                                              |
| Reports and insight maps               | Connection between source, interpretation, decision, and next step. |
| Visual backgrounds and transitions     | Atmosphere, continuity, spatial relationship.                       |
| Creative prompt surfaces and textareas | Optional inspiration when labels/helper text remain visible.        |

Forbidden primary metaphor surfaces:

- primary navigation;
- primary CTA;
- auth, billing, privacy, permissions, legal, security;
- destructive actions;
- error recovery;
- source/degraded/demo/fallback states;
- E2E, analytics event names, accessibility names;
- required form instructions.

## Placeholder And Helper Text Rules

Placeholders are hints, not labels.

Every important input should have a persistent label or visible nearby instruction. Placeholder text may show an example, format, or prompt seed, but it must not contain essential information that disappears as soon as the user types.

Use:

| Field type                                  | Placeholder style                                  |
| ------------------------------------------- | -------------------------------------------------- |
| Auth, email, payment, URL, handle, security | Exact format or realistic example only             |
| Search and filters                          | What can be searched or filtered                   |
| Business/entity forms                       | Realistic professional example                     |
| Creative textareas                          | Narrative prompt seed, if a visible label exists   |
| AI feedback fields                          | Clear feedback question tied to output improvement |

Avoid:

- placeholder-only labels;
- poetic placeholders in critical forms;
- long instructions inside placeholders;
- required rules that disappear on input;
- metaphors in validation, error, privacy, billing, or permission fields.

## AI Product Language Rules

AI products need more trust language, not more mystique.

For every AI-generated, AI-ranked, AI-written, AI-edited, or AI-triggered outcome, define:

```md
What the AI did:
What data/source it used:
What confidence/limits apply:
What changed, if anything:
What the user can approve/edit/retry/discard:
Whether the output is draft, final, public, private, or needs review:
Provider/model/fallback/source metadata if relevant:
```

Use language for:

- source;
- freshness;
- degraded/fallback mode;
- confidence or uncertainty;
- human approval;
- reversibility;
- cost/limit when relevant;
- privacy/data-use expectations.

Avoid:

- "AI knows everything";
- "guaranteed";
- "viral";
- "automatic" when human approval is needed;
- hidden writes/actions;
- vague "smart" labels without evidence.

## Empty, Loading, Error, And Degraded States

State copy must prioritize recovery and truth.

| State    | Must answer                                              | Avoid                                      |
| -------- | -------------------------------------------------------- | ------------------------------------------ |
| Empty    | Why it is empty, what to do next, whether this is normal | Shame, cleverness, dead ends               |
| Loading  | What is happening and whether it may take time           | Decorative metaphors with no progress clue |
| Error    | What failed, what was saved/lost, next action            | Blame, vague "something went wrong" only   |
| Degraded | What is stale/mock/fallback/unavailable and why          | Hiding fake or stale data                  |

Metaphors may appear only after the practical recovery message is clear.

## External Reference And Mobbin Rules

Reference products, Mobbin, Figma, competitors, benchmarks, reports, and design galleries are evidence sources, not libraries to copy.

When using external references, record:

```md
Source:
Date:
Surface/pattern studied:
Principle learned:
Why it matters:
Project adaptation:
Rejected parts:
Do-not-copy boundary:
Decision impacted:
```

Never copy:

- exact screen structure;
- screenshots;
- proprietary copy;
- proprietary assets;
- animation timing;
- visual identity;
- private user data.

Persist only transformed principles.

## Product Language Registry

Every production project should maintain a registry, either as a standalone artifact or section in project docs.

Minimum table:

| Field                   | Meaning                                                |
| ----------------------- | ------------------------------------------------------ |
| Canonical public term   | What users see                                         |
| Internal/code term      | What code/types/routes may use                         |
| Object/action/state     | Classification                                         |
| Definition              | What it means                                          |
| Allowed contexts        | Nav, title, CTA, helper, docs, analytics, E2E, support |
| Forbidden contexts      | Where it must not appear                               |
| Plain-language fallback | If brand term is unclear                               |
| Owner                   | Founder, product, design, legal, engineering           |
| Status                  | proposed, approved, implemented, verified, deprecated  |
| Evidence                | User research, screen/code, decision, test, source     |

Recommended files:

```md
artifacts/decisions/<date>-product-language.md
docs/product-language.md
docs/design-system/content.md
```

Use project-specific docs paths from `PROJECT_PROFILE.md`.

## Docs And Decision Sync

Naming decisions are durable decisions.

Use `DECISION_SYNC_CONTRACT.md` when product language changes:

- navigation;
- core objects;
- public claims;
- activation event;
- pricing/plan language;
- legal/privacy wording;
- AI authority/control wording;
- user roles;
- platform/channel labels;
- top-level product category.

Docs update only after:

1. founder approval when required;
2. code/screen behavior is verified or explicitly scoped as future;
3. docs artifacts mark old terms as superseded/deprecated.

## Bootstrap Checklist

During project bootstrap, answer:

```md
Primary product category:
Plain-language value proposition:
Primary user vocabulary:
Top-level navigation:
Core product objects:
Core user actions:
Activation event wording:
AI trust/control language:
Legal/compliance-sensitive claims:
Brand/metaphor system:
Terms to use:
Terms to avoid:
Terms needing user research:
Reference/Mobbin pattern plan:
Product language registry location:
Docs to update after verification:
Founder approval needed:
```

Do not begin broad UI/refactor work until the product has at least provisional answers.

## Feature Checklist

For each user-facing feature:

```md
Does the feature introduce a new term, object, role, action, state, or claim?
Does it reuse the canonical public term?
Does code/internal naming map cleanly to public naming?
Does copy explain the action without internal jargon?
Does AI/data copy explain source, confidence, approval, and recovery?
Does E2E/accessibility label the same thing the user sees?
Does documentation need an update after verification?
Does this need founder/design/legal approval?
```

## Audit Requirements

A UX/UI or full-product audit must produce:

- navigation label inventory;
- core object/action glossary;
- metaphor/brand-language leak map;
- UI/docs/code/analytics/E2E terminology drift table;
- copy comprehension risks by flow;
- AI trust-language findings;
- legal/claim safety findings;
- before/after naming proposals with scorecards;
- product-language decision register;
- implementation queue;
- docs sync queue.

## Anti-Patterns

- A metaphor becomes primary navigation before users understand it.
- A category claim ships before the product value is concrete.
- UI labels, docs, tests, analytics, and code use different names for the same thing.
- Empty/error/loading states are clever but not useful.
- AI outputs appear authoritative without source, review, or fallback language.
- "Internal" terms leak into public copy, a11y labels, onboarding, or support docs.
- Competitor/Mobbin/reference copy is copied rather than transformed.
- A rebrand changes colors and fonts but leaves the product vocabulary incoherent.
- Docs preserve deprecated names after UI changes.
