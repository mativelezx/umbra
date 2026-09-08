import { test, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// End-to-end happy path for the dynamic onboarding refactor:
// register → consent → /onboarding (conductor drives 6-8 turns) → synthesis
// → CartaForm skip → dashboard → narrative streams in → /plan generates.
//
// Real integration only: creates a synthetic account and consumes paid AI.
// Requires an explicitly approved test environment with immediate sign-up
// sessions, running ML, and configured Anthropic. No Auth/response mocks.
// Does not delete the test account automatically; cleanup needs separate approval.
//
// Chromium only: one pass of the full loop is enough to validate every
// backend integration is wired up, and we don't want to double-charge Claude.
// Run only after approval with all three flags, plus a loopback PLAYWRIGHT_BASE_URL.
// E2E_REAL_FLOW=true E2E_ALLOW_ACCOUNT_CREATION=true E2E_ALLOW_PAID_AI=true
// pnpm exec playwright test e2e/full-flow.spec.ts --project=chromium --retries=0

const RUN_REAL_FLOW = process.env.E2E_REAL_FLOW === 'true'
  && process.env.E2E_ALLOW_ACCOUNT_CREATION === 'true'
  && process.env.E2E_ALLOW_PAID_AI === 'true';
// Resume only a known synthetic QA account after an interrupted run. This never
// accepts an arbitrary real person's email and does not bypass authentication.
const REUSE_SYNTHETIC_EMAIL = process.env.E2E_REUSE_SYNTHETIC_EMAIL;
const REMOTE_FLOW = process.env.E2E_ALLOW_REMOTE_FLOW === 'true';

const INTRO_TEXT = [
  'Siento que soy alguien que pasa mucho tiempo adentro de su cabeza.',
  'Me gusta pensar las cosas despacio, analizar patrones y encontrar conexiones entre ideas que a primera vista no parecen tener nada que ver.',
  'A veces eso me trae problemas porque postergo decisiones simples buscando una teoría perfecta, y otras veces me da claridad donde nadie más la ve.',
  'Con la gente cercana soy cálido y presente, pero en grupos grandes me canso rápido y necesito volver a mi espacio para recuperar energía.',
  'Disfruto leer, escribir y caminar solo, y las conversaciones largas de una sola persona donde puedo ir al fondo de un tema.',
  'Soy exigente conmigo mismo y a veces eso se convierte en ansiedad cuando las cosas no salen como las planeé, pero estoy aprendiendo a soltar.',
].join(' ');

const FOLLOWUP_TEXT =
  'Cuando tengo que decidir algo importante necesito tiempo a solas para ordenar las ideas. Me gusta entender el por qué antes del qué, y prefiero una conversación profunda con una persona que diez charlas superficiales con un grupo.';

async function answerCurrentTurn(page: Page, turnIdx: number): Promise<boolean> {
  // Wait for either a QuestionCard (continue button) or the SynthesisReveal.
  const continueLoc = page.getByRole('button', { name: /^Continuar$/i });
  const synthLoc = page.getByText(/Estamos uniendo todo lo que contaste/i);
  await continueLoc
    .or(synthLoc)
    .first()
    .waitFor({ state: 'visible', timeout: 120_000 });

  if (await synthLoc.isVisible().catch(() => false)) {
    return true; // conductor marked done before this turn
  }

  // Detect card type by structural markers.
  const textarea = page.locator('textarea').first();
  const slider = page.locator('input[type="range"]').first();
  const optionButtons = page.locator('[aria-pressed]');

  if (await textarea.isVisible()) {
    // open_text — on turn 0 use the intro, otherwise a shorter follow-up.
    await textarea.fill(turnIdx === 0 ? INTRO_TEXT : FOLLOWUP_TEXT);
  } else if (await slider.isVisible()) {
    // polarity — nudge to a clear side so "touched" flips on.
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
  } else if ((await optionButtons.count()) >= 2) {
    // multi_choice / scenario / metaphor / ranking — click the first option.
    // For ranking (4 items, no aria-pressed) fall through to the plain-button branch.
    await optionButtons.first().click();
  } else {
    // Ranking has plain buttons inside a grid; click them in order.
    const rankingButtons = page.locator('.onboarding-card-enter .grid button');
    const count = await rankingButtons.count();
    expect(count, 'unrecognized question card; no ranking options found').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      // After each click, the clicked button disappears from "remaining".
      await rankingButtons.first().click();
    }
  }

  const continueBtn = page.getByRole('button', { name: /^Continuar$/i });
  await expect(continueBtn).toBeEnabled({ timeout: 10_000 });
  const nextResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/onboarding/next', { timeout: 120_000 });
  await continueBtn.click();
  const response = await nextResponse;
  expect(response.ok(), 'real onboarding request failed').toBe(true);
  const payload = await response.json();
  expect(payload.ok).toBe(true);
  // A later question may use the documented safe fallback when the provider
  // returns an invalid shape. Record it; final analysis/narrative/plan must still
  // succeed against the real providers. The first question must prove availability.
  if (payload.data.turn.question.id.startsWith('fb-')) {
    test.info().annotations.push({ type: 'fallback-question', description: payload.data.turn.question.id });
  }
  return payload.data.done === true;
}

