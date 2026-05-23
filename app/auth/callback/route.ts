import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');
  const redirectTo = isSafeRelativePath(next) ? next : '/consent';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, url.origin));
    }
    // The exchange is one-shot: the first click consumes the code and sets
    // the session cookie, a second click (or a browser retry) fails. Treat
    // "already logged in" as success so the user does not bounce to /login
    // after an accidental double-click on the confirmation email link.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(new URL(redirectTo, url.origin));
    }
    // Hard failure: PKCE exchange failed AND no live session. Send the user
    // to a dedicated error page with a hint about why.
    const reason = error.message?.toLowerCase().includes('expired')
      ? 'expired'
      : error.message?.toLowerCase().includes('used')
        ? 'used'
        : 'pkce';
    return NextResponse.redirect(
      new URL(`/auth/auth-code-error?reason=${reason}`, url.origin),
    );
  }

  return NextResponse.redirect(new URL('/auth/auth-code-error?reason=pkce', url.origin));
}
