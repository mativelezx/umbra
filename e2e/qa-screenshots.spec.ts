import { test, expect } from '@playwright/test';

// Read-only visual review of an already completed synthetic account.
// full-flow.spec.ts owns registration and paid generation; do not duplicate it.
const email = process.env.E2E_CAPTURE_SYNTHETIC_EMAIL;
test('capture saved synthetic results without creating accounts or consuming AI', async ({ page, browserName }, info) => {
  test.skip(browserName !== 'chromium' || !email, 'Requires a completed synthetic QA account');
  expect(email).toMatch(/^umbra-e2e-\d+@test\.local$/);
  expect(['localhost','127.0.0.1']).toContain(new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').hostname);
  await page.route('**/api/**', route => route.request().method() === 'GET' ? route.continue() : route.abort());
  await page.goto('/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Contraseña').fill('UmbraE2E-Test-1234!');
  await page.getByRole('button', {name:'Entrar',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  for (const [path, heading] of [['/dashboard','Mi resultado'],['/plan','Actividades'],['/export','Tu informe en PDF']] as const) {
    await page.goto(path);
    await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();
    await page.screenshot({path:info.outputPath(`${path.slice(1)}-saved.png`),fullPage:true});
  }
});
