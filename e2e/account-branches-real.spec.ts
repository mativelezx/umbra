import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'node:crypto';
import { BFI2S_VERSION, scoreBfi2s } from '../lib/assessment/bfi2s';
import { CONSENT_TEXT_V2_ES_AR, CONSENT_VERSION_V2, CONSENT_LOCALE_V2 } from '../lib/consent/text-v2-es-AR';
import { emptyWorkingProfile } from '../lib/prompts/onboarding-conductor';
import { DEMO_JUNG_FUNCTIONS } from '../lib/demo/seed';
import { computeHash } from '../lib/security/peppers';

// Auth + API + PostgreSQL/RLS + ML are real and local. No paid AI.
// Profiles are explicitly seeded from real ML outputs over synthetic texts;
// this suite does NOT claim the seeds passed through /api/analyze.
const enabled = process.env.E2E_LOCAL_BRANCHES === 'true';
const password = 'Umbra-QA-Synthetic-1234!';
const dims = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
interface Actor { context: BrowserContext; page: Page; db: SupabaseClient; id: string; email: string; profileId: string; ml: Record<string, unknown> }

test.describe('Local account and data branches — no paid provider', () => {
  test.skip(!enabled, 'Requires explicit local synthetic-account opt-in');
  test.describe.configure({ mode: 'serial', retries: 0 });
  let alice: Actor;
  let bob: Actor;
  let bobSession: string;
  const actors: Actor[] = [];
  let providerCalls = 0;
  const consent = (researchOptIn: boolean) => ({ consentVersion: CONSENT_VERSION_V2, locale: CONSENT_LOCALE_V2,
    consentTextHash: createHash('sha256').update(CONSENT_TEXT_V2_ES_AR).digest('hex'), researchOptIn });

  test.beforeAll(async ({ browser }, info) => {
    test.setTimeout(120_000);
    const baseURL = process.env.PLAYWRIGHT_BASE_URL!;
    const dbURL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    expect(['localhost', '127.0.0.1']).toContain(new URL(baseURL).hostname);
    expect(['localhost', '127.0.0.1']).toContain(new URL(dbURL).hostname);
    expect(process.env.NEXT_PUBLIC_DEMO_MODE).not.toBe('true');
    for (const [index, name] of ['A', 'B'].entries()) {
      const context = await browser.newContext({ baseURL, reducedMotion: 'reduce' });
      await context.route(/\/api\/(onboarding\/(next|seed)|analyze|narrative|plan|chat)(?:\?|$)/, route => {
        providerCalls++;
        return route.fulfill({ status: 503, json: { ok: false, error: 'qa_paid_provider_blocked' } });
      });
      const page = await context.newPage();
      const email = `umbra-qa-${Date.now()}-${index}-${info.workerIndex}@test.local`;
      await page.goto('/register');
      await page.getByLabel('Tu nombre').fill(`Cuenta ficticia QA ${name}`);
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Contraseña').fill(password);
      await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
      await page.waitForURL('**/consent');
      const db = createClient(dbURL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
      const signed = await db.auth.signInWithPassword({ email, password });
      expect(signed.error).toBeNull();
      const actor: Actor = { context, page, db, id: signed.data.user!.id, email, profileId: '', ml: {} };
      actors.push(actor);
      await expect(page.getByRole('button', { name: 'De acuerdo, seguimos' })).toBeDisabled();
      const rejected = await page.request.post('/api/consent', { data: { ...consent(false), consentTextHash: '0'.repeat(64) } });
      expect(rejected.status()).toBe(400);
      const rows = await db.from('consent_records').select('id').eq('user_id', actor.id);
      expect(rows.error).toBeNull(); expect(rows.data).toEqual([]);
      const report = await page.request.post('/api/self-report', { data: { profileId: randomUUID(), instrument: BFI2S_VERSION, accepted: true, answers: Array(30).fill(3) } });
      expect(report.status()).toBe(403);
      await page.locator('input[type="checkbox"]').first().check();
      await page.getByRole('button', { name: 'De acuerdo, seguimos' }).click();
      await page.waitForURL('**/onboarding');
      await page.goto('/assessment');
      await expect(page).toHaveURL(/\/onboarding$/);
      const text = index === 0
        ? 'Texto ficticio QA: disfruto investigar ideas y organizar mis tareas. Antes de una entrega divido el trabajo en pasos y reviso los resultados.'
        : 'Texto ficticio QA: prefiero conversar con amigos y probar actividades nuevas. En el fin de semana improviso paseos y disfruto conocer gente.';
      const inference = await page.request.post('http://127.0.0.1:8000/infer', { data: { text } });
      expect(inference.ok()).toBe(true);
      const raw = await inference.json();
      expect(Object.keys(raw.big_five).sort()).toEqual([...dims].sort());
      expect(Object.values(raw.per_dimension_status)).toEqual(Array(5).fill('low_confidence'));
      actor.ml = { modelVersion: raw.model_version, perDimensionStatus: raw.per_dimension_status,
        rawBigFive: raw.big_five, inputSource: 'qa_synthetic_direct_inference' };
      const numeric = Object.fromEntries(dims.map(dim => [dim, Math.round(raw.big_five[dim]) as number]));
      const inserted = await db.from('psychological_profiles').insert({ user_id: actor.id, ...numeric,
        jung_functions: DEMO_JUNG_FUNCTIONS, archetype: 'sage', input_mode: 'dynamic', input_texts: [text],
        analysis_raw: { ml: actor.ml, qaFixture: true } }).select('id').single();
      expect(inserted.error).toBeNull(); actor.profileId = inserted.data!.id;
      const fresh = await db.from('psychological_profiles').select('*').eq('id', actor.profileId).single();
      for (const dim of dims) expect(fresh.data![dim]).toBe(numeric[dim]);
      expect(fresh.data!.analysis_raw.ml).toEqual(actor.ml);
      await info.attach(`qa-account-${name}`, { body: JSON.stringify({ id: actor.id, email, profileId: actor.profileId, source: 'synthetic', research: false }), contentType: 'application/json' });
    }
    [alice, bob] = actors;
    // This table correctly denies client INSERT. Seed only this freshly
    // registered QA identity via the local server role; do not weaken RLS.
    expect(bob.email).toMatch(/^umbra-qa-\d+-\d+-\d+@test\.local$/);
    const service = createClient(dbURL, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    const session = await service.from('onboarding_sessions').insert({ user_id: bob.id, status: 'in_progress', turns: [], working_profile: emptyWorkingProfile(), flags: { qaFixture: true } }).select('id').single();
    expect(session.error).toBeNull(); bobSession = session.data!.id;
  });

  test.afterAll(async () => { for (const actor of actors) await actor.context.close(); });

  test('A01 consent, research choice and fresh-account navigation are persisted', async () => {
    for (const actor of actors) {
      const result = await actor.page.request.get('/api/account/export');
      expect(result.ok()).toBe(true);
      const data = await result.json();
      expect(data.user.id).toBe(actor.id);
      expect(data.profile.research_opt_in).toBe(false);
      expect(data.consent_records).toHaveLength(1);
      expect(data.consent_records[0].consent_text_hash).toBe(consent(false).consentTextHash);
      expect(data).not.toHaveProperty('access_token');
      expect(data).not.toHaveProperty('refresh_token');
    }
  });

  test('A02 RLS denies reading, updating and inserting another account profile', async () => {
    const hidden = await alice.db.from('psychological_profiles').select('*').eq('id', bob.profileId);
    expect(hidden.error).toBeNull(); expect(hidden.data).toEqual([]);
    const changed = await alice.db.from('profiles').update({ full_name: 'forbidden QA mutation' }).eq('id', bob.id).select('id');
    expect(changed.error).toBeNull(); expect(changed.data).toEqual([]);
    const forbidden = await alice.db.from('psychological_profiles').insert({ user_id: bob.id, jung_functions: {}, input_mode: 'guided' });
    expect(forbidden.error).not.toBeNull();
    const other = await bob.db.from('profiles').select('full_name').eq('id', bob.id).single();
    expect(other.data!.full_name).toBe('Cuenta ficticia QA B');
  });

  test('A03 questionnaire rejects incomplete, forged, foreign-origin and foreign-profile inputs', async () => {
    const valid = { profileId: alice.profileId, instrument: BFI2S_VERSION, answers: Array(30).fill(3), accepted: true };
    for (const answers of [Array(29).fill(3), Array(31).fill(3), Array(30).fill(0), Array(30).fill(6), Array(30).fill(1.5), Array(30).fill('3')]) {
      expect((await alice.page.request.post('/api/self-report', { data: { ...valid, answers } })).status()).toBe(400);
    }
    expect((await alice.page.request.post('/api/self-report', { data: { ...valid, scores: { openness: 5 } } })).status()).toBe(400);
    expect((await alice.page.request.post('/api/self-report', { data: { ...valid, accepted: false } })).status()).toBe(400);
    expect((await alice.page.request.post('/api/self-report', { data: valid, headers: { origin: 'https://unrelated.example' } })).status()).toBe(403);
    expect((await alice.page.request.post('/api/self-report', { data: { ...valid, profileId: bob.profileId } })).status()).toBe(404);
    const unchanged = await alice.db.from('psychological_profiles').select('analysis_raw').eq('id', alice.profileId).single();
    expect(unchanged.data!.analysis_raw.selfReport).toBeUndefined();
  });

  test('A04 real questionnaire scoring survives reload and leaves ML unchanged', async () => {
    const answers = Array.from({ length: 30 }, (_, index) => index % 5 + 1);
    const saved = await alice.page.request.post('/api/self-report', { data: { profileId: alice.profileId, instrument: BFI2S_VERSION, answers, accepted: true } });
    expect(saved.ok()).toBe(true);
    const response = await saved.json();
    expect(response.data.selfReport.scores).toEqual(scoreBfi2s(answers));
    const db = await alice.db.from('psychological_profiles').select('analysis_raw').eq('id', alice.profileId).single();
    expect(db.data!.analysis_raw.ml).toEqual(alice.ml);
    expect(db.data!.analysis_raw.selfReport.answers).toEqual(answers);
    expect(db.data!.analysis_raw.selfReport.researchUse).toBe(false);
    const exported = await (await alice.page.request.get('/api/account/export')).json();
    expect(exported.psychological_profiles[0].analysis_raw.selfReport.answers).toEqual(answers);
    await alice.page.goto('/assessment');
    await expect(alice.page.getByText('Esto reemplazará tu autoinforme anterior.', { exact: false })).toBeVisible();
    await alice.page.reload();
    await expect(alice.page.getByText('Esto reemplazará tu autoinforme anterior.', { exact: false })).toBeVisible();
  });

  test('A05 profile update and research opt-out persist without changing the other account', async () => {
    expect((await alice.page.request.patch('/api/account/profile', { data: { full_name: '   ' } })).status()).toBe(400);
    expect((await alice.page.request.patch('/api/account/profile', { data: { full_name: 'QA Ángela – caso ficticio' } })).ok()).toBe(true);
    for (const optIn of [true, false]) {
      const changed = await alice.page.request.post('/api/account/research-opt-out', { data: { research_opt_in: optIn, purge_existing: !optIn } });
      expect(changed.ok()).toBe(true);
      const data = await (await alice.page.request.get('/api/account/export')).json();
      expect(data.profile.research_opt_in).toBe(optIn);
      expect(data.profile.full_name).toBe('QA Ángela – caso ficticio');
    }
    const other = await bob.db.from('profiles').select('research_opt_in,full_name').eq('id', bob.id).single();
    expect(other.data!.research_opt_in).toBe(false);
    expect(other.data!.full_name).toBe('Cuenta ficticia QA B');
  });

  test('A06 a letter cannot reference another account profile', async () => {
    const letter = 'Carta sintética para comprobar la separación entre cuentas de prueba.';
    const foreign = await alice.page.request.post('/api/carta', { data: { profileId: bob.profileId, content: letter } });
    expect(foreign.status()).toBe(404);
    const rows = await alice.db.from('future_letters').select('id').eq('profile_snapshot_id', bob.profileId);
    expect(rows.data).toEqual([]);
    expect((await alice.page.request.post('/api/carta', { data: { profileId: alice.profileId, content: 'corta' } })).status()).toBe(400);
    const own = await alice.page.request.post('/api/carta', { data: { profileId: alice.profileId, content: letter } });
    expect(own.ok()).toBe(true);
    const data = await own.json();
    expect(new Date(data.data.unlockAt).getTime()).toBeGreaterThan(Date.now() + 179 * 86400000);
  });

  test('A07 undo of a foreign or missing session neither leaks data nor creates sessions', async () => {
    const before = await alice.db.from('onboarding_sessions').select('id').eq('user_id', alice.id);
    for (const sessionId of [bobSession, randomUUID()]) {
      const res = await alice.page.request.post('/api/onboarding/undo', { data: { sessionId } });
      expect(res.status()).toBe(404);
    }
    const after = await alice.db.from('onboarding_sessions').select('id').eq('user_id', alice.id);
    expect(after.data).toEqual(before.data);
    const other = await bob.db.from('onboarding_sessions').select('turns').eq('id', bobSession).single();
    expect(other.data!.turns).toEqual([]);
  });

  test('A08 unavailable email and invalid delete token leave the account intact', async () => {
    const requested = await alice.page.request.post('/api/account/delete/request', { data: { purgeResearch: false } });
    const sandbox = process.env.E2E_RESEND_SANDBOX === 'true';
    // The sandbox refuses synthetic recipients; this verifies a safe failure,
    // not successful delivery. Without configuration the route returns 503.
    expect(requested.status()).toBe(sandbox ? 502 : 503);
    expect((await requested.json()).error).toBe(sandbox ? 'email_send_failed' : 'email_not_configured');
    const absent = await alice.page.request.post('/api/account/delete/confirm', { data: { token: 'qa-does-not-exist-123456789' } });
    expect(absent.status()).toBe(404);
    expect((await alice.page.request.get('/api/account/export')).ok()).toBe(true);
    await alice.page.goto('/settings/delete');
    await expect(alice.page.getByRole('button', { name: 'Mandame el link de confirmación' })).toBeDisabled();
  });

  test('A09 logout removes authenticated access and leaves no cross-account browser draft', async () => {
    await alice.page.goto('/settings/profile');
    await alice.page.evaluate(() => localStorage.setItem('umbra-onboarding', JSON.stringify({ state: { ownerId: 'qa-only', sessionId: 'qa-private-draft' }, version: 0 })));
    await alice.page.getByRole('button', { name: /Cerrar sesión/i }).click();
    await alice.page.waitForURL(/\/login|\/$/);
    expect(await alice.page.evaluate(() => localStorage.getItem('umbra-onboarding') ?? '')).not.toContain('qa-private-draft');
    expect((await alice.page.request.get('/api/account/export')).status()).toBe(401);
    await alice.page.goto('/assessment');
    await expect(alice.page).toHaveURL(/\/login/);
    expect(providerCalls).toBe(0);
  });

  test('A10 expired, consumed and foreign deletion tokens do not delete either QA account', async () => {
    const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    for (const [kind, expected] of [['expired', 410], ['used', 409], ['foreign', 403]] as const) {
      const token = randomUUID();
      const inserted = await service.from('delete_confirmations').insert({ user_id: kind === 'foreign' ? alice.id : bob.id,
        token_hash: await computeHash('delete_token', token), expires_at: new Date(Date.now() + (kind === 'expired' ? -60000 : 300000)).toISOString(),
        used_at: kind === 'used' ? new Date().toISOString() : null });
      expect(inserted.error).toBeNull();
      const result = await bob.page.request.post('/api/account/delete/confirm', { data: { token, purgeResearch: false } });
      expect(result.status()).toBe(expected);
      for (const actor of actors) expect((await service.auth.admin.getUserById(actor.id)).error).toBeNull();
    }
  });

  test('A11 deletes only the freshly created QA account B and its dependent rows', async () => {
    // Exact scope: B was registered in this run, never a supplied/demo account.
    expect(bob.email).toMatch(/^umbra-qa-\d+-1-\d+@test\.local$/);
    expect(bob.id).not.toBe(alice.id);
    const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    const token = randomUUID();
    const inserted = await service.from('delete_confirmations').insert({ user_id: bob.id, token_hash: await computeHash('delete_token', token), expires_at: new Date(Date.now() + 300000).toISOString() });
    expect(inserted.error).toBeNull();
    const result = await bob.page.request.post('/api/account/delete/confirm', { data: { token, purgeResearch: true } });
    expect(result.ok()).toBe(true);
    expect((await service.auth.admin.getUserById(bob.id)).error).not.toBeNull();
    for (const table of ['psychological_profiles', 'consent_records', 'onboarding_sessions', 'delete_confirmations']) {
      const rows = await service.from(table).select('id').eq('user_id', bob.id);
      expect(rows.error).toBeNull(); expect(rows.data).toEqual([]);
    }
    expect((await bob.page.request.get('/api/account/export')).status()).toBe(401);
    expect((await service.auth.admin.getUserById(alice.id)).error).toBeNull();
    // Delivery of an actual email is deliberately NOT covered by this token fixture.
  });
});
