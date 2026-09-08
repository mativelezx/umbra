import { createClient, createServiceClient } from '@/lib/supabase/server';
import { computeHash } from '@/lib/security/peppers';

export const runtime = 'nodejs';

const PAGE_SIZE = 500;
async function readAll(fetchPage: (start: number, end: number) => PromiseLike<{
  data: unknown[] | null; error: unknown; count: number | null;
}>) {
  const rows: unknown[] = [];
  let total: number | null = null;
  do {
    const page = await fetchPage(rows.length, rows.length + PAGE_SIZE - 1);
    if (page.error || !page.data || page.count == null) throw new Error('export_query_failed');
    if (total != null && page.count !== total) throw new Error('export_changed_during_read');
    total = page.count;
    if (page.data.length === 0 && rows.length < total) throw new Error('export_incomplete');
    rows.push(...page.data);
  } while (rows.length < total);
  return rows;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
    }
    const service = createServiceClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', user.id).single();
    if (profileError || !profile) throw new Error('export_profile_failed');

    const [researchHash, crisisHash] = await Promise.all([
      computeHash('research', user.id), computeHash('crisis', user.id),
    ]);
    const owned = (table: string, order = 'id') => readAll((start, end) =>
      supabase.from(table).select('*', { count: 'exact' }).eq('user_id', user.id)
        .order(order).range(start, end));
    const [psychProfiles, narratives, conversations, messages, plans, letters, consents,
      sessions, highlights, usability, limits, research, crisis, deletionRequests] = await Promise.all([
      owned('psychological_profiles'), owned('narratives'), owned('conversations'),
      readAll((start, end) => supabase.from('messages')
        .select('*, conversation:conversations!inner(user_id)', { count: 'exact' })
        .eq('conversation.user_id', user.id).order('id').range(start, end)),
      owned('development_plans'), owned('future_letters'), owned('consent_records'),
      owned('onboarding_sessions'),
      readAll((start, end) => supabase.from('evidence_highlights')
        .select('*, profile:psychological_profiles!inner(user_id)', { count: 'exact' })
        .eq('profile.user_id', user.id).order('id').range(start, end)),
      owned('usability_responses'), owned('rate_limits', 'day'),
      // Opt-out stops future collection; existing contributions remain exportable.
      readAll((start, end) => service.from('research_dataset').select('*', { count: 'exact' })
        .eq('user_hash', researchHash).order('id').range(start, end)),
      readAll((start, end) => service.from('crisis_events').select('*', { count: 'exact' })
        .eq('user_hash', crisisHash).order('id').range(start, end)),
      // Never include authentication material in the download.
      readAll((start, end) => service.from('delete_confirmations')
        .select('id,created_at,expires_at,used_at', { count: 'exact' })
        .eq('user_id', user.id).order('id').range(start, end)),
    ]);
    const payload = {
      export_version: '1.1', exported_at: new Date().toISOString(),
      notice: 'Datos personales de tu cuenta en Umbra. No incluye contraseñas, claves ni tokens de autenticación. Las colecciones se leen durante la solicitud; no es una copia transaccional de la base.',
      user: {
        id: user.id, email: user.email, phone: user.phone, created_at: user.created_at,
        updated_at: user.updated_at, email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at, user_metadata: user.user_metadata,
      },
      profile, psychological_profiles: psychProfiles, narratives, conversations, messages,
      development_plans: plans, future_letters: letters, consent_records: consents,
      onboarding_sessions: sessions, evidence_highlights: highlights,
      usability_responses: usability, rate_limits: limits, research_dataset: research,
      crisis_events: crisis, delete_confirmations: deletionRequests,
    };
    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json', 'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename="umbra-datos-${user.id}-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch {
    return Response.json({ ok: false, error: 'export_failed', message: 'No pudimos reunir todos tus datos. Probá de nuevo.' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } });
  }
}
