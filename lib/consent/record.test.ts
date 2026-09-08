// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ records: [] as unknown[], researchUpdates: [] as unknown[], researchOptIn: false, failAt: '' }));
vi.mock('@/lib/supabase/server', () => {
  const client = { auth: { getUser: async () => ({ data: { user: { id: 'fixture-user' } } }) },
    from: () => ({
      insert: async (record: unknown) => {
        if (fixture.failAt === 'insert') return { error: { message: 'write failed' } };
        fixture.records.push(record); return { error: null };
      },
      update: (value: { research_opt_in: boolean }) => ({ eq: async () => {
        if (fixture.failAt === 'update') return { error: { message: 'write failed' } };
        fixture.researchOptIn = value.research_opt_in;
        fixture.researchUpdates.push(value); return { error: null };
      } }),
    }),
    // PostgREST is mocked; the real SQL transaction is exercised by test-atomic-local.sh.
    rpc: async (name: string, args: Record<string, unknown>) => {
      if (name !== 'record_consent_atomic' || fixture.failAt) return { data: null, error: { message: 'transaction failed', code: fixture.failAt === 'missing_rpc' ? 'PGRST202' : 'XX000' } };
      fixture.records.push({ user_id: args.p_user_id, consent_version: args.p_consent_version, consent_text_hash: args.p_consent_text_hash, locale: args.p_locale });
      fixture.researchOptIn = args.p_research_opt_in as boolean;
      fixture.researchUpdates.push({ research_opt_in: args.p_research_opt_in });
      return { data: 'fixture-consent-id', error: null };
    },
  };
  return { createClient: async () => client, createServiceClient: () => client };
});
import { POST } from '@/app/api/consent/route';
import { CONSENT_VERSION_V2, CONSENT_TEXT_V2_ES_AR } from './text-v2-es-AR';
import { computeConsentTextHash } from './text-v1-es-AR';
beforeEach(() => { fixture.records = []; fixture.researchUpdates = []; fixture.researchOptIn = false; fixture.failAt = ''; });
it('records the canonical current text hash and version', async () => {
  const hash = await computeConsentTextHash(CONSENT_TEXT_V2_ES_AR);
  const response = await POST(new Request('http://localhost/api/consent', { method: 'POST', body: JSON.stringify({ consentVersion: CONSENT_VERSION_V2, consentTextHash: hash, locale: 'es-AR', researchOptIn: false }) }));
  expect(response.status).toBe(200);
  expect(fixture.records).toEqual([expect.objectContaining({ consent_version: CONSENT_VERSION_V2, consent_text_hash: hash, locale: 'es-AR' })]);
  expect(fixture.researchUpdates).toEqual([{ research_opt_in: false }]);
});
it.each(['update', 'insert'])('keeps the prior acceptance and preference intact when %s fails, then allows retry', async failAt => {
  const historical = { consent_version: 'historical-v1' };
  fixture.records = [historical];
  fixture.researchOptIn = true;
  fixture.failAt = failAt;
  const input = { consentVersion: CONSENT_VERSION_V2, consentTextHash: await computeConsentTextHash(CONSENT_TEXT_V2_ES_AR), locale: 'es-AR', researchOptIn: false };
  const submit = () => POST(new Request('http://localhost/api/consent', { method: 'POST', body: JSON.stringify(input) }));
  expect((await submit()).status).toBe(500);
  expect(fixture.records).toEqual([historical]);
  expect(fixture.researchOptIn).toBe(true);
  fixture.failAt = '';
  expect((await submit()).status).toBe(200);
  expect(fixture.records).toHaveLength(2);
  expect(fixture.records[0]).toEqual(historical);
  expect(fixture.researchOptIn).toBe(false);
});
it('does not activate research or create consent when the atomic operation is unavailable', async () => {
  fixture.failAt = 'missing_rpc';
  const response = await POST(new Request('http://localhost/api/consent', { method: 'POST', body: JSON.stringify({ consentVersion: CONSENT_VERSION_V2, consentTextHash: await computeConsentTextHash(CONSENT_TEXT_V2_ES_AR), locale: 'es-AR', researchOptIn: true }) }));
  expect(response.status).toBe(503);
  expect(await response.json()).toMatchObject({ ok: false, error: 'consent_unavailable' });
  expect(fixture.records).toEqual([]);
  expect(fixture.researchOptIn).toBe(false);
});
it('records consent together with an explicitly selected research opt-in', async () => {
  const response = await POST(new Request('http://localhost/api/consent', { method: 'POST', body: JSON.stringify({ consentVersion: CONSENT_VERSION_V2, consentTextHash: await computeConsentTextHash(CONSENT_TEXT_V2_ES_AR), locale: 'es-AR', researchOptIn: true }) }));
  expect(response.status).toBe(200);
  expect(fixture.records).toHaveLength(1);
  expect(fixture.researchOptIn).toBe(true);
});
it.each([
  { consentVersion: 'unrecognized', consentTextHash: 'a'.repeat(64), locale: 'es-AR' },
  { consentVersion: '2026-09-07-v2', consentTextHash: 'a'.repeat(64), locale: 'es-AR' },
  { consentVersion: '2026-09-07-v2', locale: 'es-AR' },
])('does not record an unknown or unverifiable consent text: %j', async input => {
  const response = await POST(new Request('http://localhost/api/consent', { method: 'POST', body: JSON.stringify({ ...input, researchOptIn: false }) }));
  expect(response.status).toBe(400);
  expect(fixture.records).toHaveLength(0);
});
