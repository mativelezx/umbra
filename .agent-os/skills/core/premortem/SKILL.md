---
name: premortem
description: 'Run a premortem on any plan, launch, product, hire, strategy, feature, prompt, agent workflow, MCP addition, pricing change, or decision. Assumes it already failed 6 months from now and works backward to find every reason why. Produces a revised plan with blind spots exposed. Triggers: premortem this, run a premortem, what could kill this, future-proof this, stress test this plan, what am I missing here, find the blind spots, what could go wrong, poke holes in this, where will this break.'
---

# Premortem

Imagine the plan already failed 6 months from now. Work backward to find why before committing.

## Minimum Context

Before running, establish:

1. What is being premortemed?
2. Who is affected?
3. What does success look like?

Scan current conversation and project docs first. Ask one focused question only if needed.

## Process

1. Set the frame: "It is 6 months from now. This plan has failed."
2. Generate every genuine failure reason, without forcing a fixed count.
3. Deep-dive each reason: failure story, underlying assumption, early warning signs.
4. Synthesize most likely failure, most dangerous failure, hidden assumption, revised plan, checklist.

If subagents are available and the user explicitly asked for parallel/agentic analysis, run one subagent per failure reason. Otherwise do the deep dives locally.

## Project Lens

Check product, design, engineering, API/security, AI quality, data/source metadata, business, ops/release, and Agent OS failure modes. Use `.agent-os/PROJECT_PROFILE.md` for project-specific context.

## Output

```md
Most likely failure:
Most dangerous failure:
Hidden assumption:
Revised plan:
Pre-launch checklist:
```

For substantial or explicitly requested premortems, also save:

- `artifacts/premortems/premortem-report-[timestamp].html`
- `artifacts/premortems/premortem-transcript-[timestamp].md`

The HTML report should put the synthesis first and show one card per failure mode. The transcript should include context, raw failure reasons, deep dives, and synthesis.
