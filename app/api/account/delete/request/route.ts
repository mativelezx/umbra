import { createClient, createServiceClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { SessionExpiredError } from '@/lib/errors';
import { computeHash, randomToken, CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';
import { sendDeleteConfirmationEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

const TOKEN_TTL_MS = 5 * 60 * 1000;

export const POST = withErrorHandler(async (req) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();
  if (!user.email) {
    return Response.json({ ok: false, error: 'no_email_on_account' }, { status: 400 });
  }

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

  const url = new URL(req.url);
  const magicLink = `${url.origin}/settings/delete/confirm?token=${rawToken}`;

  try {
    const result = await sendDeleteConfirmationEmail({
      to: user.email,
      magicLink,
      expiresAt,
    });

    if (result.sent) {
      console.log(
        JSON.stringify({
          event: 'delete_confirmation_sent',
          user_id_hash: userIdHash,
          provider: result.provider,
          expires_at: expiresAt,
        }),
      );
      return { emailSent: true as const };
    }

    // No Resend key configured — dev mode fallback. Log the link server-side
    // and hand it back inline so the developer can complete the flow.
    console.log(
      JSON.stringify({
        event: 'delete_confirmation_link_dev',
        user_id_hash: userIdHash,
        email: user.email,
        link: magicLink,
        expires_at: expiresAt,
        note: 'RESEND_API_KEY not set. Link returned inline for dev.',
      }),
    );

    return {
      emailSent: false as const,
      devMagicLink: result.devLink,
    };
  } catch (err) {
    console.error('[delete/request] email send failed', err);
    // Don't leak the token on failure — user can retry.
    return Response.json({ ok: false, error: 'email_send_failed' }, { status: 502 });
  }
});
