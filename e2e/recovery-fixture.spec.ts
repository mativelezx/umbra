import { test, expect, type Page } from '@playwright/test';
import { build } from 'esbuild';
import AxeBuilder from '@axe-core/playwright';
import { createSelfReport } from '../lib/assessment/bfi2s';

// Actual React components, simulated HTTP only. These tests exercise UI branches,
// not provider quality, database persistence or human psychological validity.
test.describe('Recovery and question types — isolated synthetic fixtures', () => {
  test.skip(process.env.E2E_COMPONENT_FIXTURES !== 'true', 'Requires explicit isolated-fixture mode');
  let script: string;
  let css: string;
  const reflection = 'Este es un texto ficticio para probar el formulario. Me gusta organizar mis tareas con tiempo y revisar los pasos antes de terminar una actividad.';
  test.beforeAll(async () => {
    const result = await build({
      stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
        import React from 'react'; import {createRoot} from 'react-dom/client';
        import {ChatShell} from './components/chat/ChatShell';
        import {SelfReportForm} from './components/assessment/SelfReportForm';
        import {QuestionCard} from './components/onboarding/QuestionCard';
        import {CartaForm} from './components/onboarding/CartaForm';
        import {DEMO_ONBOARDING_SCRIPT} from './lib/demo/onboarding-script';
        const kind = document.body.dataset.fixture;
        const finish = value => { document.getElementById('outcome').textContent = JSON.stringify(value ?? 'continued'); };
        const component = kind === 'chat' ? <ChatShell profile={null}/> : kind === 'report' ? <SelfReportForm profileId="qa-profile" onContinue={()=>finish()}/> : kind === 'letter' ? <CartaForm profileId="qa-profile"/> : <QuestionCard question={DEMO_ONBOARDING_SCRIPT.find(x=>x.question.type===kind).question} onSubmit={finish} submitting={false}/>;
        createRoot(document.getElementById('fixture-root')).render(component);
      ` }, bundle: true, write: false, outfile: 'fixture.js', format: 'iife', platform: 'browser', jsx: 'automatic',
      define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_DEMO_MODE': '"false"' },
      plugins: [{ name: 'fixture-adapters', setup(builder) {
        builder.onResolve({ filter: /^(next\/navigation|next\/link|@\/lib\/providers\/auth-context)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: args.path === 'next/navigation'
          ? `export const usePathname=()=>'/chat'; export const useRouter=()=>({push:path=>document.getElementById('outcome').textContent=path});`
          : args.path === 'next/link' ? `import React from 'react'; export default function Link({children,...props}) {return <a {...props}>{children}</a>}`
            : `export const useAuth=()=>({user:{id:'fixture-owner'},loading:false,signOut:async()=>{}});`, loader: 'tsx', resolveDir: process.cwd() }));
      } }],
    });
    script = result.outputFiles.find(file => file.path.endsWith('.js'))!.text;
    css = result.outputFiles.find(file => file.path.endsWith('.css'))?.text ?? '';
  });

  async function mount(page: Page, kind: string) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // An unhandled request may never reach a real backend in this harness.
    await page.route('**/api/**', route => route.fulfill({ status: 503, json: { error: 'unconfigured_fixture' } }));
    await page.route('**/api/chat/conversations', route => route.fulfill({ json: { data: { conversations: [] } } }));
    await page.goto('/login');
    const styles = await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(link => link.outerHTML).join(''));
    const bodyClass = await page.locator('body').getAttribute('class');
    const htmlClass = await page.locator('html').getAttribute('class');
    await page.setContent(`<html lang="es" class="${htmlClass ?? ''}"><head><title>Prueba aislada</title>${styles}</head><body class="${bodyClass ?? ''}" data-fixture="${kind}"><p role="note">Prueba aislada: datos y servicios simulados.</p><div id="fixture-root"></div><output id="outcome" aria-label="Resultado de prueba"></output></body></html>`);
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
  }

  for (const kind of ['open_text', 'multi_choice', 'scenario', 'ranking', 'polarity', 'metaphor']) {
    test(`${kind}: requires an intentional answer and serializes its type`, async ({ page }) => {
      await mount(page, kind);
      const next = page.getByRole('button', { name: 'Continuar', exact: true });
      await expect(next).toBeDisabled();
      if (kind === 'open_text') {
        await page.locator('textarea').fill('Demasiado corto.');
        await expect(next).toBeDisabled();
        await page.locator('textarea').fill(reflection);
      } else if (kind === 'polarity') {
        await page.getByRole('slider').press('ArrowRight');
      } else if (kind === 'ranking') {
        await page.locator('.grid button').first().click();
        await page.getByRole('button', { name: 'reiniciar' }).click();
        await expect(next).toBeDisabled();
        while (await page.locator('.grid button').count()) await page.locator('.grid button').last().click();
      } else {
        await page.locator('[aria-pressed]').first().click();
      }
      await expect(next).toBeEnabled();
      await next.click();
      const answer = JSON.parse(await page.locator('#outcome').innerText());
      expect(answer.type).toBe(kind);
      if (kind === 'ranking') expect(answer.orderedIds).toHaveLength(4);
      if (kind === 'open_text') expect(answer.text).toBe(reflection);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    });
  }

  test('questionnaire can be skipped without sending any personal responses', async ({ page }) => {
    await mount(page, 'report');
    let calls = 0;
    await page.route('**/api/self-report', route => { calls++; return route.fulfill({ status: 500 }); });
    await expect(page.getByRole('button', { name: 'Empezar las 30 preguntas' })).toBeDisabled();
    await page.getByRole('button', { name: 'Ahora no' }).click();
    await expect(page.locator('#outcome')).toHaveText('"continued"');
    expect(calls).toBe(0);
  });

  async function completeReport(page: Page) {
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Empezar las 30 preguntas' }).click();
    await expect(page.getByRole('button', { name: 'Siguientes 6' })).toBeDisabled();
    for (let block = 0; block < 5; block++) {
      for (let item = 0; item < 6; item++) await page.locator('fieldset').nth(item).getByRole('radio', { name: 'Neutral, sin opinión' }).check();
      if (block < 4) await page.getByRole('button', { name: 'Siguientes 6' }).click();
    }
  }

  for (const [error, status, message] of [
    ['unavailable', 503, 'No pudimos guardar'],
    ['session_expired', 401, 'Tu sesión venció'],
    ['profile_changed', 409, 'Tu perfil cambió'],
  ] as const) {
    test(`questionnaire ${error}: keeps 30 answers and allows a successful retry`, async ({ page }) => {
      test.setTimeout(90_000);
      await mount(page, 'report');
      const submissions: unknown[] = [];
      await page.route('**/api/self-report', async route => {
        const body = route.request().postDataJSON(); submissions.push(body);
        await route.fulfill(submissions.length === 1 ? { status, json: { ok: false, error } }
          : { json: { ok: true, data: { selfReport: createSelfReport(body.answers, new Date().toISOString()) } } });
      });
      await completeReport(page);
      await page.getByRole('button', { name: 'Volver', exact: true }).click();
      await expect(page.getByRole('radio', { checked: true })).toHaveCount(6);
      await page.getByRole('button', { name: 'Siguientes 6' }).click();
      await page.getByRole('button', { name: 'Guardar y ver mi resultado' }).click();
      await expect(page.getByRole('alert')).toContainText(message);
      await expect(page.getByRole('radio', { checked: true })).toHaveCount(6);
      await page.getByRole('button', { name: 'Guardar y ver mi resultado' }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Tus respuestas quedaron guardadas.' })).toBeVisible();
      expect(submissions).toHaveLength(2); expect(submissions[1]).toEqual(submissions[0]);
      await expect(page.getByLabel(/: 3.00 sobre 5/)).toHaveCount(5);
      if (error === 'unavailable') {
        expect((await new AxeBuilder({ page }).include('#fixture-root').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
        await page.screenshot({ path: `artifacts/audits/e2e-2026-09-07/${test.info().project.name}-recovered-report.png`, fullPage: true });
      }
    });
  }

  const frame = (body: Record<string, unknown>) => `data: ${JSON.stringify(body)}\n\n`;
  for (const [name, body] of [
    ['server error', frame({ type: 'text', chunk: 'Texto incompleto.' }) + frame({ type: 'error' })],
    ['truncated stream', frame({ type: 'text', chunk: 'Texto incompleto.' })],
    ['malformed stream', 'data: {broken}\n\n'],
    ['empty stream', frame({ type: 'done' })],
  ]) {
    test(`chat ${name}: discards incomplete answer and recovers`, async ({ page }) => {
      await mount(page, 'chat');
      let calls = 0;
      await page.route('**/api/chat', route => route.fulfill({ contentType: 'text/event-stream', body: ++calls === 1 ? body : frame({ type: 'start', conversationId: 'synthetic' }) + frame({ type: 'text', chunk: 'Respuesta de prueba completa.' }) + frame({ type: 'done' }) }));
      const input = page.getByRole('textbox', { name: 'Tu mensaje' });
      await input.fill(reflection); await page.getByRole('button', { name: 'Enviar mensaje' }).click();
      await expect(page.getByRole('alert')).toContainText('Se cortó la conexión');
      await expect(page.getByText('Texto incompleto.', { exact: true })).toHaveCount(0);
      await expect(input).toBeEnabled();
      await input.fill('Otra pregunta de prueba.'); await page.getByRole('button', { name: 'Enviar mensaje' }).click();
      await expect(page.getByText('Respuesta de prueba completa.', { exact: true })).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCount(0);
      expect(calls).toBe(2);
    });
  }

  for (const [error, status, message] of [['rate_limited', 429, 'Alcanzaste tu cupo diario'], ['session_expired', 401, 'Tu sesión en esta conversación expiró']] as const) {
    test(`chat explains ${error}`, async ({ page }) => {
      await mount(page, 'chat');
      await page.route('**/api/chat', route => route.fulfill({ status, json: { error } }));
      await page.getByRole('textbox', { name: 'Tu mensaje' }).fill(reflection);
      await page.getByRole('button', { name: 'Enviar mensaje' }).click();
      await expect(page.getByRole('alert')).toContainText(message);
      await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toBeEnabled();
    });
  }

  test('crisis response replaces the composer with support resources', async ({ page }) => {
    await mount(page, 'chat');
    await page.route('**/api/chat', route => route.fulfill({ status: 451, json: { error: 'crisis', severity: 'high', resources: [{ type: 'phone', label: 'Recurso simulado, no llamar', value: '000' }] } }));
    await page.getByRole('textbox', { name: 'Tu mensaje' }).fill('Mensaje ficticio: el servidor de esta prueba simula un bloqueo de seguridad.');
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();
    await expect(page.getByRole('heading', { name: 'Lo que estás escribiendo me preocupa' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Tu mensaje' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Recurso simulado/ })).toHaveAttribute('href', 'tel:000');
  });

  test('letter keeps its text after an outage and can be skipped', async ({ page }) => {
    await mount(page, 'letter');
    await page.route('**/api/carta', route => route.abort('failed'));
    await page.getByRole('textbox').fill(reflection);
    await page.getByRole('button', { name: /Guardar/ }).click();
    await expect(page.getByRole('alert')).toContainText('Tu texto sigue acá');
    await expect(page.getByRole('textbox')).toHaveValue(reflection);
    await page.getByRole('button', { name: 'Saltear' }).click();
    await expect(page.locator('#outcome')).toHaveText('/dashboard');
  });
});
