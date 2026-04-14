# Deep Research

Investigate a topic thoroughly and return a structured report. Use this for technical decisions, library comparisons, architecture research, and best practices.

## Input

The user provides a research topic or question: $ARGUMENTS

## Process

You are a senior research agent. Execute this pipeline:

### Phase 1: Scope

1. Break the topic into 3-5 specific sub-questions that need answering
2. Identify what type of research this is: **library/API**, **architecture**, **best practice**, **comparison**, or **market/product**

### Phase 2: Gather

Launch multiple search agents IN PARALLEL to maximize coverage:

1. **Web Search** — Search for the topic using WebSearch. Run at least 3 different search queries with varying specificity (broad, specific, recent)
2. **Documentation** — If the topic involves a library, use context7 MCP to fetch official docs. Resolve the library ID first, then query for relevant sections
3. **Codebase Check** — Search the current codebase for any existing implementations, patterns, or prior decisions related to this topic

### Phase 3: Analyze

For each source found:

- Extract the key insight or recommendation
- Note the source credibility (official docs > blog posts > forum answers)
- Flag any contradictions between sources
- Check recency — discard anything older than 12 months for fast-moving tech

### Phase 4: Synthesize

Cross-reference findings and identify:

- **Consensus** — What do most sources agree on?
- **Tradeoffs** — What are the key decisions and their consequences?
- **Red flags** — What pitfalls or anti-patterns are commonly mentioned?
- **Gaps** — What couldn't you find reliable info on?

### Phase 5: Report

Output a structured report in this exact format:

```
## Research: [Topic]

### TL;DR
[2-3 sentences with the bottom line]

### Key Findings
1. [Finding with source]
2. [Finding with source]
3. [Finding with source]

### Tradeoffs
| Option | Pros | Cons |
|--------|------|------|
| ... | ... | ... |

### Recommendation
[What you'd do and why, considering the UMBRA codebase context]

### Implementation Notes
[Specific to our stack: Next.js 14 App Router, TypeScript strict, Tailwind 3.4, Zustand 5, Supabase (Auth + Postgres + RLS), Anthropic Claude API, Recharts, Zod, @phosphor-icons/react]

### Sources
- [Source 1 with credibility note]
- [Source 2]
```

## Rules

- Always search the web — never rely on training data alone for technical topics
- Use context7 for any library-specific questions
- Check the codebase first to avoid recommending something we already have
- Be opinionated in the recommendation — don't just list options
- If the topic is too broad, narrow it down and explain what you scoped out
- Write the report in the same language the user used (Spanish or English)
- Prefer recent sources (2025-2026) over older ones
- If you find conflicting information, call it out explicitly
- Respect Umbra's conventions from CLAUDE.md: no MBTI, no diagnostic language, no inline prompts, no `any`, no emoji in UI
