# UX System Blueprint

```md
Artifact: UX_SYSTEM_BLUEPRINT
Date: 2026-05-13
Scope: portable SaaS/web UX system framework
Status: current portable baseline
Source evidence: founder-provided UX/UI deep-audit briefing from 2026-05-13, produced from a production app audit, research clusters, screen review, code metrics, and skill outputs.
Trusted until: the next full UX/system audit, major product category change, design-system replacement, or external standards/reference update that changes the recommendations.
Founder approval: approved to persist as Agent OS baseline on 2026-05-13.
Docs/code impacted: DESIGN_SYSTEM_CONTRACT, PRODUCT_LANGUAGE_CONTRACT, APPROVAL_GATES, SKILL_REGISTRY, PROJECT_BOOTSTRAP_PLAN, PORTABILITY_GUIDE, active spec plans.
```

## Principle

> Brand voice lives in the wrapper, never in the work.

If the user reads the surface, editorial or brand voice may appear. If the user acts in the surface, language and controls must become functional. The daily test is:

> Would Linear ship this copy in this exact surface?

This blueprint is portable. Product-specific words, routes, vendors, metaphors, and market claims belong in `PROJECT_PROFILE.md`, active specs, or project artifacts.

## Surface Levels

| Level | Surface | Rule |
| --- | --- | --- |
| 0 | Operational, legal, auth, billing, permissions, errors, destructive actions, source labels | Functional only. No metaphor. |
| 1 | Navigation, CTAs, forms, settings, status, filters, repeated work UI | Functional first. Flavor only in secondary helper copy. |
| 2 | Onboarding, empty states, transitions, success, feature help | Personality after value, truth, and next step. |
| 3 | Landing, editorial, campaigns, reports, brand moments | Full brand voice, still truthful and concrete. |

Metaphor is forbidden in Level 0 and Level 1 primary labels. It may appear in Level 2 and Level 3 when it does not hide the task, risk, source, or next action.

## Token System

Use three layers:

1. Reference tokens: raw brand values and scales, such as `--brand-*`, `--scale-*`, `--font-*`, `--space-*`, `--radius-*`.
2. Semantic tokens: product intent, such as `--text-*`, `--bg-*`, `--border-*`, `--accent-*`, `--feedback-*`, `--success-*`, `--warning-*`, `--danger-*`.
3. Component tokens: component-specific dials only when a primitive needs them, such as `--button-*`, `--card-*`, `--input-*`.

Cascade rule:

- Layer 2 references only Layer 1.
- Layer 3 references only Layer 2.
- Components consume Layer 2 or Layer 3.
- Screens must not skip straight to raw values.
- Redundant aliases are drift. If three tokens name the same value, two should be deleted.

Recommended enforcement:

- additive tokens first;
- codemod consumers;
- delete redundant aliases;
- CI lint for raw hex, arbitrary fonts, and layer skips.

## Component Model

Prefer composition over configuration.

```tsx
<Card variant="editorial">
  <Card.Media aspectRatio="16/9" src={src} />
  <Card.Header>
    <Card.Kicker>02</Card.Kicker>
    <Card.Title as="h3">Title</Card.Title>
    <Card.Lead>Supporting copy.</Card.Lead>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>
    <Card.Meta>3 days</Card.Meta>
    <Card.Actions>
      <Button variant="ghost" size="sm">Edit</Button>
    </Card.Actions>
  </Card.Footer>
</Card>
```

The same slot pattern applies to `Input`, `EmptyState`, `SourceIndicator`, score displays, command/search, drawers, and editor surfaces.

Canonical button pattern:

- `class-variance-authority` for type-safe variants;
- Radix `Slot` for `asChild`;
- variants: `primary`, `secondary`, `ghost`, `destructive`, `link`;
- sizes: `xs`, `sm`, `md`, `lg`, `xl`, `icon-sm`, `icon-md`, `icon-lg`.

Do not let `Button`, `Card`, `Input`, or `EmptyState` grow into 20-prop configuration objects when slots make the structure clearer.

## Status System

Split status into independent axes:

| Axis | Values |
| --- | --- |
| Data state | `real`, `sample` for dev only, `cached` |
| Sync state | `connected`, `never`, `reconnecting`, `reconnect_required` |
| Account state | `trial`, `active`, `limited` |

A unified `SourceIndicator` should consume the relevant axes. Use positive, precise vocabulary. Do not use words that imply breakage for intentional states. Example: `Test mode` is better than `broken` or `limited` when the state is intentional.

## Score Displays

Rules:

- Always show the scale outside extremely tight inline contexts: `77/100`, not naked `77`.
- Always pair the value with a category: `77/100 · Solid`, not just a number.
- Always render bands or thresholds when the score is compound.
- Use one canonical visualization per concept. Drill into detail through a drawer or dedicated page.
- Do not use the product accent color for positive/healthy state. Accent remains for CTAs and emphasis; use success or an approved semantic health token.

## Empty States

Honest empty states beat fake-filled products.

Rules:

- Do not show synthetic data as if it were real in production.
- Templates are allowed as clone-to-customize, never silently applied.
- Empty states need one clear primary action.
- The first-run state must tell the truth about what is missing and how to start.

State-aware hero pattern:

1. New user: onboarding nudge.
2. Onboarded with no content: first-action prompt.
3. Content exists but no metrics: connect or enrich source.
4. Mature account: personalized view based on real data.

## Information Architecture

