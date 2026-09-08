import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { SessionExpiredError } from '@/lib/errors';
import { computeHash } from '@/lib/security/peppers';

export const runtime = 'nodejs';

const ConfirmSchema = z.object({
  token: z.string().min(16).max(128),
  purgeResearch: z.boolean().optional().default(false),
});

export const POST = withErrorHandler(async (req) => {
  const body = ConfirmSchema.parse(await req.json());
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const service = createServiceClient();
  const tokenHash = await computeHash('delete_token', body.token);

  // Verify token: unused, unexpired, matching user
  const { data: confirmation } = await service
    .from('delete_confirmations')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!confirmation) {
    return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  if (confirmation.used_at) {
    return Response.json({ ok: false, error: 'token_already_used' }, { status: 409 });
  }
  if (new Date(confirmation.expires_at) < new Date()) {
    return Response.json({ ok: false, error: 'token_expired' }, { status: 410 });
  }
  if (confirmation.user_id !== user.id) {
    return Response.json({ ok: false, error: 'token_mismatch' }, { status: 403 });
  }

  // Keep profiles and the confirmation token until Auth deletion succeeds.
  // Existing FK cascades remove all related application rows with auth.users.
  // Pseudonymous rows have no FK: purge them first and allow retry if Auth fails.
  // This is not a transaction across PostgREST and the Auth service.
  const assertOk = (label: string) => ({
    error,
  }: {
    error: { message: string } | null;
  }) => {
    if (error) {
      throw new Error(`${label}: ${error.message}`);
    }
  };

  try {
    // crisis_events (HMAC lookup — not FK)
    const userHashCrisis = await computeHash('crisis', user.id);
    assertOk('crisis_events delete')(
      await service.from('crisis_events').delete().eq('user_hash', userHashCrisis),
    );
    // research_dataset only when the person explicitly requests its purge.
    if (body.purgeResearch) {
      const userHashResearch = await computeHash('research', user.id);
      assertOk('research_dataset delete')(
        await service.from('research_dataset').delete().eq('user_hash', userHashResearch),
      );
    }
    // Auth deletion cascades profiles and its dependent rows, including this token.
    const adminRes = await service.auth.admin.deleteUser(user.id);
    if (adminRes.error) {
      throw new Error(`auth.users delete: ${adminRes.error.message}`);
    }

  } catch (e) {
    console.error('[delete/confirm] cascade failed', e);
    return Response.json({ ok: false, error: 'cascade_failed' }, { status: 500 });
  }

  return { deletedAt: new Date().toISOString() };
});
