import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
  test('register page renders form fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Empezá tu viaje/i })).toBeVisible();
    await expect(page.getByLabel('Nombre completo')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: /Crear cuenta/i })).toBeVisible();
  });

  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Ingresar/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('register form shows inline error on weak password', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Nombre completo').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Contraseña').fill('short');
    await page.getByRole('button', { name: /Crear cuenta/i }).click();
    await expect(page.getByText(/al menos 8 caracteres/i)).toBeVisible();
  });

  test('privacy and terms pages render', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /Política de privacidad/i })).toBeVisible();
    await expect(page.getByText(/Ley 25.326/)).toBeVisible();

    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /Términos de uso/i })).toBeVisible();
    await expect(page.getByText(/Umbra NO es terapia/i)).toBeVisible();
  });
});
