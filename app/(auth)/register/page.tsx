'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/Card';
import { t } from '@/lib/i18n/dict';
import { Brand } from '@/components/layout/Brand';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t('auth.weak_password'));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() || null },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/consent`,
      },
    });

    if (err) {
      if (err.message.includes('already')) {
        setError(t('auth.email_exists'));
      } else {
        setError(err.message);
      }
      setLoading(false);
      return;
    }

    // When Supabase has email confirmation enabled, signUp returns a user
    // but no session. The user must click the link in their email, which
    // hits /auth/callback and exchanges the PKCE code for a real session.
    // Redirecting to /consent now would leave them unauthenticated there.
    if (!data.session) {
      setConfirmSent(true);
      setLoading(false);
      return;
    }

    router.push('/consent');
    router.refresh();
  }

  return (
    <div className="focus-backdrop"><main className="auth-entry relative mx-auto flex min-h-screen max-w-lg items-center justify-center px-5 py-12">
      <GlassCard className="w-full">
        <div className="mb-8">
          <Brand />
          <h1 className="mt-8 text-balance text-3xl font-bold text-text-1">
            {t('auth.register_title')}
          </h1>
          <p className="mt-2 text-pretty font-body text-sm text-text-3">
            {t('auth.register_subtitle')}
          </p>
        </div>

        {confirmSent ? (
          <div className="flex flex-col gap-5">
            <div
              role="status"
              className="rounded-md border border-violet-400/30 bg-violet-400/10 px-4 py-4 font-body text-sm text-text-1"
            >
              {t('auth.check_email')}
            </div>
            <p className="text-center font-body text-sm text-text-3">
              {t('auth.switch_to_login')}{' '}
              <Link
                href="/login"
                prefetch={false}
                className="text-violet-300 underline underline-offset-4 transition-colors hover:text-violet-200"
              >
                {t('auth.sign_in')}
              </Link>
            </p>
          </div>
        ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Input
            type="text"
            label={t('auth.field_name')}
            hint={t('auth.field_name_hint')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <Input
            type="email"
            label={t('auth.field_email')}
            hint={t('auth.field_email_hint')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            label={t('auth.field_password')}
            hint={t('auth.field_password_hint')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
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
            {t('auth.register_cta')}
          </Button>
        </form>
        )}

        {!confirmSent && (
          <p className="mt-6 text-center font-body text-sm text-text-3">
            {t('auth.switch_to_login')}{' '}
            <Link
              href="/login"
              prefetch={false}
              className="text-violet-300 underline underline-offset-4 transition-colors hover:text-violet-200"
            >
              {t('auth.sign_in')}
            </Link>
          </p>
        )}
      </GlassCard>
    </main></div>
  );
}
