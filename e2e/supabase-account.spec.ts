import { test, expect } from '@playwright/test';

// Real local Supabase, one explicitly supplied synthetic account, no AI calls.
const email = process.env.E2E_REUSE_SYNTHETIC_EMAIL;
test('real login, profile persistence, account export and anonymous boundary', async ({ page, browser }) => {
  test.skip(process.env.E2E_REAL_FLOW !== 'true' || !email, 'Needs approved synthetic local account');
  expect(email).toMatch(/^umbra-e2e-\d+@test\.local$/);
  expect(['127.0.0.1', 'localhost']).toContain(new URL(process.env.PLAYWRIGHT_BASE_URL!).hostname);
  test.setTimeout(120_000);
  const anonymous = await browser.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL });
  try {
    expect((await anonymous.request.get('/api/account/export')).status()).toBe(401);
  } finally { await anonymous.close(); }

  await page.goto('/login?redirectedFrom=/settings/profile');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Contraseña').fill('UmbraE2E-Test-1234!');
  await page.getByRole('button', { name: /^Entrar$/ }).click();
  await page.waitForURL('**/settings/profile');
  const name = page.getByLabel('Nombre completo');
  await expect(name).not.toHaveValue('');
  const originalName = await name.inputValue();
  try {
    await name.fill('Umbra E2E verificación');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Listo, tu nombre quedó actualizado.')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Nombre completo')).toHaveValue('Umbra E2E verificación');

    await page.goto('/settings/export');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar mis datos' }).click();
    const download = await downloadEvent;
    expect(await download.failure()).toBeNull();
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    expect(data.user.email).toBe(email);
    expect(data.profile.full_name).toBe('Umbra E2E verificación');
    expect(data.profile.research_opt_in).toBe(false);
    expect(data.consent_records.length).toBeGreaterThan(0);
    expect(data.consent_records.every((row: { user_id: string }) => row.user_id === data.user.id)).toBe(true);
    expect(data.onboarding_sessions.length).toBeGreaterThan(0);
    expect(data.onboarding_sessions.every((row: { user_id: string }) => row.user_id === data.user.id)).toBe(true);
    expect(data).toHaveProperty('usability_responses');
    expect(data).not.toHaveProperty('access_token');
    await page.goto('/settings/research-opt-out');
    await expect(page.getByText('No participando', { exact: true })).toBeVisible();
  } finally {
    const restored = await page.request.patch('/api/account/profile', { data: { full_name: originalName } });
    expect(restored.ok()).toBe(true);
  }
});
