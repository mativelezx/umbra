# Design System Contract

> Portable contract for designer handoff, brand systems, UI primitives, app shells, and future rebrands.

Use this during project bootstrap, UI audits, new user-facing features, rebrands, designer/UX handoffs, and cross-platform planning.

## Principle

Screens do not own the brand.

The designer or founder chooses product intent, brand direction, interaction quality, and visual rules. Code consumes those choices through tokens, primitives, layouts, shell components, accessibility rules, and QA gates.

The system should let a future designer change colors, typography, spacing, radius, motion, iconography, and component styling without rewriting every screen.

## UX System Blueprint Baseline

Use `.agent-os/UX_SYSTEM_BLUEPRINT.md` as the portable UX system baseline before major UI audits, design-system refactors, app shell/navigation changes, or component migrations.

The core rule is:

> Brand voice lives in the wrapper, never in the work.

Design-system decisions must preserve the surface-level boundary defined in `PRODUCT_LANGUAGE_CONTRACT.md`:

- Level 0 operational/legal surfaces use functional-only language and controls.
- Level 1 repeated work UI is functional first.
- Level 2 onboarding/empty/transitional surfaces may add personality after value and next action are clear.
- Level 3 editorial/marketing surfaces may use fuller brand voice, while remaining truthful.

Portable implementation defaults:

- Use a strict three-layer token cascade: reference -> semantic -> component.
- Prefer component composition and slots over large prop matrices.
- Implement core primitives in this order before broad surface refactors: `Button`, `Card`, `Text`, form field primitives, `EmptyState`, `SourceIndicator`, score/status primitives, command/search, drawer/sheet.
- Treat status as independent axes: data state, sync state, and account state.
- Treat score displays as governed components: visible scale, category label, bands/thresholds, and one canonical visualization per concept.
- Treat empty states as truthful product states, not places to hide fake data.
- Sequence refactors by funnel impact: public entry, activation, retention, habit/editor, conversion.

Do not begin a large UI cleanup by rewriting individual screens first. Capture a baseline audit, stabilize tokens/primitives, then migrate surfaces.

## Level-SV Baseline

A strong design system is required infrastructure, not a visual preference.

Every project must either define these layers or mark them explicitly as missing launch/design debt:

1. Product principles and brand point of view.
2. Content design and product language: voice, tone, terminology, naming, empty/error/help copy, AI trust language, localization posture, and `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` alignment.
3. Token system: reference, semantic, component, state, layout, motion, data-visualization, platform/mode tokens.
4. Color system: brand palette, semantic roles, contrast pairs, dark/light/high-contrast modes where relevant.
5. Typography system: type scale, weights, line heights, responsive behavior, truncation rules, and accessibility scaling.
6. Layout system: spacing, grid, containers, breakpoints, density, safe areas, z-index, and overlay layers.
7. Shape/elevation system: radius, border, shadow/elevation, focus rings, dividers, and surface hierarchy.
8. Own iconography system or approved icon source: grid, stroke/fill, sizes, naming, accessibility, licensing, and usage rules.
9. Illustration/imagery/media rules: style, licensing, export formats, alt text, aspect ratios, and where imagery is forbidden.
10. Motion system: durations, easing, choreography, performance budget, and reduced-motion alternatives.
11. Narrative/brand motif system: recurring metaphors, visual primitives, allowed/forbidden surfaces, accessibility behavior, reduced-motion fallback, and product-language alignment.
12. Component primitives: variants, states, keyboard behavior, accessibility, responsive behavior, and implementation API.
13. Product patterns: navigation, onboarding, forms, tables, dashboards, editors, AI interactions, billing, uploads, destructive flows, notifications, and empty/degraded states.
14. Platform adapters: desktop web, mobile web, PWA, iOS, Android, desktop, extension, or explicit non-goals.
15. Governance: source of truth, owner, versioning, contribution process, review gates, visual regression, docs, changelog, and deprecation path.

If any of these are absent, agents must not silently fill the gap screen by screen. They must create a design-system gap, ask for founder/designer approval when the choice affects brand/product identity, or keep the feature scoped to existing primitives.

## Source Package

