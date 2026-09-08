import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [390, 768, 1292, 1440]) {
  test(`guided workspace stays usable at ${width}px`, async ({ page }, testInfo) => {
    test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Synthetic UI verification only; no paid generation');
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    const writes: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('/api/')) writes.push(request.url());
    });
    const capture = async (name: string) => {
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `.impeccable/review/reading-2026-09-07/${testInfo.project.name}-${width}-${name}.png`, fullPage: true });
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    };
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Ver mi cuestionario' })).toBeVisible();
    await capture('dashboard');
    await page.getByRole('button', { name: 'Ver mi cuestionario' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Tu cuestionario' })).toBeFocused();
    await page.getByRole('tab', { name: 'Tu lectura', exact: true }).click();
    await page.getByRole('button', { name: 'Siguiente sección' }).click();
    await expect(page.getByText('Sección 2 de 5')).toBeVisible();
    await page.getByRole('tab', { name: 'Tu lectura', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Otras miradas', exact: true })).toBeFocused();
    await page.getByText('Ver el módulo experimental de ML', { exact: true }).click();
    await expect(page.getByRole('region', { name: 'Sobre el análisis de texto' })).toContainText('Es un límite del modelo');
    await expect(page.locator('[data-testid^="bf-value-"]')).toHaveCount(0);
    await capture('model');
    await page.getByRole('tab', { name: 'Tu lectura', exact: true }).click();
    await expect(page.getByText('Sección 2 de 5')).toBeVisible();
    await page.getByRole('link', { name: /Ver actividades/ }).click();
    await page.waitForURL('**/plan');
    const firstActivity = page.getByRole('button', { name: 'Abrir Caminata sin destino' });
    await expect(firstActivity).toBeVisible();
    await capture('activities');
    await firstActivity.click();
    await expect(page.getByRole('heading', { name: 'Caminata sin destino' })).toBeFocused();
    await capture('activity-focus');
    await page.getByRole('button', { name: 'Volver a actividades' }).click();
    await expect(firstActivity).toBeFocused();
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await capture('login');
    await page.goto('/register');
    await expect(page.getByLabel('Tu nombre')).toBeVisible();
    await capture('register');
    expect(writes).toEqual([]);
    expect(errors).toEqual([]);
  });
}
