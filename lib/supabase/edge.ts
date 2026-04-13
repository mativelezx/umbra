import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

type CookieStore = {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string): void;
};

/**
 * Edge runtime Supabase client factory.
 * Used by /api/analyze, /api/analyze/evidence, /api/narrative, /api/chat, /api/plan.
 *
 * Unlike the Node-runtime `server.ts` helper, Edge routes cannot import
 * `cookies` from `next/headers`. Instead they construct a cookie adapter from
 * the NextRequest and the Response headers they return.
 */
export function createEdgeClient(request: Request, response: Response) {
  const cookieMap = new Map<string, string>();
  const cookieHeader = request.headers.get('cookie') ?? '';

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookieMap.set(name.trim(), rest.join('=').trim());
    }
  });

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieMap.get(name);
        },
        set(name: string, value: string, options: CookieOptions) {
          response.headers.append('Set-Cookie', serializeCookie(name, value, options));
        },
        remove(name: string, options: CookieOptions) {
          response.headers.append('Set-Cookie', serializeCookie(name, '', { ...options, maxAge: 0 }));
        },
      },
    },
  );
}

export function createEdgeServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join('; ');
}
