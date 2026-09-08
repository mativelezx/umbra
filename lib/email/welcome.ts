import type { User } from '@supabase/supabase-js';
import { sendWelcomeEmail } from './resend';

/** Both registration paths share the same bounded window and provider key. */
export async function sendWelcomeForNewAccount(
  user: Pick<User, 'id' | 'email' | 'created_at'>,
  siteUrl: string,
): Promise<boolean> {
  const age = Date.now() - new Date(user.created_at).getTime();
  // Resend retains idempotency keys for 24h; keep retries inside that period.
  if (!user.email || !Number.isFinite(age) || age < 0 || age > 60 * 60 * 1000) return false;
  await sendWelcomeEmail({
    to: user.email,
    siteUrl,
    idempotencyKey: `umbra-welcome-${user.id}`,
  });
  return true;
}
