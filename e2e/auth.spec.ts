import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
  test('register page renders form fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Crear tu cuenta/i })).toBeVisible();
    await expect(page.getByLabel('Tu nombre')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: /Crear cuenta/i })).toBeVisible();
  });

  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Bienvenido de vuelta/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('register form shows inline error on weak password', async ({ page }) => {
    await page.goto('/register');
    const name = page.getByLabel('Tu nombre');
    const email = page.getByLabel('Email');
    const password = page.getByLabel('Contraseña');

    await name.fill('Test User');
    await email.fill('test@example.com');
    await password.fill('short');
    await expect(name).toHaveValue('Test User');
    await expect(email).toHaveValue('test@example.com');
    await expect(password).toHaveValue('short');

    await page.getByRole('button', { name: /Crear cuenta/i }).click();
    await expect(page.getByText(/8 caracteres o más/i)).toBeVisible();
  });

  test('privacy page renders', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /Política de privacidad/i })).toBeVisible();
    await expect(page.getByText(/Ley 25\.326/).first()).toBeVisible();
  });

  test('terms page renders', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /Términos de uso/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Lo que no es/i })).toBeVisible();
    await expect(page.getByText(/Umbra no es terapia/i)).toBeVisible();
  });
});