Every project should define a design source package. If no designer exists yet, mark it as founder-owned and provisional.

```md
Design source of truth:
Designer/UX owner:
Brand brief:
Content design source:
Product language source:
Figma/design file:
Token source:
Logo/assets source:
Typography source:
Iconography source:
Illustration/imagery source:
Motion source:
Data visualization source:
Component documentation source:
Storybook/catalog/source examples:
Visual regression tooling:
Reference products:
Asset/license/IP status:
Terms/metaphors to use:
Terms/metaphors to avoid:
Accessibility target:
Platform targets:
Version/changelog:
Approval owner:
```

Rules:

- Treat screenshots and mockups as intent, not implementation.
- Treat design docs as hypotheses until screens and code match them.
- Do not copy proprietary assets, copy, or exact layouts from reference products.
- If Figma or another design tool exists, map its variables/tokens to code instead of inventing unrelated names.
- If no design file exists, create a minimal token and primitive contract before large UI work.

## Brand Asset And IP Intake Gate

Before importing any designer package, logo, font, illustration, icon, screenshot, stock image, generated image, motion asset, audio, video, or reference UI into product code, create an asset intake record.

```md
Asset/source:
Owner/provider:
File/source location:
Asset type: logo | font | icon | image | illustration | motion | video | audio | mockup | token | other
Intended usage: product UI | landing | social | app icon | docs | pitch | internal only
License/commercial usage:
Web/app embedding allowed:
Modification allowed:
Redistribution allowed:
Source/vector available:
Accessibility/alt text needed:
Performance impact:
Responsive/platform impact:
Replacement/fallback:
Approval owner:
Status: approved | blocked | mood-only | needs license | needs source | rejected
```

Rules:

- Do not treat a PDF, PNG, screenshot, or mockup as implementation source unless the source file, license and export path are clear.
- Do not ship trial, personal-use, unclear, or missing-license fonts in a commercial product.
- If the founder/designer approves an exact font family before purchase, record it as the intended token target and block production embedding until license proof exists. Temporary fallback fonts must be marked as implementation placeholders, not new brand decisions.
- Do not install brand assets into the app until the product role is known: logo, UI icon, illustration, decorative motif, social asset, or documentation asset.
- Do not use a reference product's proprietary screenshots, copy, assets, exact layout, exact animation timing, or interaction choreography as product implementation.
- If an asset is valuable but not production-ready, classify it as `mood-only` and translate the principle into tokens, primitives, or product-language decisions.
- Every reusable project template must include this gate so future projects do not inherit project-specific assets or unlicensed brand decisions.

## Foundation Contract

Every project should define foundations before expanding screens.

| Foundation         | Required Decisions                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand              | Positioning, product principles, personality, logo usage, app icon/favicon/social assets, and forbidden treatments.                                       |
| Content            | Voice, tone, terminology, microcopy, labels, errors, success messages, empty states, help text, legal-sensitive copy, product language, and localization. |
| Color              | Brand palette, semantic roles, accessible foreground/background pairs, status colors, chart colors, modes, and forbidden combinations.                    |
| Typography         | Families, scale, weights, line heights, paragraph rhythm, labels, captions, data text, code text, truncation, and accessibility scaling.                  |
| Layout             | Spacing scale, grid, containers, breakpoints, density, safe areas, max widths, page rhythm, and responsive rules.                                         |
| Shape/elevation    | Radius scale, borders, dividers, shadows, elevation, surface hierarchy, focus rings, and selected/pressed/disabled visual states.                         |
| Motion             | Durations, easing, transition roles, loading motion, feedback motion, scroll/entrance rules, performance limits, and reduced-motion alternatives.         |
| Narrative motifs   | Recurring visual/story motifs, what they mean, allowed surfaces, forbidden surfaces, component primitives, a11y behavior, and reduced-motion fallbacks.   |
| Iconography        | Owned icon style or approved library, grid, sizes, stroke/fill rules, naming, states, accessibility, localization/cultural review, and licensing.         |
| Illustration/media | Image style, generated/stock/local asset policy, licensing, aspect ratios, alt text, compression, and product-context rules.                              |
| Data visualization | Chart primitives, color safety, legends, thresholds, source/degraded labels, empty/error states, and accessible text summaries.                           |
| AI UX              | Generation states, prompt surfaces, source/degraded metadata, model fallback messaging, regeneration/edit/discard actions, and trust boundaries.          |

