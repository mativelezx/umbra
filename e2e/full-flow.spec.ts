import { test, expect } from '@playwright/test';

// End-to-end happy path: register → consent → onboarding (freetext) → analyze
// (real Claude) → CartaForm skip → dashboard → narrative streams in.
//
// This spec hits real Supabase local + real Anthropic API. Run with:
//   npx playwright test e2e/full-flow.spec.ts --project=chromium
//
// Skip the duplicate mobile project — one happy path is enough to validate
// that every backend integration is wired up.

test.describe('Umbra full-flow happy path', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Run only on chromium to avoid double-charging Claude tokens',
  );

  test('user registers, consents, analyzes, lands on dashboard, narrative streams', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const stamp = Date.now();
    const email = `umbra-e2e-${stamp}@test.local`;
    const password = 'UmbraE2E-Test-1234!';
    const fullName = 'Umbra E2E';

    const introText = [
      'Siento que soy alguien que pasa mucho tiempo adentro de su cabeza.',
      'Me gusta pensar las cosas despacio, analizar patrones, encontrar conexiones entre ideas que a primera vista no parecen tener nada que ver.',
      'A veces eso me trae problemas porque postergo decisiones simples buscando una teoría perfecta, y otras veces me da claridad donde nadie más la ve.',
      'Con la gente cercana soy cálido y presente, pero en grupos grandes me canso rápido y necesito volver a mi espacio para recuperar energía.',
      'Disfruto leer, escribir, caminar solo, y las conversaciones largas de una sola persona donde puedo ir al fondo de un tema.',
      'Me motiva aprender cosas nuevas y entender cómo funcionan los sistemas, tanto los técnicos como los humanos.',
      'Soy bastante exigente conmigo mismo y a veces eso se convierte en ansiedad cuando las cosas no salen como las planeé.',
      'Intento construir rutinas pero también necesito flexibilidad para seguir las intuiciones que aparecen de golpe.',
      'Valoro la honestidad por encima de la amabilidad superficial, aunque estoy aprendiendo a equilibrar las dos.',
      'Me cuesta pedir ayuda porque prefiero resolver las cosas yo mismo, y eso es algo que quiero cambiar.',
      'Los últimos meses estuve trabajando en un proyecto que me importa mucho y noté cómo la disciplina me ordena cuando el mundo interno se vuelve ruidoso.',
      'Me gustan los silencios largos, los paseos sin destino, y las noches en las que puedo leer hasta tarde sin culpa.',
      'Cuando alguien confía en mí siento que tengo una responsabilidad casi sagrada de estar a la altura, y eso me empuja a escuchar con atención.',
      'Creo que el sentido se construye haciendo algo con cuidado todos los días, no esperando que llegue de golpe.',
    ].join(' ');

    // 1. Register
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Empezá tu viaje/i })).toBeVisible();
    await page.getByLabel('Nombre completo').fill(fullName);
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

    // 3. Onboarding (freetext path)
    await page.waitForURL('**/onboarding', { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: /Empezá como te sientas cómodo/i }),
    ).toBeVisible();

    // Pick freetext mode: the button's accessible name is the h3 "Escribí como quieras"
    await page
      .getByRole('button', { name: /Escribí como quieras/i })
      .click();

    // Fill the textarea with 200+ words
    const textarea = page.locator('textarea').first();
    await textarea.waitFor({ state: 'visible', timeout: 10_000 });
    await textarea.fill(introText);

    // Submit → real Claude call
    await page.getByRole('button', { name: /Mostrame lo que ves/i }).click();

    // 4. CartaForm appears after analyze succeeds (stage === 'carta')
    await expect(
      page.getByRole('heading', { name: /Escribile a tu vos de 6 meses/i }),
    ).toBeVisible({ timeout: 120_000 });

    // Skip the future letter
    await page.getByRole('button', { name: /Saltear/i }).click();

    // 5. Dashboard renders with real profile data
    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /Tu perfil interior/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Big Five/i)).toBeVisible();
    await expect(page.getByText(/Funciones cognitivas/i)).toBeVisible();

    // 6. Narrative streams in from /api/narrative (second real Claude call)
    // Wait for the streaming article to render at least some text.
    await expect(page.locator('article').first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('article').first()).not.toBeEmpty({ timeout: 90_000 });

    // Give the narrative SSE stream time to fully land + persist to narratives table
    await page.waitForTimeout(8_000);

    // 7. Plan page → generate plan (third real Claude call)
    await page.goto('/plan');
    await expect(page.getByRole('heading', { name: /Caminos para explorar/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /Generar mi plan/i }).click();
    // Plan generation is non-streaming; wait for 3 areas to render
    await expect(page.locator('article')).toHaveCount(3, { timeout: 90_000 });
  });
});
