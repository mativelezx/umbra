import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Explicit synthetic-demo evidence. This does not exercise authentication,
// model inference, provider availability, or persistence of real user data.
test.describe('UI polish — local synthetic demo', () => {
  test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Requires the explicitly configured local demo');

  for (const width of [390, 1152, 1440]) {
    test(`reading, activities, forms, and motion at ${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const output = `.impeccable/review/polish-2026-09-07/${test.info().project.name}/${width}`;

      for (const route of ['/', '/login', '/dashboard', '/plan', '/export']) {
        await page.goto(route);
        await expect(page.getByRole('heading', route === '/export'
          ? { level: 1, name: 'Tu informe en PDF' }
          : { level: 1 })).toBeVisible();
        if (route === '/plan') {
          await expect(page.getByRole('button', { name: 'Abrir Caminata sin destino' })).toBeVisible();
        }
        await page.evaluate(() => document.fonts.ready);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
        const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        expect(a11y.violations, `Accessibility at ${route} / ${width}px`).toEqual([]);
        await page.screenshot({ path: `${output}-${route === '/' ? 'landing' : route.slice(1)}.png`, fullPage: true });
        await page.screenshot({ path: `${output}-${route === '/' ? 'landing' : route.slice(1)}-viewport.png` });
      }

      await page.goto('/dashboard');
      const modelTab = page.getByRole('tab', { name: 'Otras miradas' });
      await page.getByRole('tab', { name: 'Tu lectura' }).press('ArrowRight');
      await expect(modelTab).toBeFocused();
      await expect(modelTab).toHaveAttribute('aria-selected', 'true');
      await page.getByText('Ver el módulo experimental de ML', { exact: true }).click();
      await page.screenshot({ path: `${output}-model.png`, fullPage: true });
      await page.getByRole('tab', { name: 'Tu lectura' }).click();
      await page.getByRole('button', { name: 'Siguiente sección' }).click();
      await expect(page.getByText('Sección 2 de 5')).toBeVisible();
      await page.getByRole('button', { name: 'Ver lectura completa' }).click();
      await expect(page.getByRole('button', { name: 'Leer por secciones' })).toBeVisible();

      await page.goto('/plan');
      await page.getByRole('button', { name: 'Abrir Caminata sin destino' }).click();
      await expect(page.getByRole('heading', { name: 'Caminata sin destino' })).toBeVisible();
      const step = page.getByRole('checkbox').first();
      await step.press('Space');
      await expect(step).toBeChecked();
      await page.screenshot({ path: `${output}-activity.png`, fullPage: true });

      await page.goto('/');
      await expect(page.getByRole('button', { name: 'Movimiento reducido' })).toBeDisabled();
      await page.getByRole('tab', { name: 'Lectura', exact: true }).click();
      await expect(page.getByRole('tabpanel', { name: 'Lectura', exact: true })).toBeVisible();
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const motion = page.getByRole('button', { name: 'Pausar movimiento' });
      await motion.scrollIntoViewIfNeeded();
      await expect(motion).toBeEnabled();
      await motion.click();
      await expect(page.getByRole('button', { name: 'Reanudar movimiento' })).toBeEnabled();
      expect(errors).toEqual([]);
    });
  }
});
