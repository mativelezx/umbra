import { test, expect } from '@playwright/test';

test.describe('Protected routes redirect unauthenticated users', () => {
  const protectedPaths = [
    '/dashboard',
    '/chat',
    '/plan',
    '/export',
    '/onboarding',
    '/settings/profile',
  ];

  for (const path of protectedPaths) {
    test(`${path} redirects to /login`, async ({ page }) => {
      const response = await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
      expect(response?.ok()).toBeTruthy();
    });
  }
});
