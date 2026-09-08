import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [390, 1440]) {
  test(`personal illustration and reading at ${width}px`, async ({ page }, info) => {
    test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Synthetic fixture only');
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/dashboard');
    const scene = page.locator('.reflection-scene');
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute('data-scene-motion', 'running');
    expect(await scene.evaluate(node => node.getAnimations({ subtree: true }).some(animation => animation.effect?.getTiming().iterations === Infinity))).toBe(true);
    const pause = page.getByRole('button', { name: 'Pausar ilustración' });
    await pause.focus();
    await page.keyboard.press('Enter');
    await expect(scene).toHaveAttribute('data-scene-motion', 'paused');
    expect(await scene.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations === Infinity).every(animation => animation.playState === 'paused'))).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.screenshot({ path: `.impeccable/review/personal-2026-09-07/${info.project.name}-${width}-viewport.png` });
    await page.screenshot({ path: `.impeccable/review/personal-2026-09-07/${info.project.name}-${width}-dashboard.png`, fullPage: true });
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: 'Reproducir ilustración' }).click();
    await page.getByRole('button', { name: 'Leer mi resultado' }).click();
    await page.locator('.reading-takeaway').scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute('data-scene-motion', 'paused');
    await page.getByRole('button', { name: 'Siguiente sección' }).click();
    await expect(page.getByText('Sección 2 de 5')).toBeVisible();
    await page.locator('.reading-passage').evaluate(async node => { await Promise.all(node.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => undefined))); });
    await page.screenshot({ path: `.impeccable/review/personal-2026-09-07/${info.project.name}-${width}-chapter.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(scene).toHaveAttribute('data-scene-motion', 'reduced');
    expect(await scene.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.goto('/plan');
    await page.getByRole('button', { name: 'Abrir Caminata sin destino' }).click();
    await page.screenshot({ path: `.impeccable/review/personal-2026-09-07/${info.project.name}-${width}-activity.png` });
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}
