import { test, expect, type Page } from '@playwright/test';

// End-to-end for the new ChatGPT seed flow:
// register → consent → mode-selector → pick "Traelo desde ChatGPT"
// → copy step → paste canned response → seed API parses it
// → conductor runs refinement turns → analyze → dashboard (new layout)
// → chat (with profile context + quick prompts)
//
// Uses a canned "ChatGPT response" so we don't depend on a real ChatGPT
// session. The response mimics what a user would actually paste: prose
// + structured JSON block + evidence quotes.
// Opt in with E2E_REAL_FLOW=true because this requires Supabase sign-up to
// create a session immediately, a running ML API, and live Anthropic calls.

const RUN_REAL_FLOW = process.env.E2E_REAL_FLOW === 'true';

const SHOTS = '.gstack/qa-reports/screenshots';

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SHOTS}/new-${name}.png`, fullPage: true });
}

const CANNED_CHATGPT_RESPONSE = `## Retrato

Sos alguien que vive más tiempo adentro de tu cabeza que afuera. Tenés esa manera de observar el mundo desde un lugar medio retraído, no por timidez sino porque necesitás tiempo para procesar lo que ves antes de reaccionar. Cuando hablás, se nota que pensaste lo que vas a decir, y cuando escuchás, realmente escuchás.

Hay una lógica interna muy tuya que no siempre coincide con la del resto. Para vos, algo tiene sentido cuando cierra en todas sus capas, no cuando simplemente funciona. Eso te hace un analista potente pero también te atrasa a veces: podés quedarte semanas dando vueltas sobre una decisión que otros resolverían en cinco minutos, buscando que encaje con tus principios.

Con la gente cercana sos cálido y atento, pero los grupos grandes te cansan rápido. Después de una noche social necesitás aislarte, leer algo, caminar solo, para recuperar energía. No es que no te guste la gente, es que te llega con mucho volumen y necesitás bajarle los decibeles.

Te mueve entender. Entender cómo funcionan los sistemas, cómo pensás vos mismo, cómo pensó alguien que ya no está. Eso te conecta con la figura del Sabio: alguien que busca verdad más que aplausos, comprensión más que impacto inmediato. Es tu brújula más fiel.

Lo que te pesa es la exigencia que te imponés a vos mismo. Cuando una idea tuya no llega al estándar interno que tenés, te frustrás y eso se puede convertir en ansiedad silenciosa. Estás aprendiendo a soltar un poco, a aceptar que un 80% bien hecho a veces es mejor que un 100% que nunca llega.

\`\`\`json
{
  "bigFive": {
    "openness": { "value": 78, "confidence": 70 },
    "conscientiousness": { "value": 62, "confidence": 55 },
    "extraversion": { "value": 32, "confidence": 75 },
    "agreeableness": { "value": 65, "confidence": 60 },
    "neuroticism": { "value": 52, "confidence": 65 }
  },
  "jungFunctions": {
    "Se": { "value": 30, "confidence": 50 },
    "Si": { "value": 55, "confidence": 45 },
    "Ne": { "value": 60, "confidence": 55 },
    "Ni": { "value": 78, "confidence": 70 },
    "Te": { "value": 48, "confidence": 45 },
    "Ti": { "value": 72, "confidence": 65 },
    "Fe": { "value": 55, "confidence": 50 },
    "Fi": { "value": 62, "confidence": 55 }
  },
  "archetypeCandidates": [
    { "key": "sage", "confidence": 72, "rationale": "Busca verdad y comprensión antes que acción o aplausos" },
    { "key": "creator", "confidence": 48, "rationale": "Necesita dar forma a lo que piensa, no sólo entenderlo" },
    { "key": "explorer", "confidence": 35, "rationale": "Curiosidad intelectual sostenida en el tiempo" }
  ],
  "evidence": [
    { "text": "Necesita procesar antes de hablar, no reacciona en caliente", "signal": "Ni alta, Se baja" },
    { "text": "Algo tiene sentido cuando cierra en todas sus capas no sólo cuando funciona", "signal": "Ti dominante, Te secundario" },
    { "text": "Los grupos grandes le cansan y necesita aislarse para recuperar energía", "signal": "Extraversión baja" },
    { "text": "Le mueve entender cómo funcionan los sistemas y cómo piensa él mismo", "signal": "Apertura alta + Sage" },
    { "text": "Se impone un estándar interno altísimo que le genera ansiedad silenciosa", "signal": "Neuroticism medio-alto + Ti" }
  ]
}
\`\`\``;

