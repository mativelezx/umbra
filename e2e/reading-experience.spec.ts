import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('reading chapters and glossary work with mouse, keyboard and touch', async ({ page }, info) => {
  test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Synthetic fixture only');
  test.setTimeout(120_000);
  await page.setViewportSize({ width: info.project.name === 'mobile' ? 390 : 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  const writes: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('/api/')) writes.push(request.url()); });
  await page.goto('/dashboard');
  await expect(page.locator('.reflection-scene')).toHaveAttribute('data-scene-motion', /running|paused/);
  await page.getByRole('button', { name: 'Leer mi resultado' }).click();
  await page.locator('.chapter-index summary').click();
  const chapters = page.getByRole('navigation', { name: 'Capítulos de tu lectura' });
  await expect(chapters.getByRole('button')).toHaveCount(5);
  await chapters.getByRole('button', { name: 'Lo que te mueve' }).click();
  await expect(page.getByText('Sección 4 de 5')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lo que te mueve', exact: true })).toBeVisible();
  await expect(page.locator('.reading-journey .reading-copy')).toContainText('Si ninguna de estas imágenes');
  await expect(page.locator('.reading-copy').getByRole('button', { name: 'Qué significa Si' })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Lectura simbólica', exact: true }).click();
  await page.getByText('Explorar funciones cognitivas y otros arquetipos', { exact: true }).click();
  const term = page.getByRole('button', { name: 'Qué significa Se', exact: true }).first();
  await term.scrollIntoViewIfNeeded();
  if (info.project.name === 'mobile') await term.tap();
  else await term.hover();
  await expect(page.getByRole('tooltip')).toContainText('Sensación extravertida');
  await expect(page.getByRole('tooltip')).toContainText('no mide una capacidad');
  await page.getByRole('tooltip').evaluate(async node => { await Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => undefined))); });
  await page.screenshot({ path: `.impeccable/review/personal-2026-09-07/${info.project.name}-glossary.png` });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await term.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Tu lectura', exact: true }).click();
  await expect(page.getByText('Sección 4 de 5')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(writes).toEqual([]);
  expect(errors).toEqual([]);
});

test('long synthetic PDF keeps all prose at a stable A4 width', async ({ page }, info) => {
  test.skip(process.env.E2E_DEMO_MODE !== 'true', 'Synthetic export only');
  test.setTimeout(120_000);
  await page.setViewportSize({ width: info.project.name === 'mobile' ? 390 : 1440, height: 960 });
  await page.goto('/export');
  await expect(page.locator('.pdf-root')).toContainText('Ana Demo');
  const paper = await page.locator('.pdf-root').boundingBox();
  expect(paper?.width).toBeCloseTo(687.87, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  // Deliberately long, impersonal fixture. It modifies only this test DOM.
  await page.evaluate(() => {
    const reading = document.querySelector('.pdf-reading .reading-copy');
    for (let index = 0; index < 8; index += 1) {
      const paragraph = document.createElement('p');
      paragraph.textContent = `Párrafo de prueba ${index + 1}. ` + 'Este texto inventado comprueba los saltos de página de una lectura extensa. No describe a una persona ni modifica información guardada. '.repeat(5);
      reading?.append(paragraph);
    }
  });
  await expect(page.locator('.pdf-reading')).toContainText('Párrafo de prueba 8.');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar PDF' }).click();
  const download = await downloading;
  await download.saveAs(`.impeccable/review/personal-pdf-2026-09-07/${info.project.name}/umbra-long.pdf`);
  expect(await download.failure()).toBeNull();
});
