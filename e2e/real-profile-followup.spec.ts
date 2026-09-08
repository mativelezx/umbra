import { test, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const email = process.env.E2E_REUSE_SYNTHETIC_EMAIL;
async function login(page: Page, destination: string) {
  expect(email).toMatch(/^umbra-e2e-\d+@test\.local$/);
  if (process.env.E2E_ALLOW_REMOTE_FLOW === 'true') {
    expect(new URL(process.env.PLAYWRIGHT_BASE_URL!).origin).toBe('https://umbra-sigma.vercel.app');
    expect(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname).toBe('googyntbflaqqriwhjxi.supabase.co');
  } else {
    expect(['127.0.0.1', 'localhost']).toContain(new URL(process.env.PLAYWRIGHT_BASE_URL!).hostname);
  }
  await page.goto(`/login?redirectedFrom=${destination}`);
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Contraseña').fill('UmbraE2E-Test-1234!');
  await page.getByRole('button', { name: /^Entrar$/ }).click();
  // Match the path, not a redirectedFrom query that already ends in it.
  await page.waitForURL(url => url.pathname === destination, { timeout: 45_000 });
}

test.describe('Existing synthetic profile integration', () => {
  test.describe.configure({ mode: 'serial', retries: 0 });
  test.skip(process.env.E2E_REAL_FLOW !== 'true' || !email, 'Needs approved local synthetic account');

  test('saved activities survive reload and profile PDF downloads', async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await login(page, '/plan');
    const open = page.getByRole('button', { name: /^Abrir / }).first();
    await expect(open).toBeVisible();
    const title = await open.getAttribute('aria-label');
    await open.click();
    const goal = page.getByRole('checkbox').first();
    const previous = await goal.isChecked();
    const save = () => page.waitForResponse(response => new URL(response.url()).pathname === '/rest/v1/development_plans' && response.request().method() === 'PATCH', { timeout: 15_000 });
    try {
      const [changed] = await Promise.all([save(), goal.press('Space')]);
      expect(changed.ok()).toBe(true);
      await expect(goal).toBeChecked({ checked: !previous });
      await page.reload();
      await page.getByRole('button', { name: title!, exact: true }).click();
      await expect(page.getByRole('checkbox').first()).toBeChecked({ checked: !previous });
    } finally {
      const currentGoal = page.getByRole('checkbox').first();
      if (!page.isClosed() && await currentGoal.isVisible() && await currentGoal.isChecked() !== previous) {
        const [restored] = await Promise.all([save(), currentGoal.press('Space')]);
        expect(restored.ok()).toBe(true);
      }
    }
    await page.goto('/export');
    await expect(page.getByRole('button', { name: 'Descargar PDF' })).toBeEnabled();
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar PDF' }).click();
    const download = await downloadEvent;
    expect(await download.failure()).toBeNull();
    await download.saveAs(testInfo.outputPath('synthetic-real-profile.pdf'));
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks).subarray(0, 5).toString()).toBe('%PDF-');
  });

  test('one paid chat response persists and can be reopened', async ({ page }) => {
    test.skip(process.env.E2E_ALLOW_PAID_AI !== 'true', 'Requires additional paid-chat opt-in');
    if (process.env.E2E_ALLOW_REMOTE_FLOW === 'true') {
      expect(process.env.E2E_APPROVED_BUDGET_USD).toBe('1');
      const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
      const ledger = await admin.from('rate_limits').select('cost_usd_cents');
      expect(ledger.error).toBeNull();
      expect(ledger.data!.reduce((sum, row) => sum + row.cost_usd_cents, 0)).toBeLessThan(60);
    }
    test.setTimeout(150_000);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, '/chat');
    const message = 'Caso sintético de prueba QA: me gusta leer y caminar. Quisiera una pregunta breve para reflexionar sobre cómo elijo mis actividades, sin sacar conclusiones sobre mi personalidad.';
    const responseEvent = page.waitForResponse(response => new URL(response.url()).pathname === '/api/chat');
    await page.getByRole('textbox', { name: 'Tu mensaje' }).fill(message);
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();
    const response = await responseEvent;
    expect(response.ok()).toBe(true);
    // The client cancels its reader after terminal completion. Chromium may
    // discard Network.getResponseBody, so verify visible completion + persisted
    // history instead of relying on DevTools retaining the stream body.
    await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toBeEnabled({ timeout: 120_000 });
    await expect(page.getByRole('alert').filter({ hasText: 'Se cortó la conexión' })).toHaveCount(0);
    const list = await page.request.get('/api/chat/conversations');
    expect(list.ok()).toBe(true);
    const conversations = (await list.json()).data.conversations as Array<{ id: string; title: string }>;
    const id = conversations.find(item => item.title.startsWith('Caso sintético de prueba QA'))?.id;
    expect(typeof id).toBe('string');
    const history = await page.request.get(`/api/chat/conversations/${id}`);
    expect(history.ok()).toBe(true);
    const payload = await history.json();
    expect(payload.data.messages.some((item: { role: string; content: string }) => item.role === 'user' && item.content === message)).toBe(true);
    expect(payload.data.messages.some((item: { role: string; content: string }) => item.role === 'assistant' && item.content.length > 20)).toBe(true);
    await page.reload();
    await page.getByRole('complementary', { name: 'Historial de conversaciones' }).getByRole('button').filter({ hasText: 'Caso sintético de prueba QA' }).first().click();
    await expect(page.getByRole('region', { name: 'Mensajes de la conversación' }).getByText(message, { exact: true })).toBeVisible();
  });
});
