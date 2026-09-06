import { test, expect } from '@playwright/test';

// Phase 7 smoke tests: the hardening layer that doesn't need auth.
// - SEO files (robots.txt, sitemap.xml, metadata)
// - Public error boundaries (404, global error)
// - OG metadata presence

test.describe('Phase 7 — SEO + error boundaries + metadata', () => {
  test('robots.txt is served with disallow rules for protected routes', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('User-Agent: *');
    expect(body).toMatch(/Disallow:\s*\/api\//);
    expect(body).toMatch(/Disallow:\s*\/dashboard/);
    expect(body).toContain('Sitemap:');
  });

  test('sitemap.xml advertises only public pages (no auth routes)', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<urlset');
    expect(body).toMatch(/<loc>[^<]*\/privacy<\/loc>/);
    expect(body).toMatch(/<loc>[^<]*\/terms<\/loc>/);
    // Auth endpoints are Disallowed in robots; must not be advertised.
    expect(body).not.toMatch(/<loc>[^<]*\/login<\/loc>/);
    expect(body).not.toMatch(/<loc>[^<]*\/register<\/loc>/);
  });

  test('landing page has OG + Twitter metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      /Umbra/,
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      /Jung/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      'content',
      'es_AR',
    );
  });

  test('theme-color meta is set to umbra-void', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#f7f7f4',
    );
  });

  test('404 page renders the custom not-found boundary', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(
      page.getByRole('heading', { name: /Te perdiste en la sombra/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Volver al inicio/i })).toBeVisible();
    // Crisis disclaimer still visible on 404
    await expect(page.getByText(/Umbra no es terapia/i)).toBeVisible();
  });
});

test.describe('Phase 7 — /settings root landing (unauth)', () => {
  test('/settings redirects to /login for unauthenticated users', async ({ page }) => {
    const res = await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
    expect(res?.ok()).toBeTruthy();
  });
});