## Token Taxonomy

Every project should classify tokens into layers:

The canonical cascade is three layers. The table below lists token families, but they must still fit the cascade: reference values feed semantic intent, and semantic intent feeds component-specific dials. State, layout, motion, chart, icon, and asset tokens are families inside the semantic/component layers, not permission to bypass the cascade.

| Layer                     | Purpose                                           | Examples                                                        |
| ------------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| Reference/brand tokens    | Raw brand values                                  | `brand.blue.500`, `font.display`, `space.4`, `radius.md`        |
| Semantic tokens           | Product meaning                                   | `surface.default`, `text.muted`, `border.danger`, `accent.main` |
| Component tokens          | Component-specific decisions                      | `button.primary.bg`, `card.border`, `input.focusRing`           |
| Layout/shell tokens       | Navigation, app frame, panels, safe areas         | `shell.nav.width`, `shell.mobileTab.height`, `z.overlay`        |
| State tokens              | Loading, empty, error, degraded, selected, active | `state.error.bg`, `state.degraded.icon`, `state.focus.ring`     |
| Motion tokens             | Duration, easing, animation policy                | `motion.fast`, `motion.ease.standard`, `motion.reduced`         |
| Narrative motif tokens    | Brand/metaphor visuals and connection motifs      | `motif.thread`, `motif.thread.muted`, `motif.connection.active` |
| Platform/mode tokens      | Theme, density, channel, native variants          | `mode.light`, `mode.dark`, `platform.ios`, `density.compact`    |
| Data-visualization tokens | Charts, graphs, maps, benchmarks                  | `chart.series.1`, `chart.grid`, `chart.positive`                |
| Icon tokens               | UI icon sizing, stroke, color, selected states    | `icon.size.md`, `icon.stroke.regular`, `icon.color.muted`       |
| Asset tokens              | Logos, imagery, media ratios, export constraints  | `asset.logo.minSize`, `media.ratio.card`, `og.size.default`     |

Implementation options depend on stack, but the contract must name the target:

```md
Token format:
Token build pipeline:
CSS variable strategy:
Framework/theme strategy:
TypeScript visual API:
Native/mobile token export:
Dark/light or brand modes:
Density/responsive modes:
Versioning:
```

Recommended baseline:

- Keep raw brand values separate from semantic usage.
- Components consume semantic/component tokens, not raw colors or one-off values.
- Use CSS custom properties for web runtime theming.
- Expose a typed visual API when components need non-CSS decisions.
- Record design-system version in docs or runtime metadata when practical.
- Avoid hex, arbitrary font sizes, arbitrary shadows, and screen-local styling unless explicitly justified.

## Iconography Contract

Own iconography is a Level-SV requirement when icons are part of the product identity.

Define:

```md
Icon source:
Icon owner:
Icon library path:
Figma/icon file:
Code export path:
Base grid:
Allowed sizes:
Stroke weights:
Fill/duotone/multicolor policy:
Corner/radius rules:
Optical alignment rules:
Metaphor/naming rules:
Selected/active/disabled states:
Accessibility labels:
Localization/cultural review:
Licensing:
Contribution/review process:
Deprecation path:
```

Rules:

- Prefer an owned icon set when iconography is part of the brand experience.
- Icons must be named by durable concept/metaphor and usage, not by random visual description alone.
- Icon-only controls require accessible names, focus states, hover/pressed states, disabled states, and tooltip/help when the meaning is not obvious.
- Decorative icons must be hidden from assistive tech.
- Do not mix unrelated icon families without approval; mixed stroke weights and metaphors create product drift.
- Do not use platform-owned symbols, marketplace icons, or generated icons unless licensing and usage rights are clear.
- Product/app icons, favicons, social cards, UI icons, pictograms, and illustrations are different systems; do not treat them as interchangeable.

## Component Primitive Contract

Every project should name the canonical primitives before UI work expands.

