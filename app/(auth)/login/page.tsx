'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/Card';
import { t } from '@/lib/i18n/dict';
import { Brand } from '@/components/layout/Brand';
import { AccessPrelude } from '@/components/layout/AccessPrelude';

// Reject protocol-relative `//evil.com` and anything that's not a plain
// same-origin path. Middleware only writes safe values here, but the param
// is user-controlled so it still has to be sanitized at the sink.
function safeRedirectPath(raw: string | null): string {
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/')) return '/dashboard';
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/dashboard';
  return raw;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = safeRedirectPath(searchParams.get('redirectedFrom'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      // Prefer the stable AuthError.code from @supabase/auth-js, fall back to
      // message regex only if the runtime is older and code isn't populated.
      const code = (err as { code?: string }).code;
      const isEmailNotConfirmed =
        code === 'email_not_confirmed' || /email not confirmed/i.test(err.message ?? '');
      setError(isEmailNotConfirmed ? t('auth.email_not_confirmed') : t('auth.invalid_credentials'));
      setLoading(false);
      return;
    }
    router.push(redirectedFrom);
    router.refresh();
  }

  return (
    <GlassCard className="w-full">
      <div className="mb-8">
        <Brand />
        <h1 className="mt-8 text-balance text-3xl font-bold text-text-1">
          {t('auth.login_title')}
        </h1>
        <p className="mt-2 text-pretty font-body text-sm text-text-3">
          {t('auth.login_subtitle')}
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input
          type="email"
          label={t('auth.field_email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          label={t('auth.field_password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Link href="/forgot-password" className="inline-flex min-h-11 items-center self-end text-sm text-text-3 underline underline-offset-4">Olvidé mi contraseña</Link>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose"
          >
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} size="lg" className="mt-2">
          {t('auth.login_cta')}
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-text-3">
        {t('auth.switch_to_register')}{' '}
        <Link
          href="/register"
          prefetch={false}
          className="text-violet-300 underline underline-offset-4 transition-colors hover:text-violet-200"
        >
          {t('auth.sign_up')}
        </Link>
      </p>
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <div className="focus-backdrop access-layout"><AccessPrelude /><main className="auth-entry relative mx-auto flex min-h-screen max-w-lg items-center justify-center px-5 py-12">
      <Suspense fallback={<div className="font-body text-text-3">Cargando...</div>}>
        <LoginContent />
      </Suspense>
    </main></div>
  );
}
