import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Educational landing', () => {
  for (const width of [390, 1440]) {
    test(`portrait, readable layout and keyboard FAQ at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 960 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      const dimensions = page.getByRole('region', { name: 'Big Five, en palabras simples.' });
      await expect(dimensions.getByRole('article')).toHaveCount(5);
      const jung = page.getByRole('region', { name: 'Jung: otra forma de hacerte preguntas.' });
      const portrait = jung.getByRole('img');
      await portrait.scrollIntoViewIfNeeded();
      await expect.poll(() => portrait.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const credit = await page.request.get('/landing/source-note.md');
      expect(credit.status()).toBe(200);
      expect(await credit.text()).toContain('PD-US');
      const question = page.locator('summary').filter({ hasText: '¿Dónde interviene la inteligencia artificial?' });
      await question.focus();
      await question.press('Enter');
      const answer = page.locator('details').filter({ has: question });
      await expect(answer).toHaveAttribute('open', '');
      await expect(answer).toContainText('Claude, de Anthropic');
      await question.press('Space');
      await expect(answer).not.toHaveAttribute('open');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
      await dimensions.screenshot({ path: testInfo.outputPath(`big-five-${width}.png`) });
      await jung.screenshot({ path: testInfo.outputPath(`jung-${width}.png`) });
    });
  }
});
