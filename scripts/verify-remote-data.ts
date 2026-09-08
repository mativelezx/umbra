/** Explicit synthetic-account integration. No signup email and no paid AI. */
import assert from 'node:assert/strict';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { CONSENT_TEXT_V2_ES_AR, CONSENT_VERSION_V2, CONSENT_LOCALE_V2 } from '../lib/consent/text-v2-es-AR';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  assert.equal(process.env.QA_ALLOW_REMOTE_ACCOUNTS, 'true', 'Explicit opt-in required');
  assert.equal(new URL(url).hostname, process.env.QA_EXPECTED_DB_HOST, 'Wrong database target');
  const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const makeClient = () => createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const created: { id: string; email: string }[] = [];
  const checks: string[] = [];
  const pass = (name: string) => checks.push(name);
  try {
    const anon = makeClient();
    const anonymous = await anon.from('profiles').select('id');
    assert.equal(anonymous.error, null); assert.deepEqual(anonymous.data, []);
    pass('Anonymous requests cannot read profiles');
    const clients = [];
    for (const label of ['a', 'b']) {
      const email = `umbra-qa-${Date.now()}-${label}@example.com`;
      const password = randomBytes(24).toString('hex');
      const user = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: 'Cuenta sintética QA', qa_fixture: true } });
      assert.equal(user.error, null); assert.ok(user.data.user);
      created.push({ id: user.data.user.id, email });
      const client = makeClient();
      const login = await client.auth.signInWithPassword({ email, password });
      assert.equal(login.error, null); assert.equal(login.data.user?.id, user.data.user.id);
      const profile = await client.from('profiles').select('id').eq('id', user.data.user.id).single();
      assert.equal(profile.error, null); assert.equal(profile.data?.id, user.data.user.id);
      clients.push(client);
    }
    pass('Two admin-created synthetic accounts can log in; signup trigger creates their profiles');
    const [a, b] = created;
    const hidden = await clients[0].from('profiles').select('id').eq('id', b.id);
    assert.equal(hidden.error, null); assert.deepEqual(hidden.data, []);
    const deniedWrite = await clients[0].from('profiles').update({ full_name: 'Forbidden fixture edit' }).eq('id', b.id).select('id');
    assert.equal(deniedWrite.error, null); assert.deepEqual(deniedWrite.data, []);
    const deniedInsert = await clients[0].from('psychological_profiles').insert({ user_id: b.id });
    assert.ok(deniedInsert.error);
    pass('RLS blocks cross-account reads, changes and profile creation');
    for (const table of ['crisis_events', 'research_dataset', 'delete_confirmations']) {
      const rows: { data: unknown; error: unknown } = await clients[0].from(table).select('*');
      assert.equal(rows.error, null); assert.deepEqual(rows.data, []);
    }
    pass('User sessions cannot read administrative tables');
    const args = { p_user_id: a.id, p_consent_version: CONSENT_VERSION_V2,
      p_consent_text_hash: createHash('sha256').update(CONSENT_TEXT_V2_ES_AR).digest('hex'),
      p_locale: CONSENT_LOCALE_V2, p_ip_hash: 'synthetic-qa-not-an-ip', p_pepper_version: 1,
      p_user_agent: 'Umbra synthetic database QA', p_research_opt_in: false };
    const direct = await clients[0].rpc('record_consent_atomic', args);
    assert.ok(direct.error);
    const accepted = await service.rpc('record_consent_atomic', args);
    assert.equal(accepted.error, null); assert.ok(accepted.data);
    const invalid = await service.rpc('record_consent_atomic', { ...args, p_research_opt_in: null });
    assert.ok(invalid.error);
    const missing = await service.rpc('record_consent_atomic', { ...args, p_user_id: randomUUID() });
    assert.ok(missing.error);
    const records = await clients[0].from('consent_records').select('id').eq('user_id', a.id);
    assert.equal(records.error, null); assert.equal(records.data?.length, 1);
    const preference = await clients[0].from('profiles').select('research_opt_in').eq('id', a.id).single();
    assert.equal(preference.data?.research_opt_in, false);
    pass('Consent is server-only, atomic and preserves the optional research choice');
    const retained = await service.rpc('retained_profile_results', { payload: { selfReport: { qa: true }, ml: { perDimensionStatus: 'low_confidence' }, raw: 'synthetic technical data' } });
    assert.equal(retained.error, null);
    assert.deepEqual(retained.data, { selfReport: { qa: true }, ml: { perDimensionStatus: 'low_confidence' } });
    pass('Remote retention function preserves results and strips raw payload');
    process.stdout.write(JSON.stringify({ ok: true, target: new URL(url).hostname, checks, scope: 'Remote Auth and database, synthetic admin-created identities; not signup email or UI E2E' }, null, 2) + '\n');
  } finally {
    for (const user of created) {
      assert.match(user.email, /^umbra-qa-\d+-[ab]@example\.com$/);
      const deleted = await service.auth.admin.deleteUser(user.id);
      assert.equal(deleted.error, null, 'Synthetic QA cleanup failed');
    }
    process.stdout.write(`Removed only ${created.length} identities created by this verification.\n`);
  }
}

main().catch(error => { process.stderr.write(String(error) + '\n'); process.exitCode = 1; });
