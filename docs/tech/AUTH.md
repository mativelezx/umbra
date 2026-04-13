# Umbra — Authentication & Session Management

> Supabase Auth via `@supabase/ssr`, split per runtime, middleware redirects,
> and session refresh.

## Stack

- **Provider**: Supabase Auth (email + password for v1)
- **Package**: `@supabase/ssr` (NOT the deprecated `@supabase/auth-helpers-nextjs`)
- **Session storage**: HTTP-only cookies set by Supabase Auth
- **Refresh**: automatic via `middleware.ts` on every request

## Client split per runtime (ADR-004 + eng review E1)

`@supabase/ssr` requires different client initialization per Next.js runtime.
Using the wrong variant breaks silently in Edge runtime (no Node APIs).

| File | Factory | Used by |
|---|---|---|
| `lib/supabase/client.ts` | `createBrowserClient` | Client components, React hooks (`useAuth`) |
| `lib/supabase/server.ts` | `createServerClient` + `cookies()` from `next/headers` | Node-runtime API routes, RSC server components |
| `lib/supabase/edge.ts` | `createServerClient` with `request`/`response` cookie helpers | Edge-runtime API routes: `/api/analyze`, `/api/analyze/evidence`, `/api/chat`, `/api/narrative`, `/api/plan` |
| `lib/supabase/middleware.ts` | `createServerClient` with `NextRequest`/`NextResponse` cookie helpers | Root `middleware.ts` for session refresh + redirects |

### `lib/supabase/client.ts` (browser)

```ts
'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### `lib/supabase/server.ts` (Node runtime, RSC)

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name, value, options) => { cookieStore.set({ name, value, ...options }); },
        remove: (name, options) => { cookieStore.set({ name, value: '', ...options }); },
      },
    },
  );
}
```

### `lib/supabase/edge.ts` (Edge runtime)

```ts
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

export function createEdgeClient(request: NextRequest, response: Response) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.headers.append('Set-Cookie', serializeCookie(name, value, options));
        },
        remove: (name, options) => {
          response.headers.append('Set-Cookie', serializeCookie(name, '', options));
        },
      },
    },
  );
}
```

### `lib/supabase/middleware.ts`

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/chat', '/plan', '/export', '/onboarding', '/settings'];
const AUTH_ROUTES = ['/login', '/register'];
const CONSENT_REQUIRED_PREFIXES = ['/onboarding', '/dashboard', '/chat', '/plan', '/export'];

export async function updateSession(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // IMPORTANT: refresh token if needed
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some(p => pathname.startsWith(p));

  // Redirect unauthenticated users to login
  if (isProtected && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Consent gate: authenticated user without consent → /consent
  if (session && CONSENT_REQUIRED_PREFIXES.some(p => pathname.startsWith(p))) {
    const { data: consent } = await supabase
      .from('consent_records')
      .select('consent_version')
      .eq('user_id', session.user.id)
      .order('accepted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!consent) {
      return NextResponse.redirect(new URL('/consent', req.url));
    }
  }

  return res;
}
```

## Root `middleware.ts`

```ts
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(req: NextRequest) {
  return updateSession(req);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

## Auth flows

### Registration (`/(auth)/register`)

```
[form submit]
   ↓
supabase.auth.signUp({ email, password, options: { data: { full_name } } })
   ↓
Supabase sends verification email (optional — disabled for dev)
   ↓
auth.users row created
   ↓
TRIGGER on_auth_user_created fires
   ↓
public.profiles row created (via handle_new_user function)
   ↓
session cookie set
   ↓
client redirects to /consent
```

### Login (`/(auth)/login`)

```
[form submit]
   ↓
supabase.auth.signInWithPassword({ email, password })
   ↓
session cookie set
   ↓
middleware redirects to /consent (if no consent) or /dashboard
```

### Session refresh (middleware on every request)

```
request arrives
   ↓
middleware → supabase.auth.getSession()
   ↓
if session exists and token is expiring
   ↓
SDK auto-refreshes via refresh token
   ↓
new access token set in cookie
   ↓
request proceeds
```

### Logout

```
[button click, client component]
   ↓
supabase.auth.signOut()
   ↓
cookies cleared
   ↓
client redirects to /
```

## Auth context (`lib/providers/auth-context.tsx`)

React context wrapping the browser client, used by any client component that
needs current user data:

```ts
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null,
      session,
      loading,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

## Route protection strategy

| Route | Protection |
|---|---|
| `/`, `/privacy`, `/terms` | Public |
| `/(auth)/login`, `/(auth)/register` | Public but redirect to `/dashboard` if authenticated |
| `/consent` | Auth required |
| `/onboarding`, `/dashboard`, `/chat`, `/plan`, `/export`, `/settings/*` | Auth required + consent required |
| `/api/analyze`, `/api/chat`, `/api/narrative`, `/api/plan`, `/api/analyze/evidence` | Auth required (Edge route reads session from cookie) |
| `/api/account/*` | Auth required (Node runtime, service-role for elevated operations) |

Protection is enforced TWICE for defense-in-depth:
1. `middleware.ts` redirects unauthenticated users on the edge (cheap, client never sees protected content)
2. Each API route calls `supabase.auth.getSession()` server-side and returns 401 if no session (defense against middleware bypass, though none is currently known)

## Session timeout (chat only)

Chat has a 45-minute idle timeout (distinct from auth session timeout):

```
POST /api/chat
  ↓
check conversations.last_activity_at
  ↓
if NOW() - last_activity_at > 45 min:
  return 401 { error: 'session_expired', message: 'empezá una nueva conversación' }
  client creates new conversation
else:
  UPDATE conversations SET last_activity_at = NOW()
  proceed
```

Auth session itself does not timeout at 45 min — that's only for chat. Auth
follows Supabase default (1 hour JWT, refreshed automatically).

## Defense-in-depth

1. **Middleware** — first line, cheap redirect
2. **Route handler** — second line, explicit `getSession()` check
3. **RLS** — third line, database rejects queries missing `auth.uid()` match
4. **Service role** — fourth line, only used intentionally for operations that need to bypass RLS (account delete cascade, crisis_events audit writes)

## Common pitfalls

- **Importing browser client in a server component** → TypeError at runtime. Always use `server.ts` in server components.
- **Importing server client in a client component** → `cookies()` not available. Always use `client.ts` in client components.
- **Using server client in Edge route** → `cookies()` from `next/headers` works in RSC but not in Edge routes. Always use `edge.ts`.
- **Forgetting to refresh session in middleware** → user sees stale data, middleware doesn't pick up new logins until next request.
- **Setting cookies after calling `getSession()`** → race condition, client may see stale session. Middleware returns the `res` object with cookies already set.

## Testing

- `lib/supabase/client.test.ts` — browser client instantiates correctly
- `lib/supabase/server.test.ts` — server client reads cookies from `next/headers`
- `lib/supabase/edge.test.ts` — edge client reads from request, writes to response
- `middleware.test.ts` (integration) — Playwright test: unauthenticated → login, authenticated → dashboard, consent gate

## References

- [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js middleware docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [DECISIONS.md ADR-004](../DECISIONS.md) — `@supabase/ssr` choice
- [tech/ARCHITECTURE.md](ARCHITECTURE.md) — system topology
- [tech/DATABASE.md](DATABASE.md) — RLS policies
- [biz/LEGAL.md](../biz/LEGAL.md) — consent flow legal requirements
