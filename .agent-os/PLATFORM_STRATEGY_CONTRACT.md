# Platform Strategy Contract

> Decide where the product lives: web, PWA, iOS, Android, desktop, browser extension, API/headless, or another delivery channel.

Use this contract during project bootstrap, audits, new product surfaces, major UX refactors, native app planning, app-store launches, mobile QA, auth/payment changes, and any feature that may behave differently across delivery channels.

## Principle

The product should have one coherent domain and multiple intentional delivery channels.

Do not let a web screen accidentally become the product architecture. Shared concepts, business rules, data contracts, design tokens, analytics events, permissions, and user journeys should survive a future native app.

If a native app is likely, the web architecture should become hybrid-ready before the native repo/package exists. That means the audit and refactor should separate portable product contracts from web-only implementation details.

## Platform Matrix

For each current or possible platform:

```md
Platform: web | mobile web | PWA | iOS | Android | desktop | extension | API/headless | other
Status: live | beta | planned | future | rejected | unknown
Primary user/job:
Critical flows:
Entry points:
Offline expectation:
Realtime expectation:
Push/notification expectation:
Device capabilities needed:
Auth/session behavior:
Payments/billing behavior:
Data stored locally:
Data synced remotely:
Design-system mapping:
Analytics/events:
QA required:
Release channel:
Approval needed:
Decision status:
```

## Architecture Questions

Before building or refactoring for a platform, answer:

- What logic must be shared across platforms?
- What UI can be shared, and what must be platform-native?
- Which API contracts need to be stable for web and native clients?
- Does the backend need a BFF/API layer instead of web-only route assumptions?
- Are auth, sessions, CSRF, cookies, deep links, and redirects valid outside the browser?
- Are payments subject to app-store rules or native purchase flows?
- Are uploads, media, camera, microphone, filesystem, notifications, contacts, or background tasks involved?
- What happens offline or with bad mobile network conditions?
- What user data is stored on-device, and how is it encrypted or cleared?
- How do feature flags, kill switches, analytics, observability, and support work per platform?
- What does rollback mean for this platform?

## Hybrid-Ready Architecture

When a project is expected to become web + native, audit and structure for these boundaries:

```md
Shared domain package:
Shared API/client package:
Shared prompt/schema package:
Shared design token package:
Shared analytics/event contract:
Shared permission/entitlement contract:
Web-only app:
Native/mobile app:
Server/API boundary:
BFF/API compatibility for native:
Auth/session abstraction:
Storage/cache abstraction:
Offline/sync strategy:
Feature flags per platform:
Observability per platform:
Release pipeline per platform:
```

Recommended direction:

- keep business/domain types independent of `app/**`, route names, React components, CSS, cookies, and localStorage;
- keep prompt schemas and API request/response contracts reusable by web and native clients;
- wrap platform-specific auth, secure storage, media, notifications, deep links, and payments behind adapters;
- define an API/client layer that can be consumed by Next.js and future native code;
- keep design tokens semantic so native UI can map them without copying CSS;
- define QA scenarios once, then execute them per platform with platform-specific evidence.

Hybrid warning signs:

- domain logic living inside page components;
- API behavior coupled to browser cookies only;
- route handlers returning HTML/page assumptions instead of stable JSON contracts where a native client will need them;
- localStorage as the only source of user/product state;
- hover/desktop interactions as required actions;
- CSS values used as product/design truth;
- prompt output shapes not versioned or validated;
- analytics tied to route paths instead of product events;
- billing/auth flows that cannot work outside the browser.

## Shared Product Core

Prefer these as shared contracts:

- domain types and schemas;
- API/request/response contracts;
- prompt input/output schemas;
- source/degraded metadata;
- analytics event names and property contracts;
- permission and entitlement model;
- plan/limit/quota rules;
- design tokens and semantic primitives;
- copy/terminology glossary;
- QA scenario definitions.

Do not assume these are shared automatically:

- route names;
- CSS classes;
- browser cookies;
- localStorage keys;
- web-only drag/drop;
- desktop-sized layouts;
- hover-only interactions;
- browser-specific file APIs;
- web checkout flows.

## Native App Gates

For iOS/Android or other app-store channels, check:

- App Store / Play Store account ownership and release process.
- Bundle identifier/package name.
- Signing credentials and rotation ownership.
- Internal distribution/TestFlight or equivalent.
- App-store metadata, screenshots, privacy nutrition labels, age rating, and review notes.
- Native permission prompts and user-facing rationale.
- Push notification consent and unsubscribe.
- Deep links/universal links and web fallback.
- Auth callback handling outside browser cookies.
- Native secure storage for tokens and sensitive cached data.
- Offline cache and sync conflict strategy.
- Crash/error reporting and source maps/symbolication.
- Native performance and startup time budget.
- App update/rollback strategy.
- Legal/privacy/terms updates.

## Platform QA

Minimum evidence by platform:

| Platform     | Minimum evidence                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Desktop web  | Browser screenshots, console/network, accessibility, E2E for critical flows.                                      |
| Mobile web   | Responsive screenshots, touch targets, keyboard/focus, viewport/overflow, reduced motion.                         |
| PWA          | Installability, offline/degraded behavior, storage/cache, update behavior.                                        |
| iOS/Android  | Simulator or device run, native permissions, auth callbacks, deep links, crash logs, app-store distribution path. |
| Desktop app  | Window sizing, filesystem permissions, updates, crash logs, OS-specific packaging.                                |
| Extension    | Permission review, content-script isolation, store review, host access.                                           |
| API/headless | Contract tests, auth scopes, rate limits, webhooks, SDK examples.                                                 |

## Approval Gates

Founder approval is required before:

- committing to a new delivery platform;
- creating app-store/developer accounts under the business;
- adding native capabilities or permissions;
- changing auth/session/payment flows for a platform;
- storing sensitive data on device;
- enabling push notifications;
- publishing TestFlight/internal builds to external testers;
- submitting to an app store;
- changing pricing or billing because of app-store constraints;
- accepting a platform-specific product limitation.

## Bootstrap Output

Every project should produce:

- current platform matrix;
- planned platform roadmap;
- hybrid-ready architecture boundary when any native/app platform is planned;
- shared-core boundary;
- platform-specific risks;
- platform QA strategy;
- app-store/release gates when relevant;
- decisions requiring founder approval.