Minimum primitives to decide:

```md
Button:
IconButton:
Input:
Textarea:
Select/Menu:
Checkbox/Switch:
Tabs/SegmentedControl:
Card/Surface:
Chip/Badge:
Tooltip/Popover:
Modal/Sheet/Drawer:
Toast/InlineAlert:
Table/List:
EmptyState:
LoadingState/Skeleton:
ErrorState:
DegradedState:
Source/LastUpdated marker:
Chart primitives:
Media/Image primitives:
AI generation state:
Command/Search:
Navigation item:
Breadcrumb:
Pagination:
Uploader:
Destructive confirmation:
```

Each primitive should define:

```md
Variants:
Sizes:
States:
Accessibility behavior:
Responsive behavior:
Token dependencies:
Allowed escape hatches:
Example routes/screens:
```

Rules:

- Prefer shared primitives before screen-local controls.
- Repeated jobs must look and behave consistently across screens.
- Do not introduce a component library by inertia; approve it through tool/dependency review.
- If adapting external UI inspiration, adapt source into project tokens, accessibility, motion policy, and iconography.

## Pattern Contract

Components are not enough. Important product patterns must be owned by the system.

Define patterns for:

- App shell, primary navigation, secondary navigation, local tabs, breadcrumbs, and mobile/native navigation.
- Onboarding, activation, upgrade/paywall, waitlist, auth, account, settings, and legal/privacy surfaces.
- Forms, validation, destructive actions, uploads/imports, exports/downloads, permissions, and confirmations.
- Dashboards, cards, tables, filters, search, command palette, notifications, toasts, modals, sheets, drawers, and empty states.
- AI interactions: prompt input, generation progress, streaming, result cards, source/degraded states, hallucination/trust warnings, regenerate/edit/discard/save actions, and feedback capture.
- Editors/workspaces: sidebars, toolbars, canvas, preview, timeline, version history, review/approval, and keyboard shortcuts.
- Data visualization: chart cards, legends, outliers, benchmarks, tooltips, annotations, accessible summaries, and degraded data.

## Product Language Boundary

Design systems own the interface shape; product-language contracts own what the interface calls things.

Before major UI work, align:

```md
Top-level labels:
Core product objects:
Core actions:
AI trust/control terms:
Empty/loading/error/degraded wording:
Terms/metaphors to use:
Terms/metaphors to avoid:
Narrative/visual motifs:
Motif allowed/forbidden surfaces:
Accessibility/E2E label policy:
Docs/code/UI sync policy:
```

Rules:

- Navigation labels, CTAs, errors, forms, accessibility labels, analytics events, and E2E labels must be functional first.
- Brand/metaphor language may appear in visual system, editorial moments, onboarding explanations, or secondary subtitles, but it must not be the only operational label unless user research proves comprehension.
- If a design handoff introduces new names, objects, actions, roles, claims, or metaphors, run `product-language-review` or apply `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` before implementation.
- Rebrands must update product language, not only tokens, fonts, colors, and icons.

## App Shell And Navigation Contract

Navigation is part of the design system, not a per-screen decision.

Define:

```md
Top-level modules:
Primary navigation component:
Secondary navigation component:
Sidebar/rail/topbar/bottom-tab policy:
Mobile web policy:
PWA policy:
iOS/native policy:
Android/native policy:
Breadcrumb/back policy:
Global action policy:
Assistant/chat/help policy:
Notifications/toasts policy:
Z-index/overlay policy:
Safe-area policy:
```

Rules:

- Top-level navigation must remain stable and predictable.
- Navigation components navigate; toolbars and local actions act on the current view.
- Complex products should use adaptive shell components rather than duplicated route-local navigation.
- Future native apps should be planned through shared product core, shared tokens, and platform-specific navigation adapters.

## Documentation And Tooling Contract

Every production-grade design system should have a living implementation path.

Required or explicitly missing:

```md
Design docs:
Component catalog:
Token source/build:
Icon catalog:
Example screens:
Do/don't usage:
Accessibility annotations:
Content/microcopy guidelines:
Changelog/version:
Deprecation policy:
Visual regression:
A11y tooling:
Lint/static checks:
Screenshot baselines:
Design-to-code mapping:
```

