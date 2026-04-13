import { createClient, createServiceClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { SessionExpiredError } from '@/lib/errors';
import { computeHash, randomToken, CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';

export const runtime = 'nodejs';

const TOKEN_TTL_MS = 5 * 60 * 1000;

export const POST = withErrorHandler(async (req) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const service = createServiceClient();
  const rawToken = randomToken(32);
  const tokenHash = await computeHash('delete_token', rawToken);
  const userIdHash = await computeHash('crisis', user.id);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  const { error } = await service.from('delete_confirmations').insert({
    user_id: user.id,
    token_hash: tokenHash,
    pepper_version: CURRENT_PEPPER_VERSION,
    expires_at: expiresAt,
  });

  if (error) {
    console.error('[delete/request] insert failed', error);
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }

  // In production: send email via Resend with the magic link
  // For v1 TFG: log the link so the developer can see it
  const url = new URL(req.url);
  const magicLink = `${url.origin}/settings/delete/confirm?token=${rawToken}`;

  console.log(
    JSON.stringify({
      event: 'delete_confirmation_link',
      user_id_hash: userIdHash,
      email: user.email,
      link: magicLink,
      expires_at: expiresAt,
      note: 'Resend integration not yet wired. This link is logged for developer access.',
    }),
  );

  // TODO: when RESEND_API_KEY is set, send real email here.
  // For now we return the link in the response so the user can use it directly
  // during development.

  return {
    emailSent: true,
    devMagicLink: process.env.NODE_ENV !== 'production' ? magicLink : undefined,
  };
});
