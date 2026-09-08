import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/assessment',
  '/chat',
  '/plan',
  '/export',
  '/onboarding',
  '/settings',
];
const AUTH_ROUTES = ['/login', '/register'];
const CONSENT_REQUIRED_PREFIXES = ['/onboarding', '/dashboard', '/assessment', '/chat', '/plan', '/export'];

export async function updateSession(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  // Demo mode: skip all auth redirects so developer can walk through the UI
  // without a real Supabase project.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // This triggers session refresh if needed. MUST be called.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Consent gate: authenticated user without consent → /consent
  if (
    user &&
    CONSENT_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p)) &&
    pathname !== '/consent'
  ) {
    const { data: consent } = await supabase
      .from('consent_records')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!consent) {
      return NextResponse.redirect(new URL('/consent', req.url));
    }
  }

  return res;
}
