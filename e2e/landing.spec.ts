import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows hero with Instrument Serif title + both CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Conocé tu sombra/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Comenzar viaje/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Saber más/i })).toBeVisible();
  });

  test('shows 4 pilar cards without 3-column grid (AI slop avoidance)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Base teórica real/i)).toBeVisible();
    await expect(page.getByText(/Jung directo, no MBTI/i)).toBeVisible();
    await expect(page.getByText(/Positive Computing/i)).toBeVisible();
    await expect(page.getByText(/Español rioplatense/i)).toBeVisible();
  });

  test('footer includes not-therapy disclaimer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Umbra no es terapia/i).first()).toBeVisible();
    await expect(page.getByText(/135/)).toBeVisible();
  });

  test('Comenzar viaje link goes to /register', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Comenzar viaje/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });
});