Rules:

- Docs are not canonical unless code/screens match them.
- A component is not "in the system" until it has tokens, variants, states, accessibility behavior, examples, and ownership.
- A token is not "approved" until it has a semantic reason and a consuming path.
- A design reference is not an implementation unless it has been mapped to the project source package.

## Designer Handoff Checklist

Before accepting a design handoff as implementation-ready, verify:

- The target user flow and success metric are clear.
- Required screens, states, and breakpoints are included.
- Tokens or variables exist for color, type, spacing, radius, elevation, motion, and states.
- Components map to existing primitives or explicitly request new primitives.
- Iconography maps to the approved icon system or requests new icons with grid, size, state, accessibility, and licensing notes.
- Content/microcopy is approved or marked provisional with owner and rewrite target.
- Data visualization, AI states, source/degraded states, and media/asset rules are included when relevant.
- Icons/assets are licensed and exportable.
- Copy is approved or marked provisional.
- Accessibility requirements are stated: contrast, focus, labels, keyboard, reduced motion, touch targets.
- Platform-specific behavior is called out for desktop web, mobile web, PWA, iOS, Android, or other targets.
- Empty/loading/error/degraded states are included.
- Data needed for the screen is mapped to API/server action/store/DB/mock/fixture/real data.
- QA evidence expected after implementation is defined.
- Documentation/changelog updates and deprecation impacts are defined.

## Rebrand Protocol

Use when a project changes brand direction or a professional designer updates the system.

1. Update source package.
2. Update token source and version.
3. Regenerate or update CSS variables/theme/typed visual API.
4. Run visual drift audit.
5. Run accessibility audit for contrast, focus, state colors, and motion.
6. Run route screenshots for desktop and mobile.
7. Update docs after code and screens match.
8. Record founder/designer approval.

## Feature Definition Of Done Additions

Any user-facing feature must answer:

```md
Which design-system primitives does it use?
Which tokens does it introduce or consume?
Which product-language terms does it introduce or change?
Does it follow `.agent-os/PRODUCT_LANGUAGE_CONTRACT.md` for names, labels, CTAs, states, AI trust language, and metaphor boundaries?
Does it add a new visual pattern? If yes, why is it not covered by existing primitives?
Does it require new iconography, illustration, imagery, copy, chart, or AI interaction patterns?
Does it preserve the app shell/navigation contract?
Does it work in current and planned platform targets?
Does it include empty/loading/error/degraded states?
Does it pass accessibility and reduced-motion expectations?
Does it create design drift in repeated modules?
Does documentation match code and screenshots?
Does it need design-system-review before implementation and accessibility/browser evidence after implementation?
```

## Audit Requirements

An audit must produce:

- design source-of-truth status;
- foundation coverage matrix: brand, content, color, type, layout, shape/elevation, motion, iconography, illustration/media, data visualization, AI UX;
- token taxonomy and implementation map;
- primitive coverage matrix;
- iconography/asset ownership matrix;
- pattern coverage matrix;
- app shell/navigation matrix;
- screen-local styling/drift list;
- repeated-module consistency findings;
- accessibility and reduced-motion findings;
- rebrand readiness rating;
- designer handoff gaps;
- documentation/tooling/governance gaps;
- delete/merge/extract component recommendations.

## Anti-Patterns

- A designer hands off colors/fonts/buttons, but engineering reinterprets them route by route.
- Components consume raw hex values instead of semantic tokens.
- Every screen creates its own card, button, table, empty state, or navigation pattern.
- The web app looks polished, but planned mobile/iOS/native surfaces have no token or shell strategy.
- Design references become copied layouts instead of extracted principles.
- Docs describe a design system that screens do not actually use.
- New features ship with UI but no source metadata, empty/error/degraded state, or QA screenshot.
- The product uses random icon libraries instead of an owned or approved iconography system.
- AI-generated images/icons/illustrations enter the product without licensing, accessibility, and style review.
- Data charts invent colors, labels, legends, or empty states outside the design system.
- A component exists in code but has no documented variants, states, accessibility behavior, or owner.
