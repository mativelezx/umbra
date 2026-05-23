# UX Research And Flow Contract

> Portable contract for product, UX, UI, analytics, QA, and service-design work.

Use this for every audit, UX/UI refactor, onboarding redesign, navigation change, activation change, beta launch, user-facing feature, or product decision where the user path matters.

## Principle

Do not optimize screens in isolation.

A product surface is ready to design, refactor, test, or document only when the system can connect:

- the user need;
- the use case;
- the step-by-step flow;
- the emotional/friction journey;
- the service blueprint behind the UI;
- the measurement and event plan;
- the research or beta feedback loop;
- the implementation owners across frontend, backend, data, AI, ops, and docs.

Docs, founder opinions, competitor references, and AI suggestions are hypotheses until browser/code/data/user evidence confirms them.

## Required Layers

### 1. User Need

Stable problem from the user's language.

```md
Need ID:
Persona / role:
User words:
Problem:
Why it matters:
Evidence: screen | code | analytics | support | interview | founder hypothesis
Confidence: verified | likely | hypothesis | contradicted
```

### 2. Use Case

The job the product promises to help complete.

```md
Use Case ID:
User need ID:
Persona / role:
Trigger:
Entrypoint:
Expected outcome:
Current route/component/API/DB evidence:
Classification: public | beta-core | authenticated-core | business/client | admin/internal | dev-only | future | legacy
Decision: keep | simplify | merge | hide | delete | needs UI | needs backend | needs real data | needs copy rewrite
```

### 3. Flow Trace

The actual steps the user takes in the product.

```md
Flow ID:
Use Case ID:
Flow type: happy-path | empty-state | error-recovery | degraded-provider | mobile | returning-user | manual-gated | admin/internal
Platform: desktop web | mobile web | PWA | iOS | Android | desktop | extension | API/headless
Data mode: demo | fixture | local seeded DB | staging seeded DB | beta-real | production-real

Step:
User intent:
Visible route/screen/state:
Exact visible control/text/CTA:
Expected system response:
Frontend owner:
Backend/API/store/DB/prompt owner:
Loading/empty/error/degraded/recovery state:
Friction/confusion risk:
UX/UI/copy opportunity:
Analytics event/metric:
E2E status:
Evidence link:
```

### 4. Journey Map

The user's experience across phases, not only clicks.

```md
Journey ID:
Use Case / Flow IDs:
Actor:
Scenario:
Expectations:
Phases:
Actions:
Questions / doubts:
Emotional highs/lows:
Trust moments:
Pain points:
Opportunities:
Owner:
Metric:
Evidence:
```

Use journey maps to find fragmentation, unclear language, trust gaps, and moments where the product asks the user to understand internal structure.

### 5. Service Blueprint

The business/system layer behind the visible flow.

```md
Blueprint ID:
Flow ID:
Customer action:
Frontstage UI:
Backstage app/API/AI/provider action:
Support/ops process:
Data object / DB table / storage:
Dependency/provider:
Failure mode:
Recovery path:
Owner:
Metric/alert:
```

Use service blueprints to find hidden root causes: missing data, repeated questions, provider latency, brittle APIs, support burden, manual founder work, and unclear ownership.

### 6. Information Architecture And Navigation

Every important use case must be findable.

```md
IA Area:
User vocabulary:
Current label:
Route/navigation location:
Alternate names found in UI/docs/code:
Findability risk:
Merge/rename/hide/delete recommendation:
Evidence:
```

### 7. Content Design And Terminology

Copy is part of product architecture.

Use `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` for naming, metaphors, AI trust language, public claims, canonical terms, and docs/code/UI terminology sync.

```md
Term / CTA / object:
Canonical public word:
Internal/code word:
Forbidden or risky wording:
Allowed metaphor:
Plain-language fallback:
Routes/components using it:
Decision owner:
```

For launch-critical flows, also record:

```md
Comprehension question:
What the user thinks this means:
What the product actually does:
Research/user-test status:
Docs/code/E2E/analytics names:
Drift risk:
```

### 8. Measurement Plan

Use metrics to answer whether the flow works, not to collect noise.

```md
Flow ID:
Goal:
Signal:
Metric:
Event(s):
Drop-off / failure signal:
Segment/persona:
Platform:
Data mode:
Dashboard/report:
Decision this validates:
```

Recommended minimums for launch-critical UX:

- task completion;
- time to first useful output;
- number of actions/clicks to activation;
- error/recovery completion;
- empty-state conversion;
- qualitative comprehension score after beta sessions.

### 9. Event Taxonomy

Every tracked event needs a reason and code location.

```md
Event:
Trigger:
Why:
Flow step:
Properties:
PII classification:
Code location:
Destination:
Owner:
QA evidence:
```

Do not add analytics events just because they are easy to track. Track the few events that answer the founder/product/business decision.

### 10. Research Ops And Beta Learning

Every important UX/UI refactor or beta launch needs a research loop.

```md
Research question:
Assumption to test:
Method: interview | observed usability | unmoderated test | analytics review | support review | Mobbin/reference review | beta feedback
Participants / sample:
Tasks:
Success criteria:
Notes/evidence location:
Decision impacted:
Follow-up:
```

For a solo founder, prefer small repeated rounds over one giant research event. Each round should produce decisions, fixes, or explicit accepted risk.

### 11. Accessibility And Performance By Flow

Accessibility and performance are flow qualities, not only page qualities.

Check:

- keyboard completion;
- focus visibility and focus not obscured;
- target size and touch safety;
- labels, accessible names, status messages, and error recovery;
- reduced motion;
- mobile viewport and safe-area behavior;
- LCP, CLS, INP/TBT risk on key steps;
- loading and degraded states that do not trap the user.

### 12. Service Recovery And Support

Every critical flow must answer what happens when it fails.

```md
Failure:
Visible user message:
Retry/backoff/cancel path:
Data saved or lost:
Support path:
Founder/manual ops action:
Monitoring/alert:
Docs/help impact:
```

## Mandatory Gates

- No broad UX/UI refactor before use cases, flow traces, journey map, and service blueprint exist for the affected flow family.
- No beta-critical flow before measurement plan, event taxonomy, E2E scenario, accessibility check, and recovery path exist.
- No docs rewrite before screen/code/data behavior is verified.
- No Mobbin/reference usage without recording the principle learned and the project-specific adaptation.
- No naming/copy/navigation/metaphor decision without checking `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` and recording the canonical term or provisional status.
- No feature is "done" if UI, backend, DB, AI, docs, events, and support/recovery tell different stories.

## Output Pack

For audits, produce:

- user needs register;
- use-case catalog;
- trackable flow matrix;
- journey maps for launch-critical flows;
- service blueprints for launch-critical flows;
- IA/navigation terminology matrix;
- content design taxonomy;
- product-language/naming scorecard and terminology drift map;
- UX metrics and event taxonomy map;
- research/beta learning plan;
- accessibility/performance-by-flow findings;
- recovery/support map;
- founder decision list.
