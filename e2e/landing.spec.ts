import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows the reflection headline and both entry links', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: testInfo.project.name === 'mobile' ? 390 : 1440, height: 960 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { name: 'Tu cabeza, en palabras.', exact: true })).toBeVisible();
    await expect(page).toHaveTitle('Umbra — Tu cabeza, en palabras.');
    await expect(page.getByText('Respondé preguntas sobre tus decisiones y hábitos. Recibí una lectura de tus respuestas y actividades para probar en tu día.', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Empezar/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver cómo funciona', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('approved-tagline.png') });
  });

  test('explains each source and the user data controls', async ({ page }) => {
    await page.goto('/');
    // Use heading role so the pillar cards aren't confused with the hero
    // copy paragraph that also mentions "Positive Computing".
    await expect(
      page.getByRole('heading', { name: /Tus respuestas no son una adivinación/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Una imagen para pensar, no una etiqueta/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Actividades de reflexión/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Tus datos y tus decisiones/i }),
    ).toBeVisible();
  });

  test('footer includes not-therapy disclaimer', async ({ page }) => {
    await page.goto('/');
    // The "no es terapia / 135" copy appears in both the hero and the footer;
    // this test only cares that the footer landmark contains it.
    const footer = page.locator('footer');
    await expect(footer.getByText(/Umbra no es terapia/i)).toBeVisible();
    await expect(footer.getByText(/135/)).toBeVisible();
  });

  test('Empezar link goes to /register', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Empezar/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });
});
