import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Authored hero and SVG motion', () => {
  test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Requires the isolated synthetic demo');

  for (const width of [390, 1440]) {
    test(`scene, pause, keyboard and reduced motion at ${width}px`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width, height: 960 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu cabeza, en palabras.');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const hero = page.getByRole('region', { name: 'Vista de ejemplo de Umbra' });
      await hero.scrollIntoViewIfNeeded();
      await expect(hero).toHaveAttribute('data-motion', 'running');
      const scene = page.locator('[data-story-scene]');
      await expect.poll(() => scene.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBeGreaterThan(3);
      await page.getByRole('button', { name: 'Pausar movimiento' }).click();
      await expect(hero).toHaveAttribute('data-motion', 'paused');
      expect(await scene.evaluate(element => element.getAnimations({ subtree: true }).every(animation => animation.playState === 'paused'))).toBe(true);

      const questions = page.getByRole('tab', { name: 'Preguntas', exact: true });
      await questions.focus();
      await questions.press('End');
      await expect(page.getByRole('tab', { name: 'Actividades', exact: true })).toBeFocused();
      await expect(scene).toHaveAttribute('data-story-scene', 'activities');
      await expect(page.getByRole('tabpanel')).toContainText('Probá un paso pequeño');
      expect(await page.getByRole('tabpanel').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
      await page.getByRole('tab', { name: 'Lectura', exact: true }).click();
      await expect(page.getByRole('tabpanel')).toContainText('Interpretación de ejemplo');
      await expect(hero).toHaveAttribute('data-motion', 'paused');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(hero).toHaveAttribute('data-motion', 'reduced');
      await expect(page.getByRole('button', { name: 'Movimiento reducido' })).toBeDisabled();
      // Media-query changes reach React and the CSS animation timeline on
      // separate frames in WebKit. Assert the settled state, without filtering
      // animations or accepting short-running motion as a success.
      await expect.poll(() => scene.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);

      await page.getByRole('tab', { name: 'Preguntas', exact: true }).click();
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `.impeccable/review/story-2026-09-07/${testInfo.project.name}-${width}-landing.png`, fullPage: true });
      await page.screenshot({ path: `.impeccable/review/story-2026-09-07/${testInfo.project.name}-${width}-hero.png` });
      await page.goto('/onboarding');
      const art = page.locator('.reflection-art').first();
      await art.scrollIntoViewIfNeeded();
      await expect(art).toHaveAttribute('data-art-motion', 'reduced');
      await expect.poll(() => art.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(art).toHaveAttribute('data-art-motion', 'running');
      await expect.poll(() => art.evaluate(element => element.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
      expect(await art.evaluate(element => element.getAnimations({ subtree: true }).every(animation => animation.effect?.getTiming().iterations === 1))).toBe(true);
      await page.emulateMedia({ media: 'print' });
      await expect.poll(() => art.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
      expect(errors).toEqual([]);
    });
  }
});
