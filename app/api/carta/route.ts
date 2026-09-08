import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { ConsentRequiredError, NotFoundError, SessionExpiredError } from '@/lib/errors';

export const runtime = 'nodejs';

const CartaSchema = z.object({
  profileId: z.string().uuid(),
  content: z.string().min(20).max(1500),
});

const UNLOCK_DAYS = 180;

export const POST = withErrorHandler(async (req) => {
  const body = CartaSchema.parse(await req.json());
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const { data: consent, error: consentError } = await supabase
    .from('consent_records').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  if (consentError) return Response.json({ ok: false, error: 'consent_unavailable' }, { status: 503 });
  if (!consent) throw new ConsentRequiredError();
  // A foreign key only checks existence, not ownership. Check both here before
  // attaching the person's letter to a profile snapshot.
  const { data: profile, error: profileError } = await supabase
    .from('psychological_profiles').select('id').eq('id', body.profileId).eq('user_id', user.id).maybeSingle();
  if (profileError) return Response.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });
  if (!profile) throw new NotFoundError('profile');

  const unlockAt = new Date(Date.now() + UNLOCK_DAYS * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('future_letters')
    .insert({
      user_id: user.id,
      content: body.content,
      profile_snapshot_id: body.profileId,
      unlock_at: unlockAt.toISOString(),
    })
    .select('id, unlock_at')
    .single();

  if (error || !data) {
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }

  return { letterId: data.id, unlockAt: data.unlock_at };
});
