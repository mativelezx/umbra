/**
 * Accessibility smoke tests — Fase 5 T5.5.
 *
 * Runs axe-core against key public and gated routes to catch serious
 * and critical accessibility violations before they ship. Manual a11y
 * work (aria-labels, focus management, semantic HTML) is already in
 * place — this spec is the automated gate that prevents regressions.
 *
 * Fails the CI job on any violation with impact='critical' or
 * impact='serious'. Moderate/minor issues are logged but not gating
 * (they're frequently false positives or opinionated heuristics).
 *
 * Coverage:
 *   - /               — landing (public)
 *   - /login          — auth form (public)
 *   - /register       — auth form (public)
 *
 * Gated routes (/onboarding, /chat, /dashboard) require authenticated
 * fixtures; adding them is T5.5 continuation work. For now this spec
 * catches the public surface which is the most visible to new users.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PUBLIC_ROUTES = ['/', '/login', '/register'] as const;

for (const route of PUBLIC_ROUTES) {
  test(`a11y — ${route} has no critical or serious violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (blocking.length > 0) {
      // Build a readable failure message before asserting
      const report = blocking
        .map((v) => {
          const targets = v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(' '))
            .join(' | ');
          return `  [${v.impact}] ${v.id} — ${v.help}\n    targets: ${targets}`;
        })
        .join('\n');
      // eslint-disable-next-line no-console
      console.error(`a11y violations on ${route}:\n${report}`);
    }

    expect(blocking).toEqual([]);
  });
}

test('a11y — summary of non-blocking findings (landing)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // Informational only — this test always passes but logs a summary
  // of non-blocking findings so we can track them over time.
  const nonBlocking = results.violations.filter(
    (v) => v.impact === 'moderate' || v.impact === 'minor',
  );
  // eslint-disable-next-line no-console
  console.log(
    `[a11y/landing] passes=${results.passes.length} incomplete=${results.incomplete.length} moderate/minor violations=${nonBlocking.length}`,
  );
});
