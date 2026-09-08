import { after, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestOrigin } from '@/lib/auth/request-origin';
import { sendWelcomeForNewAccount } from '@/lib/email/welcome';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Reject protocol-relative `//evil.com` and anything not a plain app path.
// `next` is user-controlled via the email link, so a naive `startsWith('/')`
// check would let `//evil.com` through and produce `https://evil.com/` when
// passed to `new URL()`. Only same-origin relative paths are allowed.
function isSafeRelativePath(value: string | null): value is string {
  if (!value) return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//') || value.startsWith('/\\')) return false;
  return true;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = requestOrigin(request);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');
  const redirectTo = isSafeRelativePath(next) ? next : '/consent';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Confirmation must finish even if the optional welcome provider is down.
      // Recovery and reused-code callbacks do not schedule a welcome.
      if (redirectTo === '/consent' && data.user) {
        const user = data.user;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
        after(async () => {
          try { await sendWelcomeForNewAccount(user, siteUrl); }
          catch { /* Email failure must never undo a verified account session. */ }
        });
      }
      return NextResponse.redirect(new URL(redirectTo, origin));
    }
    // The exchange is one-shot: the first click consumes the code and sets
    // the session cookie, a second click (or a browser retry) fails. Treat
    // "already logged in" as success so the user does not bounce to /login
    // after an accidental double-click on the confirmation email link.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(new URL(redirectTo, origin));
    }
    // Hard failure: PKCE exchange failed AND no live session. Send the user
    // to a dedicated error page with a hint about why.
    const reason = error.message?.toLowerCase().includes('expired')
      ? 'expired'
      : error.message?.toLowerCase().includes('used')
        ? 'used'
        : 'pkce';
    return NextResponse.redirect(
      new URL(`/auth/auth-code-error?reason=${reason}`, origin),
    );
  }

  return NextResponse.redirect(new URL('/auth/auth-code-error?reason=pkce', origin));
}
