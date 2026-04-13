import { createClient, createServiceClient } from '@/lib/supabase/server';
import { computeHash } from '@/lib/security/peppers';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  const service = createServiceClient();

  const [
    { data: profile },
    { data: psychProfiles },
    { data: narratives },
    { data: conversations },
    { data: messages },
    { data: plans },
    { data: letters },
    { data: consents },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('psychological_profiles').select('*').eq('user_id', user.id),
    supabase.from('narratives').select('*').eq('user_id', user.id),
    supabase.from('conversations').select('*').eq('user_id', user.id),
    supabase
      .from('messages')
      .select('*, conversation:conversations!inner(user_id)')
      .eq('conversation.user_id', user.id),
    supabase.from('development_plans').select('*').eq('user_id', user.id),
    supabase.from('future_letters').select('*').eq('user_id', user.id),
    supabase.from('consent_records').select('*').eq('user_id', user.id),
  ]);

  // If research_opt_in is true, include pseudonymized research rows
  let researchRows: unknown[] = [];
  if (profile?.research_opt_in) {
    try {
      const userHash = await computeHash('research', user.id);
      const { data } = await service
        .from('research_dataset')
        .select('*')
        .eq('user_hash', userHash);
      researchRows = data ?? [];
    } catch (e) {
      console.warn('[export] research fetch failed', e);
    }
  }

  const payload = {
    export_version: '1.0',
    exported_at: new Date().toISOString(),
    notice:
      'Este archivo contiene todos los datos personales que Umbra tiene sobre vos, bajo el derecho de acceso de la Ley 25.326.',
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile,
    psychological_profiles: psychProfiles,
    narratives,
    conversations,
    messages,
    development_plans: plans,
    future_letters: letters,
    consent_records: consents,
    research_dataset: researchRows,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="umbra-datos-${user.id}-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
