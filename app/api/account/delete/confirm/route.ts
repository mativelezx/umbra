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
  const supabase = createClient();
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

  // Cascade delete BEFORE marking the token used. If anything fails mid-
  // cascade we want the user to be able to retry with the same link instead
  // of being locked out by a burned token on a partially-deleted account.
  //
  // Each step is wrapped in assertOk(): Supabase's PostgREST client returns
  // `{ error }` on RLS denials / network errors without throwing, so if we
  // don't inspect every return value a partial cascade could silently
  // succeed and still reach the used_at marking below.
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
    // 1. messages (via conversations cascade)
    const { data: convs, error: convSelectErr } = await service
      .from('conversations')
      .select('id')
      .eq('user_id', user.id);
    if (convSelectErr) throw new Error(`conversations select: ${convSelectErr.message}`);
    if (convs && convs.length > 0) {
      const convIds = convs.map((c) => c.id);
      const res = await service.from('messages').delete().in('conversation_id', convIds);
      assertOk('messages delete')(res);
    }
    // 2. conversations
    assertOk('conversations delete')(
      await service.from('conversations').delete().eq('user_id', user.id),
    );
    // 3. crisis_events (HMAC lookup — not FK)
    const userHashCrisis = await computeHash('crisis', user.id);
    assertOk('crisis_events delete')(
      await service.from('crisis_events').delete().eq('user_hash', userHashCrisis),
    );
    // 4. narratives
    assertOk('narratives delete')(
      await service.from('narratives').delete().eq('user_id', user.id),
    );
    // 5. future_letters
    assertOk('future_letters delete')(
      await service.from('future_letters').delete().eq('user_id', user.id),
    );
    // 6. development_plans (must precede psychological_profiles: profile_id FK)
    assertOk('development_plans delete')(
      await service.from('development_plans').delete().eq('user_id', user.id),
    );
    // 7. evidence_highlights (cascades from psychological_profiles)
    // 8. rate_limits
    assertOk('rate_limits delete')(
      await service.from('rate_limits').delete().eq('user_id', user.id),
    );
    // 9. psychological_profiles (cascades to evidence_highlights)
    assertOk('psychological_profiles delete')(
      await service.from('psychological_profiles').delete().eq('user_id', user.id),
    );
    // 10. consent_records
    assertOk('consent_records delete')(
      await service.from('consent_records').delete().eq('user_id', user.id),
    );
    // 11. research_dataset IF purgeResearch
    if (body.purgeResearch) {
      const userHashResearch = await computeHash('research', user.id);
      assertOk('research_dataset delete')(
        await service.from('research_dataset').delete().eq('user_hash', userHashResearch),
      );
    }
    // 12. profiles (parent — cascades from auth.users if we deleted auth)
    assertOk('profiles delete')(
      await service.from('profiles').delete().eq('id', user.id),
    );
    // 13. auth.users (requires admin API — use service role).
    // Supabase's admin.deleteUser is via the auth admin namespace.
    const adminRes = await service.auth.admin.deleteUser(user.id);
    if (adminRes.error) {
      throw new Error(`auth.users delete: ${adminRes.error.message}`);
    }

    // 14. Cascade succeeded — now mark the token used and purge stale
    // delete_confirmations. If this cleanup fails, the cascade has already
    // happened so the user is effectively deleted; we just log and move on.
    const nowIso = new Date().toISOString();
    const { error: markErr } = await service
      .from('delete_confirmations')
      .update({ used_at: nowIso })
      .eq('id', confirmation.id);
    if (markErr) {
      console.error('[delete/confirm] token mark failed after cascade', markErr);
    }
    // Token row may already be orphaned (user_id FK gone). Best-effort purge.
    await service
      .from('delete_confirmations')
      .delete()
      .eq('user_id', user.id);
  } catch (e) {
    console.error('[delete/confirm] cascade failed', e);
    return Response.json({ ok: false, error: 'cascade_failed' }, { status: 500 });
  }

  return { deletedAt: new Date().toISOString() };
});
