# Feature — Development Plan

## Phase
6

## Route
- `/plan` — plan visualization
- `POST /api/plan` — Edge route (JSON response, not streaming)

## Purpose

Generate a personalized 3-area development plan with actions and micro-goals
based on the user's profile. Focus on growth, not deficit.

## Prompt (`lib/prompts/development-plan.ts`)

`buildDevelopmentPlanPrompt(profile)` generates a plan with:
- EXACTLY 3 areas based on:
  1. Weakest Jung cognitive functions (integration opportunities)
  2. Big Five dimensions that could be rebalanced
  3. Tension between dominant archetype and shadow functions
- Each area:
  - Name (clear and motivating, not clinical)
  - Rationale (why this area, tied to the profile)
  - 2-3 concrete actions
  - Per action: 2-3 measurable micro-goals

Output: JSON matching the schema in [API_MAP.md](../API_MAP.md).

Temperature: 0.4 (balance consistency with useful variation).
Max tokens: 1500.

## Rules in the prompt

- Realistic actions doable in 1-4 weeks
- Measurable micro-goals (e.g. "meditar 10 min/día" yes, "ser más mindful" no)
- Motivational tone, not prescriptive
- Spanish latinoamericano

## UI components (Phase 6)

- `app/plan/page.tsx`
- `components/plan/DevelopmentArea.tsx` — expandable card per area
- `components/plan/ActionCard.tsx` — title + description + micro-goal list
- `components/plan/MicroGoal.tsx` — checkbox with persistent state (updates JSONB in `development_plans`)

## Persistence

One `development_plans` row per user. `areas` JSONB holds the full structure.
Checkbox state updates the JSONB in place via Supabase `rpc` or direct update.

## Regenerate

Button on `/plan` → `POST /api/plan { profileId, regenerate: true }` → overwrites existing plan. Confirmation modal first to warn about losing checkbox state.

## Error handling

- Malformed JSON from Claude → retry 1x → 503
- Out-of-range areas count (not exactly 3) → retry with reinforcement
- Budget exceeded → 503

## Testing

- `lib/prompts/development-plan.test.ts`
- `app/api/plan/route.test.ts` — integration with mocked Claude
- `e2e/plan-generate-and-check.spec.ts` — generate, check micro-goals, verify persistence

## Edge cases

- User completes all micro-goals → UI shows "completado, regenerá si querés"
- Partial plan generation fails → show 2 areas if 3rd area JSON malformed → better than full fail
- Long narrative + plan + dashboard → ensure lazy-loading so plan doesn't block dashboard render

## See also

- [API_MAP.md](../API_MAP.md)
- [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md)
- [PDF_EXPORT.md](PDF_EXPORT.md) — plan is included in PDF
