# Customer Discovery Contract

> Portable contract for turning founder ideas and research into real user, buyer, and market evidence before agents overbuild.

## Purpose

Agent OS should not treat a polished plan, a model report, a waitlist, or a prototype as product truth. For new products, strategic refactors, pricing/packaging decisions, public claims, and major GTM bets, the system must define how real people will validate or reject the direction.

Use this contract with `.agent-os/workflows/guided-intake.md`, `.agent-os/BUSINESS_GTM_CONTRACT.md`, `.agent-os/UX_RESEARCH_AND_FLOW_CONTRACT.md`, and `.agent-os/FOUNDER_COMMUNICATION_CONTRACT.md`.

## Evidence Ladder

Do not collapse these signals into the same thing:

1. `belief`: founder taste, team intuition, model output, or reference-product pattern.
2. `interest`: like, reply, waitlist, save, inbound question, meeting booked.
3. `problem evidence`: interview, support ticket, sales call, observed workaround, expensive workflow.
4. `behavior evidence`: user completes a task, repeats, invites, imports data, connects account, pays time.
5. `commercial evidence`: paid pilot, LOI with real buyer, pre-sale, budget owner commitment, expansion request.
6. `retention evidence`: repeated usage, renewal, habit, workflow adoption, reduced churn, saved cost/time.

Traffic, views, AI-generated outputs, internal docs, and waitlist volume are not traction unless tied to ICP, activation, feedback quality, and cost.

## Discovery Packet

Before building beyond the first slice, fill or explicitly mark unknown:

```md
ICP:
Anti-ICP:
Buyer:
User:
Budget owner:
Pain:
Current workaround:
Frequency:
Cost of inaction:
Trigger moment:
Switching cost:
Existing alternatives:
Decision maker:
Objections:
Trust barriers:
Evidence collected:
Evidence missing:
Discovery method:
Recruiting channel:
Sample size target:
Decision this evidence will change:
Trusted until:
```

## Interview And Sales Discovery

Use interviews to learn the workflow, not to sell the founder's preferred answer.

Minimum questions:

```md
When did this problem last happen?
What did you do?
What tool, person, spreadsheet, agency, prompt, or workaround did you use?
What made it painful, expensive, risky, or urgent?
What happened when it failed?
Who else cared?
What budget, approval, or time did it consume?
What would make you switch?
What would make you not trust a product like this?
What would prove value in the first session?
Would you use, pay, pilot, or introduce us to another user? Why or why not?
```

Rules:

- Prefer past behavior over future promises.
- Record exact objections, vocabulary, current tools, and trust language.
- Separate user, buyer, budget owner, and influencer when they differ.
- Do not count polite enthusiasm as validation.
- If a call creates a product, pricing, support, legal, or public-claim decision, sync it through `.agent-os/DECISION_SYNC_CONTRACT.md`.

## Design Partner Protocol

Use this when the product needs deep workflow fit, trust, data integration, or repeated use before public launch.

```md
Design partner:
Segment:
Why they match ICP:
Workflow to study:
Commitment:
Access needed:
Value promised:
What is free:
What is paid:
Success metric:
Cadence:
Data boundaries:
Support burden:
Exit criteria:
Expansion path:
Founder approval:
```

Design partner rules:

- A design partner is not a logo, testimonial, or traction claim until permission and evidence exist.
- Prefer narrow workflow access over broad product opinions.
- Name the support burden the founder can actually carry.
- Define what the partner gets in exchange and what remains non-committal.
- For beta-real or production-real data, apply `.agent-os/REAL_DATA_ENVIRONMENT_CONTRACT.md` and approval gates.

## First Wedge Experiment

Every new product or major refactor should name the smallest experiment that can produce truthful learning.

Experiment types:

- `concierge`: manually deliver the promised outcome before automating.
- `smoke-test`: public or private CTA that tests qualified demand.
- `paid-pilot`: charge or secure budget owner commitment for a narrow outcome.
- `design-partner`: deep workflow collaboration with clear success criteria.
- `benchmark-demo`: prove an outcome against current alternatives.
- `content-to-call`: founder-led content creates qualified conversations.
- `prototype-task`: user completes the launch-critical task with a thin product.
- `migration-test`: existing users move a real workflow into the new system.

Template:

```md
Experiment:
Hypothesis:
ICP:
Offer:
Channel:
CTA:
Manual work allowed:
Success metric:
Quality threshold:
Cost/time budget:
Failure signal:
Reversal or narrow trigger:
Data mode:
Public claims allowed:
Founder approval:
Decision after result:
```

Rules:

- The wedge must test a business or workflow risk, not only whether the UI can be built.
- If the result cannot change the plan, it is not an experiment.
- Prefer learning with real users, real tasks, or real budgets before broad automation.
- Do not call waitlists, followers, or generated demos traction without qualified feedback and activation evidence.

## Discovery Output

Attach this to the Project Alignment Packet or active bootstrap/refactor artifact:

```md
Discovery status: not-started | planned | active | enough-for-first-slice | blocked | invalidated
ICP evidence:
Problem evidence:
Workflow evidence:
Commercial evidence:
Trust/security evidence:
First wedge experiment:
Design partner plan:
Interviews/sales calls needed:
Claims allowed:
Claims forbidden:
Decisions changed:
Risks:
Next learning loop:
```