test.describe('Umbra full-flow happy path (dynamic onboarding)', () => {
  test.describe.configure({ retries: 0 });
  test.skip(
    ({ browserName }) => browserName !== 'chromium' || !RUN_REAL_FLOW,
    'Requires explicit real-flow, account-creation and paid-AI opt-ins; never treat demo fixtures as this integration test',
  );

  test(`${REMOTE_FLOW ? 'remote synthetic login → consent' : REUSE_SYNTHETIC_EMAIL ? 'synthetic login' : 'register → consent'} → dynamic onboarding → dashboard → narrative → plan`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(480_000);
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000');
    if (REMOTE_FLOW) {
      expect(base.origin).toBe('https://umbra-sigma.vercel.app');
      expect(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname).toBe('googyntbflaqqriwhjxi.supabase.co');
      expect(process.env.E2E_APPROVED_BUDGET_USD).toBe('1');
      expect(Number(process.env.E2E_PRIOR_SPEND_CENTS)).toBeGreaterThanOrEqual(0);
      expect(Number(process.env.E2E_PRIOR_SPEND_CENTS)).toBeLessThan(60);
      expect(REUSE_SYNTHETIC_EMAIL).toBeUndefined();
    } else {
      expect(['localhost', '127.0.0.1', '[::1]']).toContain(base.hostname);
    }
    expect(process.env.NEXT_PUBLIC_DEMO_MODE).not.toBe('true');
    // Fail before account creation if the running app bypasses real Auth.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login(?:\?|$)/);

    const stamp = Date.now();
    if (REUSE_SYNTHETIC_EMAIL) expect(REUSE_SYNTHETIC_EMAIL).toMatch(/^umbra-e2e-\d+@test\.local$/);
    const email = REUSE_SYNTHETIC_EMAIL ?? `umbra-e2e-${stamp}@test.local`;
    const password = 'UmbraE2E-Test-1234!';
    const fullName = 'Umbra E2E';
    await testInfo.attach('synthetic-account', { body: JSON.stringify({ email }), contentType: 'application/json' });

    if (REMOTE_FLOW) {
      // SMTP is an independent acceptance gate. This does NOT certify email signup.
      const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const created = await admin.auth.admin.createUser({ email, password, email_confirm: true,
        user_metadata: { full_name: fullName, qa_fixture: true } });
      expect(created.error).toBeNull();
      const id = created.data.user!.id;
      let paidRequests = 0;
      // Serial requests, no test retries, stop at 60 recorded cents, retaining
      // 40 cents for one in-flight call, rounding and the safety classifier.
      // This is a QA guard, not the application's pending global billing cap.
      await page.route('**/api/**', async route => {
        const path = new URL(route.request().url()).pathname;
        if (route.request().method() === 'POST' && ['/api/onboarding/next', '/api/analyze', '/api/narrative', '/api/plan', '/api/chat'].includes(path)) {
          const ledger = await admin.from('rate_limits').select('cost_usd_cents').eq('user_id', id);
          if (ledger.error || ++paidRequests > 16 || Number(process.env.E2E_PRIOR_SPEND_CENTS) + (ledger.data ?? []).reduce((sum, row) => sum + row.cost_usd_cents, 0) >= 60) {
            await route.abort('blockedbyclient');
            throw new Error('QA budget guard stopped further paid requests');
          }
        }
        await route.continue();
      });
      await page.goto('/login');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Contraseña').fill(password);
      await page.getByRole('button', { name: /^Entrar$/i }).click();
      await page.waitForURL('**/consent', { timeout: 60_000 });
      await page.locator('input[type="checkbox"]').first().check();
      await page.getByRole('button', { name: /De acuerdo, seguimos/i }).click();
      testInfo.annotations.push({ type: 'scope', description: 'Remote services; synthetic account confirmed by admin, consent in UI. Signup emails not tested.' });
    } else if (REUSE_SYNTHETIC_EMAIL) {
      await page.goto('/login');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Contraseña').fill(password);
      await page.getByRole('button', { name: /^Entrar$/i }).click();
      await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 60_000 });
      await page.goto('/onboarding');
    } else {
    // 1. Register
    await page.goto('/register');
    await expect(
      page.getByRole('heading', { name: /Crear tu cuenta/i }),
    ).toBeVisible();
    await page.getByLabel('Tu nombre').fill(fullName);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: /Crear cuenta/i }).click();

    // 2. Consent
    await page.waitForURL('**/consent', { timeout: 30_000 });
    await expect(
      page.getByRole('heading', { name: /Tus datos, tus reglas/i }),
    ).toBeVisible({ timeout: 10_000 });
    const acceptCheckbox = page.locator('input[type="checkbox"]').first();
    await acceptCheckbox.check();
    await page.getByRole('button', { name: /De acuerdo, seguimos/i }).click();
    }

    // 3. Dynamic onboarding — the conductor drives 6-8 turns.
    await page.waitForURL('**/onboarding', { timeout: 60_000 });
    await expect(
      page.getByRole('heading', { name: /¿Cómo querés empezar\?/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Ejemplo local\./)).toHaveCount(0);
    const initialQuestion = page.waitForResponse(response => new URL(response.url()).pathname === '/api/onboarding/next', { timeout: 120_000 });
    await page.getByRole('button', { name: /Responder preguntas/i }).click();
    const initialResponse = await initialQuestion;
    expect(initialResponse.ok(), 'real onboarding must run instead of a fixture').toBe(true);
    const initialPayload = await initialResponse.json();
    expect(initialPayload.data.turn.question.id, 'Conductor used a fallback; stop before making further paid requests').not.toMatch(/^fb-/);
    await expect(page.getByRole('button', { name: /^Continuar$/i })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('onboarding-real.png') });
    const analysisResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/analyze', { timeout: 360_000 });

    const MAX_TURNS = 10; // conductor caps at 8; leave slack for retries
    let synthReached = false;
    let answeredTurns = 0;
    for (let i = 0; i < MAX_TURNS; i++) {
      // Use the actual response, since the synthesis indicator may be brief.
      const finished = await answerCurrentTurn(page, i);
      answeredTurns++;
      if (finished) {
        synthReached = true;
        break;
      }
    }
    expect(synthReached, 'conductor never marked done within MAX_TURNS').toBe(true);

    const analyzed = await analysisResponse;
    expect(analyzed.request().postDataJSON().texts).toHaveLength(answeredTurns);
    const analysisPayload = await analyzed.json();
    expect(analyzed.ok(), `analysis API failed: ${analysisPayload.error ?? analyzed.status()}`).toBe(true);
    expect(analysisPayload.ok).toBe(true);
    await testInfo.attach('generated-profile', { body: JSON.stringify({ profileId: analysisPayload.data.profileId }), contentType: 'application/json' });

    // 4. Independent self-report is offered after ML, before the saved reading.
    await expect(page.getByRole('heading', { name: 'Tu voz también tiene una medida.' })).toBeVisible({ timeout: 120_000 });
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Empezar las 30 preguntas' }).click();
    for (let block=0; block<5; block++) {
      for (let item=0; item<6; item++) await page.locator('fieldset').nth(item).getByRole('radio', { name: 'Neutral, sin opinión' }).check();
      if (block < 4) await page.getByRole('button', { name: 'Siguientes 6' }).click();
    }
    const questionnaireResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/self-report');
    await page.getByRole('button', { name: 'Guardar y ver mi resultado' }).click();
    const savedQuestionnaire = await questionnaireResponse;
    expect(savedQuestionnaire.ok()).toBe(true);
    expect((await savedQuestionnaire.json()).data.selfReport.scores.openness).toBe(3);
    await expect(page.getByLabel(/: 3.00 sobre 5/)).toHaveCount(5);
    await page.screenshot({ path: testInfo.outputPath('self-report-real.png') });
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();

    // CartaForm follows the optional questionnaire.
    await expect(
      page.getByRole('heading', { name: /Escribile a tu vos de 6 meses/i }),
    ).toBeVisible({ timeout: 120_000 });
    const narrativeResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/narrative', { timeout: 120_000 });
    await page.getByRole('button', { name: /Saltear/i }).click();

    // 5. Dashboard renders with real profile data.
    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    await expect(
      page.getByRole('heading', { name: /Mi resultado/i }),
    ).toBeVisible({ timeout: 15_000 });

    // 6. Narrative streams in from /api/narrative.
    const readingResponse = await narrativeResponse;
    expect(readingResponse.ok()).toBe(true);
    const readingEvents = await readingResponse.text();
    expect(readingEvents).toContain('"type":"done"');
    expect(readingEvents).not.toContain('"type":"error"');
    await page.screenshot({ path: testInfo.outputPath('reading-real.png') });
    await page.getByRole('tab', { name: 'Datos del modelo' }).click();
    const dimensions = page.getByRole('list', { name: 'Dimensiones Big Five con su estado de confianza' });
    await expect(dimensions.getByRole('listitem')).toHaveCount(5);
    await expect(dimensions.getByText('Apertura a lo nuevo', { exact: true })).toBeVisible();
    await expect(dimensions.getByText('evidencia insuficiente — sin cifra', { exact: true })).toHaveCount(5);
    await expect(dimensions.getByRole('progressbar')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('model-real.png') });

    // 7. Plan page → generate activities (another paid AI operation).
    await page.goto('/plan');
    await expect(
      page.getByRole('heading', { name: /^Actividades$/i }),
    ).toBeVisible({ timeout: 15_000 });
    const planResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/plan', { timeout: 120_000 });
    await page.getByRole('button', { name: /Generar mi plan/i }).click();
    expect((await planResponse).ok()).toBe(true);
    await expect(page.getByRole('main').getByRole('region')).toHaveCount(3, { timeout: 120_000 });
    await expect(page.getByRole('button', { name: /^Abrir / }).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('plan-real.png') });
  });
});
