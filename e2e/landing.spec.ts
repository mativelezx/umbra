import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows the reflection headline and both entry links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Un espacio para mirarte con atención/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Empezar/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Cómo funciona/i })).toBeVisible();
  });

  test('explains each source and the user data controls', async ({ page }) => {
    await page.goto('/');
    // Use heading role so the pillar cards aren't confused with the hero
    // copy paragraph that also mentions "Positive Computing".
    await expect(
      page.getByRole('heading', { name: /Big Five experimental/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Jung como interpretación/i }),
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
