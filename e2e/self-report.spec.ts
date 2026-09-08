import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('optional questionnaire works on desktop and mobile without ML or provider calls', async ({ page }, info) => {
  test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Synthetic local mode only');
  test.setTimeout(120_000);
  await page.setViewportSize({ width: info.project.name === 'mobile' ? 390 : 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  const posts: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { const url = new URL(request.url()); if (request.method() === 'POST' && (url.pathname.startsWith('/api/') || url.hostname.endsWith('anthropic.com'))) posts.push(request.url()); });
  await page.goto('/assessment');
  await expect(page.getByRole('heading', { name: 'Tu voz también tiene una medida.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Empezar las 30 preguntas' })).toBeDisabled();
  await page.screenshot({ path: `.impeccable/review/self-report/${info.project.name}-intro.png`, fullPage: true });
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Empezar las 30 preguntas' }).click();
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Siguientes 6' })).toBeDisabled();
  for (let block=0; block<5; block++) {
    const groups = page.locator('fieldset');
    await expect(groups).toHaveCount(6);
    for (let item=0; item<6; item++) await groups.nth(item).getByRole('radio', { name: 'Neutral, sin opinión' }).check();
    if (block === 0) {
      await page.screenshot({ path: `.impeccable/review/self-report/${info.project.name}-questions.png`, fullPage: true });
      expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    }
    await page.getByRole('button', { name: block < 4 ? 'Siguientes 6' : 'Ver mi resultado local' }).click();
  }
  await expect(page.getByRole('status').filter({ hasText: 'Resultado de esta prueba local' })).toBeVisible();
  await expect(page.getByLabel(/: 3.00 sobre 5/)).toHaveCount(5);
  await expect(page.getByText('El cuestionario no valida automáticamente el ML', { exact: false })).toBeVisible();
  await page.getByText('Elegí una pregunta para llevarlo a tu día', { exact: true }).click();
  await page.screenshot({ path: `.impeccable/review/self-report/${info.project.name}-result.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
  expect(posts).toEqual([]);
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await expect(page.getByRole('link', { name: 'Completar mi cuestionario' })).toBeVisible();
});
