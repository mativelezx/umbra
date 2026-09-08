import { test, expect } from '@playwright/test';

test('brand interlude covers the viewport and the report has no olive frame', async ({ page }, info) => {
  test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Synthetic fixture only');
  test.setTimeout(120_000);
  const width = info.project.name === 'mobile' ? 390 : 1440;
  await page.setViewportSize({ width, height: 960 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Freeze only the overlay at its opaque frame for an honest storyboard capture.
  // Native, uninterrupted playback is tested separately in workspace-motion.
  await page.addInitScript(() => {
    const nativeAnimate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const animation = nativeAnimate.call(this, frames, options);
      if (this.classList.contains('workspace-brand-transition')) { animation.pause(); animation.currentTime = 500; }
      return animation;
    };
  });
  await page.goto('/dashboard');
  const overlay = page.locator('.workspace-brand-transition');
  await expect(overlay).toHaveAttribute('data-transition-state', 'active');
  await overlay.locator('svg').evaluateAll(async nodes => { await Promise.all(nodes.flatMap(node => node.getAnimations().map(animation => animation.finished.catch(() => undefined)))); });
  expect(await overlay.evaluate(node => { const b = node.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; })).toEqual([0, 0, width, 960]);
  await page.screenshot({ path: `.impeccable/review/personal-2026-09-07/${info.project.name}-${width}-brand.png` });
  await page.keyboard.press('Escape');
  await expect(overlay).toHaveAttribute('data-transition-state', 'quiet');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/export');
  await expect(page.locator('.pdf-root')).toContainText('Ana Demo');
  const preview = page.locator('.report-preview');
  const surface = await preview.evaluate(node => { const style = getComputedStyle(node); return { background: style.backgroundColor, border: style.borderWidth, padding: style.padding }; });
  expect(surface).toEqual({ background: 'rgb(255, 255, 255)', border: '0px', padding: '0px' });
  await page.screenshot({ path: `.impeccable/review/personal-2026-09-07/${info.project.name}-${width}-report-preview.png` });
});
