'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/Card';
import { t } from '@/lib/i18n/dict';
import {
  CONSENT_VERSION_V1,
  CONSENT_LOCALE_V1,
  CONSENT_TEXT_V1_ES_AR,
  computeConsentTextHash,
} from '@/lib/consent/text-v1-es-AR';

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
    const consentTextHash = await computeConsentTextHash(CONSENT_TEXT_V1_ES_AR);

    const res = await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentVersion: CONSENT_VERSION_V1,
        researchOptIn,
        consentTextHash,
        locale: CONSENT_LOCALE_V1,
      }),
    });

    if (!res.ok) {
      setError('No pudimos guardar tu consentimiento. Probá de nuevo.');
      setLoading(false);
      return;
    }
    router.push('/onboarding');
    router.refresh();
  }

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 md:px-10">
      <div className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
          {t('consent.eyebrow')}
        </p>
        <h1 className="mt-3 text-balance font-display text-5xl italic text-text-1 md:text-6xl">
          {t('consent.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty font-body text-lg leading-relaxed text-text-2">
          {t('consent.subtitle')}
        </p>
      </div>

      <GlassCard className="mb-8 max-h-[60vh] overflow-y-auto">
        <article className="prose-sm prose-invert font-body text-sm leading-relaxed text-text-2">
          <section>
            <h2 className="mt-0 font-display text-2xl text-text-1">{t('consent.section_data_title')}</h2>
            <p className="mt-2 text-pretty">{t('consent.section_data_intro')}</p>
            <ul className="mt-2 space-y-1.5">
              <li>{t('consent.section_data_email')}</li>
              <li>{t('consent.section_data_text')}</li>
              <li>{t('consent.section_data_profile')}</li>
              <li>{t('consent.section_data_consent')}</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">{t('consent.section_who_title')}</h2>
            <p className="mt-2 text-pretty">{t('consent.section_who_intro')}</p>
            <ul className="mt-2 space-y-1.5">
              <li>{t('consent.section_who_supabase')}</li>
              <li>{t('consent.section_who_anthropic')}</li>
              <li>{t('consent.section_who_ml')}</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">{t('consent.section_rights_title')}</h2>
            <p className="mt-2 text-pretty">{t('consent.section_rights_intro')}</p>
            <ul className="mt-2 space-y-1.5">
              <li>{t('consent.section_rights_export')}</li>
              <li>{t('consent.section_rights_delete')}</li>
              <li>{t('consent.section_rights_optout')}</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">Umbra no es terapia</h2>
            <p className="mt-2 text-pretty">
              Es una herramienta de autoconocimiento. Si en algún momento sentís crisis,
              llamá al 135 (Centro de Asistencia al Suicida, Argentina), al 911 o al
              0800-999-0091 (Salud Mental Responde).
            </p>
          </section>
        </article>
      </GlassCard>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-violet-400/15 bg-umbra-fog/30 p-4 transition-[border-color,background-color] duration-150 hover:border-violet-400/30 hover:bg-umbra-fog/50">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            required
            className="mt-1 h-5 w-5 cursor-pointer accent-violet-400"
          />
          <span className="text-pretty font-body text-sm leading-relaxed text-text-1 transition-colors duration-150 group-hover:text-white">
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
          <div className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} disabled={!accepted} size="lg">
          {t('consent.cta')}
        </Button>
      </form>
    </main>
  );
}
