import { test, expect } from '@playwright/test';

// Real browser and local authentication. Observes native animations without
// replacing them; no model/provider calls and no saved profile changes.
const email = process.env.E2E_REUSE_SYNTHETIC_EMAIL;
type MotionWindow = typeof window & { workspaceEntrances: number[] };

for (const width of [390, 1440]) {
  test(`workspace continuity and reduced motion at ${width}px`, async ({ page }, testInfo) => {
    test.skip(process.env.E2E_REAL_FLOW !== 'true' || !email, 'Needs approved synthetic local account');
    test.setTimeout(90_000);
    expect(email).toMatch(/^umbra-e2e-\d+@test\.local$/);
    expect(['localhost', '127.0.0.1']).toContain(new URL(process.env.PLAYWRIGHT_BASE_URL!).hostname);
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      (window as MotionWindow).workspaceEntrances = [];
      const original = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        const animation = original.call(this, frames, options);
        if (this.classList.contains('workspace-brand-transition')) {
          (window as MotionWindow).workspaceEntrances.push(Number(typeof options === 'number' ? options : options?.duration));
        }
        return animation;
      };
    });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/login?redirectedFrom=/settings/profile');
    await page.getByLabel('Email').fill(email!);
    await page.getByLabel('Contraseña').fill('UmbraE2E-Test-1234!');
    await page.getByRole('button', { name: /^Entrar$/ }).click();
    await page.waitForURL(url => url.pathname === '/settings/profile');
    const name = page.getByLabel('Nombre completo');
    await expect(name).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as MotionWindow).workspaceEntrances.length)).toBeGreaterThan(0);
    const count = await page.evaluate(() => (window as MotionWindow).workspaceEntrances.length);
    const nav = page.locator(width < 1024 ? '.workspace-tabbar' : '.workspace-sidebar');
    const navBefore = await nav.boundingBox();
    expect(await nav.locator('xpath=ancestor::*[contains(@class,"workspace-transition")]').count()).toBe(0);
    await name.fill('Borrador local, no guardar');
    await expect(name).toBeFocused();
    expect(await page.evaluate(() => (window as MotionWindow).workspaceEntrances.length)).toBe(count);
    await expect(page.locator('.workspace-transition')).toHaveAttribute('data-workspace-motion', 'quiet');
    await expect(name).toHaveValue('Borrador local, no guardar');

    await page.getByRole('link', { name: 'Exportar datos', exact: true }).click();
    await page.waitForURL('**/settings/export');
    await expect(page.getByRole('button', { name: 'Descargar mis datos' })).toBeVisible();
    expect(await page.evaluate(() => (window as MotionWindow).workspaceEntrances.length)).toBe(count);
    expect(await nav.boundingBox()).toEqual(navBefore);
    expect(await page.evaluate(() => (window as MotionWindow).workspaceEntrances.every(duration => duration === 1240))).toBe(true);
    expect(await page.locator('.workspace-brand-transition').evaluate(node => { const box = node.getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height }; })).toEqual({ x: 0, y: 0, width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`workspace-${width}.png`), fullPage: true });

    // Internal links remount page shells, but must not replay the full-screen brand.
    for (const href of ['/dashboard', '/plan', '/chat', '/export']) {
      const link = page.locator(`a[href="${href}"]:visible`).first();
      await link.click();
      await page.waitForURL(url => url.pathname === href);
      await expect(page.locator('.workspace-transition')).toBeVisible();
      expect(await page.evaluate(() => (window as MotionWindow).workspaceEntrances.length)).toBe(count);
      await expect(page.locator('.workspace-brand-transition')).toHaveAttribute('data-transition-state', 'quiet');
    }

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/settings/profile');
    await expect(page.getByLabel('Nombre completo')).toBeVisible();
    expect(await page.evaluate(() => (window as MotionWindow).workspaceEntrances)).toEqual([]);
    await page.getByLabel('Nombre completo').fill('Sigue editable, sin guardar');
    await expect(page.getByLabel('Nombre completo')).toHaveValue('Sigue editable, sin guardar');
    expect(await page.evaluate(() => document.querySelector('.workspace-brand-transition')?.getAnimations({ subtree: true }).length)).toBe(0);
    expect(errors).toEqual([]);
  });
}
