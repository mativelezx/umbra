import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Read-only captures of the published version. No new accounts, email sends,
// paid generation, profile edits or deletion requests are permitted here.
const enabled = process.env.E2E_CAPTURE_RELEASE === 'true';
const email = process.env.E2E_REUSE_SYNTHETIC_EMAIL;
test.beforeEach(async ({ page }, info) => {
  test.skip(!enabled, 'Explicit release-evidence opt-in required');
  expect(process.env.PLAYWRIGHT_BASE_URL).toBe('https://umbra-sigma.vercel.app');
  await page.setViewportSize({ width: info.project.name === 'mobile' ? 390 : 1440, height: 960 });
  await page.route('**/api/**', route => route.request().method() === 'GET' ? route.continue() : route.abort());
});

async function capture(page: Page, info: TestInfo, label: string) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('main').first()).toBeVisible();
  if (label === 'plan') await expect(page.getByRole('button', { name: /^Abrir / }).first()).toBeVisible();
  if (label === 'export') await expect(page.getByRole('button', { name: 'Descargar PDF' })).toBeEnabled();
  if (label === 'settings-profile') await expect(page.getByLabel('Nombre completo')).toHaveValue('Umbra E2E');
  if (label === 'settings-research-opt-out') await expect(page.getByRole('button', { name: 'Entrar en investigación', exact: true })).toBeEnabled();
  if (label === 'chat') {
    const history = page.locator('aside[aria-label="Historial de conversaciones"]');
    // The saved synthetic account has a real, persisted conversation. Wait for
    // positive data evidence, including when the mobile disclosure is closed.
    await expect(history.locator('li button').first()).toBeAttached();
    await expect(history.locator('[role="status"]')).toHaveCount(0);
    await expect(history.locator('[role="alert"]')).toHaveCount(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const blocking = accessibility.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''));
  await page.screenshot({ path: info.outputPath(`${label}.png`), fullPage: true, animations: 'disabled' });
  await info.attach(`${label}-checks`, { body: JSON.stringify({ path: new URL(page.url()).pathname, viewport: page.viewportSize(), overflow, blocking, moderateOrMinor: accessibility.violations.filter(item => !blocking.includes(item)).map(item => ({ id: item.id, impact: item.impact })) }, null, 2), contentType: 'application/json' });
  expect.soft(overflow, `${label}: horizontal overflow`).toBe(false);
  expect.soft(blocking, `${label}: serious/critical accessibility`).toEqual([]);
}

test('public screens, forms and error states', async ({ page }, info) => {
  test.setTimeout(240_000);
  for (const [path, label] of [['/', 'landing'], ['/login', 'login'], ['/register', 'register'], ['/forgot-password', 'forgot-password'], ['/reset-password', 'reset-without-session'], ['/privacy', 'privacy'], ['/terms', 'terms'], ['/auth/auth-code-error', 'auth-link-error'], ['/pagina-inexistente-qa', 'not-found']]) {
    await page.goto(path);
    await capture(page, info, label!);
  }
});

test('saved synthetic account screens and PDF', async ({ page }, info) => {
  test.skip(!email, 'Completed synthetic account required');
  expect(email).toMatch(/^umbra-e2e-\d+@test\.local$/);
  test.setTimeout(300_000);
  await page.goto('/login');
  await page.getByLabel('Email').fill(email!);
  expect(process.env.E2E_SYNTHETIC_PASSWORD, 'Use a private QA password, never publish it with screenshots').toBeTruthy();
  await page.getByLabel('Contraseña').fill(process.env.E2E_SYNTHETIC_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.waitForURL(url => url.pathname === '/dashboard');
  for (const path of ['/dashboard', '/assessment', '/plan', '/chat', '/export', '/settings', '/settings/profile', '/settings/export', '/settings/research-opt-out', '/settings/delete', '/settings/delete/confirm', '/consent', '/onboarding']) {
    await page.goto(path);
    if (path === '/chat') await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toBeVisible();
    await capture(page, info, path.slice(1).replaceAll('/', '-'));
    if (path === '/dashboard') {
      for (const [label, file] of [['Tu lectura', 'dashboard-lectura'], ['Otras miradas', 'dashboard-jung']]) {
        await page.getByRole('tab', { name: label, exact: true }).click();
        await capture(page, info, file!);
      }
      await page.getByText('Explorar funciones cognitivas y otros arquetipos', { exact: true }).click();
      await capture(page, info, 'dashboard-jung-detalle');
      await page.getByText('Explorar funciones cognitivas y otros arquetipos', { exact: true }).click();
      await page.getByText('Ver el módulo experimental de ML', { exact: true }).click();
      await capture(page, info, 'dashboard-modelo');
    }
    if (path === '/export') {
      const downloading = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Descargar PDF' }).click();
      const download = await downloading;
      expect(await download.failure()).toBeNull();
      await download.saveAs(info.outputPath('informe-sintetico.pdf'));
    }
  }
});
