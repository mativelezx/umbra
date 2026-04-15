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
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, url.origin));
    }
  }

  return NextResponse.redirect(new URL('/login', url.origin));
}