Rules:

- Primary navigation caps at five items.
- Account, billing, settings, and help usually belong in the avatar/account menu.
- Command palette ships early when density is rising: go-to, recent, and minimal actions.
- Hubs use identical tab shapes across the product.
- Workspace switchers appear only when the user actually has multi-workspace complexity.

For dense tools, reduce chrome before inventing more navigation layers. Sidebar, tabs, command palette, breadcrumbs, chat, and back buttons should not all act as primary navigation at once.

## Responsive Strategy

Canonical breakpoints:

```md
sm: 480
md: 768
lg: 1024
xl: 1280
2xl: 1536
```

Rules:

- Author mobile-first.
- Use container queries for components, not only page-level breakpoints.
- Mobile bottom tab bar: 64px plus safe-area inset, maximum five items.
- Creation-heavy/editor surfaces may be gated to `>=1024px`; mobile can be read/share/comment when full editing would create bad work.
- Prefer PWA before native unless the product has a clear native-only requirement.

## Typography

Use a display + body + accent model, maximum three font families.

Rules:

- Assign fonts by surface, not taste.
- Body text must be readable at `>=16px` desktop and `>=15px` mobile with line-height around `1.55-1.6` when long-form.
- Stat values may use the display family, but should use `font-variant-numeric: tabular-nums` when alignment matters.
- A `Text` primitive should absorb inline font choices.
- Prohibit repeated inline `fontFamily` after migration.

## Color And Theme

Both modes are first-class when a theme toggle exists.

Rules:

- Default light when the target users live in light-default tools.
- Default dark when the target users live in dark-default tools.
- Respect `prefers-color-scheme` on cold load when there is no stored preference.
- Persist the user choice.
- Do not make dark mode the identity. Identity lives in typography, warmth, motion, information architecture, and interaction quality.

## Diagnostic Funnel Pattern

For public diagnostic or score-style funnels:

- Entry is single-purpose: one question, one input, trust signals stacked.
- Loading can narrate real stages, but avoid fake progress bars.
- Reveal core result before asking for more user data.
- Use soft gates only for deeper recommendations or saved artifacts.
- Email can be framed as a delivery address for the full artifact, not as a wall.
- Provide share surfaces only after the result is useful.
- Bridge diagnostic answers into onboarding to reduce time to value.

## Approval Gates

Founder sign-off is always required for:

- top-level navigation labels;
- brand/metaphor system changes;
- default theme decision;
- banned-word or blocked-language changes;
- activation copy and primary CTA wording;
- pricing tier copy;
- AI authority, trust, source, confidence, or review language.

Agents may draft options and scorecards, but must not mark these choices approved without founder approval.

## Implementation Sequence

Do not refactor product UI surface by surface first. Foundations come first.

1. Foundations: token cascade, theme, base primitives (`Button`, `Card`, `Text`).
2. Primitives complete: remaining primitives, status system, diagnostic/public funnel if applicable.
3. Funnel-prioritized surfaces: public entry, activation, retention, habit/editor, conversion.
4. Polish and QA: visual regression, WCAG, performance, browser screenshots, mobile checks.

Use funnel impact to sequence surfaces, not org-chart ownership or route order.

## Baseline Audit

Before a refactor, capture counts before changing files:

```bash
find apps/web -name "*.tsx" | wc -l
ls components/ui/
ls components/*/
grep -E "^\\s*--" app/globals.css | wc -l
grep -E "^\\s*--[a-z-]+:\\s*var\\(--[a-z-]+\\);" app/globals.css | wc -l
grep -rE 'style=\\{\\{' components/ app/ --include="*.tsx" | wc -l
grep -rE 'fontFamily:' components/ app/ --include="*.tsx" | wc -l
grep -rE "#[0-9a-fA-F]{3,8}\\b" components/ app/ --include="*.tsx" | wc -l
```

Adapt paths for the repo. For Next.js monorepos, include `apps/web/src`, `packages/ui`, and any route/component folders.

## Founder Decision Map

For each project, answer or mark unknown:

1. Theme default and whether a toggle ships.
2. Demo/sample data policy.
3. Banned words.
4. Page title pattern.
5. Home/hero state machine.
6. Primary input pattern.
7. Font family lock.
8. Component consolidation targets.
9. Canonical token naming.
10. Navigation label style.
11. Chat surface placement.
12. Workspace switcher visibility.
13. Command palette timing.
14. Mobile editor strategy.
15. Stat number typography.

These are decisions, not agent guesses. Draft them in artifacts, then request founder approval when they affect current product behavior.

## Anti-Patterns

Kill these when found:

- score without scale;
- sample data presented as real data;
- five visualizations for one metric in one viewport;
- metaphor in operational surfaces;
- banned words leaking from prompts into UI;
- token alias soup;
- many ad-hoc card styles;
- repeated inline font families;
- hard email gate before showing value;
- stacked navigation systems;
- accent color used as success/health.

## External References

Use references as transformed principles, not assets to copy:

- shadcn/ui for component composition;
- Radix Primitives for `Slot` and accessible primitives;
- DTCG design-token specifications;
- NN/g for empty states, navigation, and breadcrumbs;
- Apple HIG for tab bars and platform expectations;
- Material 3 for adaptive navigation ideas;
- Linear, Vercel, Stripe, Notion, Figma, and similar production tools for pattern evidence.

When external sources can change a product decision, run current-source research before making public or implementation claims.
