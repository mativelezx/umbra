'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/Card';
import { t } from '@/lib/i18n/dict';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') ?? '/dashboard';

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
        <Link
          href="/"
          prefetch={false}
          className="font-display text-3xl text-text-1 hover:text-violet-300 transition-colors"
        >
          Umbra
        </Link>
        <h1 className="mt-6 font-display text-4xl italic text-text-1">
          {t('auth.login_title')}
        </h1>
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
          className="text-violet-300 hover:text-violet-200 transition-colors"
        >
          {t('auth.sign_up')}
        </Link>
      </p>
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-6 py-24">
      <Suspense fallback={<div className="font-body text-text-3">Cargando...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
