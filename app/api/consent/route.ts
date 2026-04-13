import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { computeHash, CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';

export const runtime = 'nodejs';

const ConsentSchema = z.object({
  consentVersion: z.string().min(1).max(50),
  researchOptIn: z.boolean(),
});

export const POST = withErrorHandler(async (req) => {
  const body = ConsentSchema.parse(await req.json());
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const userAgent = req.headers.get('user-agent') ?? 'unknown';

  const ipHash = await computeHash('consent_ip', ip);

  const { error: consentError } = await supabase.from('consent_records').insert({
    user_id: user.id,
    consent_version: body.consentVersion,
    ip_hash: ipHash,
    pepper_version: CURRENT_PEPPER_VERSION,
    user_agent: userAgent,
  });

  if (consentError) {
    console.error('[consent] failed to insert', consentError);
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }

  if (body.researchOptIn) {
    await supabase
      .from('profiles')
      .update({ research_opt_in: true })
      .eq('id', user.id);
  }

  return { consentRecorded: true };
});
