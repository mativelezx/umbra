import { test, expect, type Page } from '@playwright/test';

// QA screenshot capture — drives the full authenticated flow (register →
// consent → dynamic onboarding → dashboard → plan → chat → export) and
// writes one annotated screenshot per page into .gstack/qa-reports/screenshots/.
// Not asserting functional correctness beyond "page rendered without crashing" —
// full-flow.spec.ts is the functional gate. This spec is pure visual evidence
// for /qa reports.

const SHOTS = '.gstack/qa-reports/screenshots';

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `${SHOTS}/${name}.png`,
    fullPage: true,
  });
}

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
  const continueLoc = page.getByRole('button', { name: /^Continuar$/i });
  const synthLoc = page.getByText(/Estamos uniendo todo lo que contaste/i);
  await continueLoc
    .or(synthLoc)
    .first()
    .waitFor({ state: 'visible', timeout: 120_000 });

  if (await synthLoc.isVisible().catch(() => false)) return;

  const textarea = page.locator('textarea').first();
  const slider = page.locator('input[type="range"]').first();
  const optionButtons = page.locator('[aria-pressed]');

  if (await textarea.isVisible()) {
    await textarea.fill(turnIdx === 0 ? INTRO_TEXT : FOLLOWUP_TEXT);
  } else if (await slider.isVisible()) {
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
  } else if ((await optionButtons.count()) >= 2) {
    await optionButtons.first().click();
  } else {
    const rankingButtons = page
      .locator('button')
      .filter({ hasNotText: /Continuar|reiniciar/i });
    const count = Math.min(await rankingButtons.count(), 4);
    for (let i = 0; i < count; i++) {
      await rankingButtons.first().click();
    }
  }

  await shot(page, `05-onboarding-turn-${String(turnIdx + 1).padStart(2, '0')}`);
  await expect(continueLoc).toBeEnabled({ timeout: 10_000 });
  await continueLoc.click();
}

test.describe('QA screenshots (visual evidence)', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Capture once, in chromium',
  );

  test('capture the full authenticated happy path', async ({ page }) => {
    test.setTimeout(420_000);

    // 1. Landing
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Conocé tu sombra/i }))
      .toBeVisible();
    await shot(page, '01-landing');

    // 2. Register
    await page.goto('/register');
    await shot(page, '02-register');

    const stamp = Date.now();
    const email = `qa-shots-${stamp}@test.local`;
    await page.getByLabel('Nombre completo').fill('QA Shots');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill('UmbraQA-1234!');
    await page.getByRole('button', { name: /Crear cuenta/i }).click();

    // 3. Consent
    await page.waitForURL('**/consent', { timeout: 30_000 });
    await shot(page, '03-consent');
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole('button', { name: /^Continuar$/i }).click();

    // 4. Mode selector → pick dynamic flow
    await page.waitForURL('**/onboarding', { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Por dónde te gusta entrar/i }))
      .toBeVisible({ timeout: 15_000 });
    await shot(page, '03b-mode-selector');
    await page
      .getByRole('button', { name: /Opción A/i })
      .click();

    // 5. Dynamic flow — screenshot each turn
    await expect(page.getByRole('heading', { name: /^Conversemos$/i }))
      .toBeVisible({ timeout: 15_000 });
    await shot(page, '04-onboarding-start');

    const MAX_TURNS = 10;
    for (let i = 0; i < MAX_TURNS; i++) {
      await answerCurrentTurn(page, i);
      if (
        await page
          .getByText(/Estamos uniendo todo lo que contaste/i)
          .isVisible()
          .catch(() => false)
      ) {
        await shot(page, '06-onboarding-synthesis');
        break;
      }
    }

    // 5. Carta form (skip)
    await expect(
      page.getByRole('heading', { name: /Escribile a tu vos de 6 meses/i }),
    ).toBeVisible({ timeout: 120_000 });
    await shot(page, '07-carta-form');
    await page.getByRole('button', { name: /Saltear/i }).click();

    // 6. Dashboard (narrative streams)
    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    await expect(
      page.getByRole('heading', { name: /Tu perfil interior/i }),
    ).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(10_000); // let narrative start streaming
    await shot(page, '08-dashboard');

    // 7. Plan
    await page.goto('/plan');
    await expect(
      page.getByRole('heading', { name: /Caminos para explorar/i }),
    ).toBeVisible({ timeout: 15_000 });
    await shot(page, '09-plan-empty');
    await page.getByRole('button', { name: /Generar mi plan/i }).click();
    await expect(page.locator('article')).toHaveCount(3, { timeout: 120_000 });
    await shot(page, '10-plan-generated');

    // 8. Chat
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    await shot(page, '11-chat');

    // 9. Export
    await page.goto('/export');
    await page.waitForLoadState('networkidle');
    await shot(page, '12-export');

    // 10. Settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await shot(page, '13-settings');

    // 11. Privacy + terms
    await page.goto('/privacy');
    await shot(page, '14-privacy');

    await page.goto('/terms');
    await shot(page, '15-terms');
  });
});
