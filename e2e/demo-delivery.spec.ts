import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('synthetic demo: eight questions, conservative results, activities, and actual PDF download', async ({ page }, testInfo) => {
  test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Requires explicit local demo');
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1152, height: 960 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const output = `.impeccable/review/personal-pdf-2026-09-07/${testInfo.project.name}`;
  const errors: string[] = [];
  const writes: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (request.method() === 'POST' && /\/api\//.test(request.url())) writes.push(request.url());
  });
  const capture = async (name: string) => {
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    await page.screenshot({ path: `${output}/${name}-viewport.png` });
  };
  await page.goto('/onboarding');
  await expect(page.getByRole('heading', { name: '¿Cómo querés empezar?' })).toBeVisible();
  await capture('onboarding-mode');
  await page.getByRole('button', { name: /Responder preguntas/ }).click();
  const syntheticAnswer = 'Esta es una respuesta ficticia para comprobar el recorrido de demostración. En este ejemplo inventado me gusta caminar, leer y compartir una charla tranquila. Cuando aparece una decisión prefiero detenerme y considerar las opciones. El contenido no describe a una persona real y no debe usarse como evidencia de personalidad, inferencia ni validación del modelo.';
  for (let step = 1; step <= 8; step += 1) {
    await expect(page.getByText(`Pregunta ${step} de 8`, { exact: true })).toBeVisible();
    const card = page.locator('.onboarding-card-enter');
    await expect(card.getByRole('heading', { level: 2 })).toBeVisible();
    if (step === 1) {
      await capture('onboarding-question');
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    }
    if (step === 1 || step === 8) await card.getByRole('textbox').fill(syntheticAnswer);
    else if (step === 2) await card.getByRole('slider').press('End');
    else if (step === 6) {
      const remaining = card.locator('.grid button');
      const count = await remaining.count();
      for (let rank = 0; rank < count; rank += 1) await remaining.first().click();
    } else await card.locator('button[aria-pressed]').first().click();
    await card.getByRole('button', { name: 'Continuar', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Escribile a tu vos de 6 meses' })).toBeVisible();
  await page.getByRole('button', { name: 'Saltear', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await capture('dashboard-reading');
  await page.getByRole('tab', { name: 'Datos del modelo' }).click();
  const statuses = page.locator('[data-testid^="bf-status-"]');
  await expect(statuses).toHaveCount(5);
  for (const status of await statuses.all()) await expect(status).toHaveText('evidencia insuficiente — sin cifra');
  await expect(page.locator('[data-testid^="bf-value-"]')).toHaveCount(0);
  await capture('model-five-low-confidence');
  await page.goto('/plan');
  await expect(page.getByRole('button', { name: 'Abrir Caminata sin destino' })).toBeVisible();
  await capture('plan');
  await page.goto('/export');
  const bigFive = page.locator('.pdf-section').filter({ has: page.getByRole('heading', { name: 'Big Five · estimación experimental de ML' }) });
  await expect(bigFive.getByText('evidencia insuficiente — sin cifra', { exact: true })).toHaveCount(5);
  await expect(bigFive.locator('.pdf-bar > *')).toHaveCount(0);
  await capture('export');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar PDF' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^umbra-perfil-.*\.pdf$/);
  await download.saveAs(`${output}/umbra-demo-final.pdf`);
  expect(await download.failure()).toBeNull();
  expect(writes).toEqual([]);
  expect(errors).toEqual([]);
});
