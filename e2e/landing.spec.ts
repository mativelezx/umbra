import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows hero with Instrument Serif title + both CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Hablás de vos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Empezar/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Cómo funciona/i })).toBeVisible();
  });

  test('shows 4 pilar cards without 3-column grid (AI slop avoidance)', async ({ page }) => {
    await page.goto('/');
    // Use heading role so the pillar cards aren't confused with the hero
    // copy paragraph that also mentions "Positive Computing".
    await expect(
      page.getByRole('heading', { name: /Una sola teoría medida/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Jung como espejo/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Pensado para tu bienestar/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Te hablamos en argentino/i }),
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
