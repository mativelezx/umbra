import { test, expect, type Page } from '@playwright/test';

// End-to-end happy path for the dynamic onboarding refactor:
// register → consent → /onboarding (conductor drives 6-8 turns) → synthesis
// → CartaForm skip → dashboard → narrative streams in → /plan generates.
//
// This spec hits real Supabase local + real Anthropic API. Run with:
//   pnpm exec playwright test e2e/full-flow.spec.ts --project=chromium
//
// Chromium only: one pass of the full loop is enough to validate every
// backend integration is wired up, and we don't want to double-charge Claude.
// Opt in with E2E_REAL_FLOW=true because this requires Supabase sign-up to
// create a session immediately, a running ML API, and live Anthropic calls.

const RUN_REAL_FLOW = process.env.E2E_REAL_FLOW === 'true';

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

async function answerCurrentTurn(page: Page, turnIdx: number): Promise<void> {
  // Wait for either a QuestionCard (continue button) or the SynthesisReveal.
  const continueLoc = page.getByRole('button', { name: /^Continuar$/i });
  const synthLoc = page.getByText(/Estamos uniendo todo lo que contaste/i);
  await continueLoc
    .or(synthLoc)
    .first()
    .waitFor({ state: 'visible', timeout: 120_000 });

  if (await synthLoc.isVisible().catch(() => false)) {
    return; // conductor marked done before this turn
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
    const rankingButtons = page
      .locator('button')
      .filter({ hasNotText: /Continuar|reiniciar/i });
    const count = Math.min(await rankingButtons.count(), 4);
    for (let i = 0; i < count; i++) {
      // After each click, the clicked button disappears from "remaining".
      await rankingButtons.first().click();
    }
  }

  const continueBtn = page.getByRole('button', { name: /^Continuar$/i });
  await expect(continueBtn).toBeEnabled({ timeout: 10_000 });
  await continueBtn.click();
}

test.describe('Umbra full-flow happy path (dynamic onboarding)', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium' || !RUN_REAL_FLOW,
    'Opt-in chromium-only test: set E2E_REAL_FLOW=true with live Supabase, ML API, and Anthropic',
  );

  test('register → consent → dynamic onboarding → dashboard → narrative → plan', async ({
    page,
  }) => {
    test.setTimeout(360_000);

    const stamp = Date.now();
    const email = `umbra-e2e-${stamp}@test.local`;
    const password = 'UmbraE2E-Test-1234!';
    const fullName = 'Umbra E2E';

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
      page.getByRole('heading', { name: /Antes de empezar/i }),
    ).toBeVisible({ timeout: 10_000 });
    const acceptCheckbox = page.locator('input[type="checkbox"]').first();
    await acceptCheckbox.check();
    await page.getByRole('button', { name: /^Continuar$/i }).click();

    // 3. Dynamic onboarding — the conductor drives 6-8 turns.
    await page.waitForURL('**/onboarding', { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: /Conversemos/i }),
    ).toBeVisible({ timeout: 15_000 });

    const MAX_TURNS = 10; // conductor caps at 8; leave slack for retries
    let synthReached = false;
    for (let i = 0; i < MAX_TURNS; i++) {
      await answerCurrentTurn(page, i);
      // If synth reveal showed up, we're done.
      if (
        await page
          .getByText(/Estamos uniendo todo lo que contaste/i)
          .isVisible()
          .catch(() => false)
      ) {
        synthReached = true;
        break;
      }
    }
    expect(synthReached, 'conductor never marked done within MAX_TURNS').toBe(true);

    // 4. CartaForm appears after analyze succeeds.
    await expect(
      page.getByRole('heading', { name: /Escribile a tu vos de 6 meses/i }),
    ).toBeVisible({ timeout: 120_000 });
    await page.getByRole('button', { name: /Saltear/i }).click();

    // 5. Dashboard renders with real profile data.
    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    await expect(
      page.getByRole('heading', { name: /Tu perfil interior/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Big Five/i)).toBeVisible();
    await expect(page.getByText(/Funciones cognitivas/i)).toBeVisible();

    // 6. Narrative streams in from /api/narrative.
    await expect(page.locator('article').first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('article').first()).not.toBeEmpty({ timeout: 90_000 });
    await page.waitForTimeout(8_000);

    // 7. Plan page → generate plan (third real Claude call).
    await page.goto('/plan');
    await expect(
      page.getByRole('heading', { name: /Caminos para explorar/i }),
    ).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Generar mi plan/i }).click();
    await expect(page.locator('article')).toHaveCount(3, { timeout: 120_000 });
  });
});
