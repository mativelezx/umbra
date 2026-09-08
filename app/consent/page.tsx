'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n/dict';
import { Brand } from '@/components/layout/Brand';
import {
  CONSENT_VERSION_V2,
  CONSENT_LOCALE_V2,
  CONSENT_TEXT_V2_ES_AR,
} from '@/lib/consent/text-v2-es-AR';
import { computeConsentTextHash } from '@/lib/consent/text-v1-es-AR';

export default function ConsentPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [researchOptIn, setResearchOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accepted) return;
    setLoading(true);
    setError(null);

    // Compute SHA-256 of the verbatim consent text at submit time.
    // The text is imported from a versioned, immutable constant
    // (ADR-024) so the hash is stable across reloads.
    try {
      const consentTextHash = await computeConsentTextHash(CONSENT_TEXT_V2_ES_AR);

      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentVersion: CONSENT_VERSION_V2,
          researchOptIn,
          consentTextHash,
          locale: CONSENT_LOCALE_V2,
        }),
      });

      if (!res.ok) {
        setError(res.status === 503
          ? 'El servicio de consentimiento no está disponible. Probá de nuevo más tarde.'
          : 'No pudimos guardar tu consentimiento. Probá de nuevo.');
        return;
      }
      router.push('/onboarding');
      router.refresh();
    } catch {
      setError('No pudimos guardar tu consentimiento. Probá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="focus-backdrop"><main className="focus-entry relative mx-auto max-w-3xl px-6 py-8 md:px-10">
      <Brand />
      <div className="mb-6 mt-8">
        <h1 className="text-balance text-3xl font-bold text-text-1 md:text-4xl">
          {t('consent.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty font-body text-lg leading-relaxed text-text-2">
          {t('consent.subtitle')}
        </p>
      </div>

      <div role="region" aria-label="Información sobre el consentimiento" tabIndex={0} className="mb-8 max-h-[60vh] overflow-y-auto rounded-2xl bg-white p-6 md:p-8">
        <article className="whitespace-pre-wrap font-body text-sm leading-relaxed text-text-2">{CONSENT_TEXT_V2_ES_AR}</article>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-violet-400/15 bg-umbra-fog/30 p-4 transition-[border-color,background-color] duration-150 hover:border-violet-400/30 hover:bg-umbra-fog/50">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            required
            className="mt-1 h-5 w-5 cursor-pointer accent-violet-400"
          />
          <span className="text-pretty font-body text-sm leading-relaxed text-text-1 transition-colors duration-150 group-hover:text-text-1">
            {t('consent.accept_label')}
          </span>
        </label>

        <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-violet-400/15 bg-umbra-fog/30 p-4 transition-[border-color,background-color] duration-150 hover:border-violet-400/30 hover:bg-umbra-fog/50">
          <input
            type="checkbox"
            checked={researchOptIn}
            onChange={(e) => setResearchOptIn(e.target.checked)}
            className="mt-1 h-5 w-5 cursor-pointer accent-violet-400"
          />
          <span className="text-pretty font-body text-sm leading-relaxed text-text-2 transition-colors duration-150 group-hover:text-text-1">
            {t('consent.research_label')}
          </span>
        </label>

        {error && (
          <div role="alert" className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} disabled={!accepted} size="lg">
          {t('consent.cta')}
        </Button>
      </form>
    </main></div>
  );
}
