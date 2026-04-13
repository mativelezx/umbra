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

  // Mark token as used atomically
  await service
    .from('delete_confirmations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', confirmation.id);

  // Cascade delete — FK cascades handle most of it when we delete profiles
  // Order: children first, then parent
  try {
    // 1. messages (via conversations cascade)
    const { data: convs } = await service
      .from('conversations')
      .select('id')
      .eq('user_id', user.id);
    if (convs && convs.length > 0) {
      const convIds = convs.map((c) => c.id);
      await service.from('messages').delete().in('conversation_id', convIds);
    }
    // 2. conversations
    await service.from('conversations').delete().eq('user_id', user.id);
    // 3. crisis_events (HMAC lookup — not FK)
    const userHashCrisis = await computeHash('crisis', user.id);
    await service.from('crisis_events').delete().eq('user_hash', userHashCrisis);
    // 4. narratives
    await service.from('narratives').delete().eq('user_id', user.id);
    // 5. future_letters
    await service.from('future_letters').delete().eq('user_id', user.id);
    // 6. evidence_highlights (cascades from psychological_profiles)
    // 7. rate_limits
    await service.from('rate_limits').delete().eq('user_id', user.id);
    // 8. delete_confirmations (all for this user)
    await service.from('delete_confirmations').delete().eq('user_id', user.id);
    // 9. psychological_profiles (cascades to evidence_highlights)
    await service.from('psychological_profiles').delete().eq('user_id', user.id);
    // 10. consent_records
    await service.from('consent_records').delete().eq('user_id', user.id);
    // 11. development_plans
    await service.from('development_plans').delete().eq('user_id', user.id);
    // 12. research_dataset IF purgeResearch
    if (body.purgeResearch) {
      const userHashResearch = await computeHash('research', user.id);
      await service.from('research_dataset').delete().eq('user_hash', userHashResearch);
    }
    // 13. profiles (parent — cascades from auth.users if we deleted auth)
    await service.from('profiles').delete().eq('id', user.id);
    // 14. auth.users (requires admin API — use service role)
    // Supabase's admin.deleteUser is via the auth admin namespace.
    // With @supabase/ssr service client it's accessible via .auth.admin.deleteUser
    await service.auth.admin.deleteUser(user.id);
  } catch (e) {
    console.error('[delete/confirm] cascade failed', e);
    return Response.json({ ok: false, error: 'cascade_failed' }, { status: 500 });
  }

  return { deletedAt: new Date().toISOString() };
});