async function answerRefinementTurn(page: Page): Promise<void> {
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
    await textarea.fill(
      'Suelo darme cuenta que una decisión está bien cuando la veo venir en mi cabeza varios pasos antes de que el resto lo note. Me cuesta cuando alguien me pide que reaccione rápido sin haber podido procesar.',
    );
  } else if (await slider.isVisible()) {
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
  } else if ((await optionButtons.count()) >= 2) {
    await optionButtons.first().click();
  } else {
    const ranking = page
      .locator('button')
      .filter({ hasNotText: /Continuar|reiniciar/i });
    const count = Math.min(await ranking.count(), 4);
    for (let i = 0; i < count; i++) {
      await ranking.first().click();
    }
  }

  await expect(continueLoc).toBeEnabled({ timeout: 10_000 });
  await continueLoc.click();
}

test.describe('New dashboard + chat via ChatGPT seed flow', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium' || !RUN_REAL_FLOW,
    'Opt-in chromium-only test: set E2E_REAL_FLOW=true with live Supabase, ML API, and Anthropic',
  );

  test('seed flow lands on new dashboard + contextual chat', async ({
    page,
  }) => {
    test.setTimeout(480_000);

    const stamp = Date.now();
    const email = `seed-${stamp}@test.local`;

    // Register + consent
    await page.goto('/register');
    await page.getByLabel('Tu nombre').fill('Seed Demo');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill('UmbraSeed-1234!');
    await page.getByRole('button', { name: /Crear cuenta/i }).click();
    await page.waitForURL('**/consent', { timeout: 30_000 });
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole('button', { name: /^Continuar$/i }).click();

    // Onboarding: mode selector
    await page.waitForURL('**/onboarding', { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: /Por dónde te gusta entrar/i }),
    ).toBeVisible({ timeout: 15_000 });
    await shot(page, '01-mode-selector');

    // Pick "Traelo desde ChatGPT" (Opción B)
    await page.getByRole('button', { name: /Opción B/i }).click();

    // Seed copy step
    await expect(
      page.getByRole('heading', { name: /Copiá este prompt/i }),
    ).toBeVisible({ timeout: 15_000 });
    await shot(page, '02-seed-copy');
    await page.getByRole('button', { name: /Ya lo pegué/i }).click();

    // Seed paste step — fill with canned response
    await expect(
      page.getByRole('heading', { name: /Pegá la respuesta/i }),
    ).toBeVisible({ timeout: 15_000 });
    await page.locator('textarea').first().fill(CANNED_CHATGPT_RESPONSE);
    await shot(page, '03-seed-paste-filled');
    await page.getByRole('button', { name: /Continuar con verificación/i }).click();

    // Seeding reveal → DynamicFlow with seeded session
    await expect(page.getByRole('heading', { name: /^Conversemos$/i }))
      .toBeVisible({ timeout: 120_000 });
    await shot(page, '04-seed-refinement-start');

    // Run up to 5 refinement turns (seeded sessions cap at 3)
    for (let i = 0; i < 5; i++) {
      await answerRefinementTurn(page);
      if (
        await page
          .getByText(/Estamos uniendo todo lo que contaste/i)
          .isVisible()
          .catch(() => false)
      ) {
        break;
      }
    }
    await shot(page, '05-seed-synthesis');

    // Carta form → skip
    await expect(
      page.getByRole('heading', { name: /Escribile a tu vos de 6 meses/i }),
    ).toBeVisible({ timeout: 120_000 });
    await page.getByRole('button', { name: /Saltear/i }).click();

    // Dashboard NEW layout
    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    await expect(
      page.getByRole('heading', { name: /Tu perfil interior/i }),
    ).toBeVisible({ timeout: 15_000 });
    // Wait for narrative to land
    await page.waitForTimeout(15_000);
    await shot(page, '06-dashboard-new');

    // Archetype map — click a different archetype to open the compare drawer
    await page.getByRole('button', { name: /El Héroe/i }).click();
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: /El Héroe/i }),
    ).toBeVisible({ timeout: 5_000 });
    await shot(page, '06b-archetype-compare-drawer');
    // Close the drawer before leaving
    await page.getByRole('button', { name: /Cerrar comparación/i }).click();

    // Chat NEW layout (with context pill + quick prompts)
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Umbra ya sabe de vos/i)).toBeVisible({ timeout: 10_000 });
    await shot(page, '07-chat-new');
  });
});
