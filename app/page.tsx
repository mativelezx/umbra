import Link from 'next/link';
import { ChatCircleDots, Sparkle, ArrowRight, Shield } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/Button';
import { LandingReveal, LandingItem } from '@/components/landing/LandingReveal';
import { t } from '@/lib/i18n/dict';

const HOW_STEPS = [
  {
    n: '01',
    labelKey: 'landing.how_step_1_label',
    titleKey: 'landing.how_step_1_title',
    descKey: 'landing.how_step_1_desc',
  },
  {
    n: '02',
    labelKey: 'landing.how_step_2_label',
    titleKey: 'landing.how_step_2_title',
    descKey: 'landing.how_step_2_desc',
  },
  {
    n: '03',
    labelKey: 'landing.how_step_3_label',
    titleKey: 'landing.how_step_3_title',
    descKey: 'landing.how_step_3_desc',
  },
] as const;

const PILLARS = [
  { titleKey: 'landing.pillar_rigor_title', descKey: 'landing.pillar_rigor_desc' },
  { titleKey: 'landing.pillar_jung_title', descKey: 'landing.pillar_jung_desc' },
  { titleKey: 'landing.pillar_pc_title', descKey: 'landing.pillar_pc_desc' },
  { titleKey: 'landing.pillar_ar_title', descKey: 'landing.pillar_ar_desc' },
] as const;

const TRUST = [
  { Icon: Shield, key: 'landing.trust_law' },
  { Icon: Shield, key: 'landing.trust_export' },
  { Icon: Shield, key: 'landing.trust_delete' },
  { Icon: Shield, key: 'landing.trust_research' },
] as const;

export default function LandingPage() {
  return (
    <main className="relative">
      {/* HERO */}
      <section className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col items-start justify-center px-6 py-24 md:px-10">
        <LandingReveal>
          <LandingItem>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(180,102,255,0.8)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-2">
                {t('landing.eyebrow')}
              </span>
            </div>
          </LandingItem>

          <LandingItem>
            <h1 className="mt-8 text-balance font-display text-5xl leading-[1.05] text-text-1 md:text-7xl lg:text-[7.5rem]">
              {t('landing.hero_title_1')}
              <br />
              <span className="italic text-violet-300">{t('landing.hero_title_2')}</span>
            </h1>
          </LandingItem>

          <LandingItem>
            <p className="mt-8 max-w-2xl text-pretty font-body text-lg leading-relaxed text-text-2 md:text-xl">
              {t('landing.hero_subtitle')}
            </p>
          </LandingItem>

          <LandingItem>
            <div className="mt-12 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button variant="primary" size="lg" className="pl-7 pr-6">
                  <span>{t('landing.cta_start')}</span>
                  <ArrowRight size={18} weight="bold" />
                </Button>
              </Link>
              <Link href="#como">
                <Button variant="ghost" size="lg">
                  {t('landing.cta_learn')}
                </Button>
              </Link>
            </div>
          </LandingItem>

          <LandingItem>
            <p className="mt-20 max-w-xl text-pretty font-body text-sm text-text-3">
              {t('landing.footer_not_therapy')}
            </p>
          </LandingItem>
        </LandingReveal>
      </section>

      {/* HOW IT WORKS */}
      <section id="como" className="relative mx-auto max-w-6xl px-6 py-24 md:px-10">
        <LandingReveal>
          <LandingItem>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
              {t('landing.how_eyebrow')}
            </p>
          </LandingItem>
          <LandingItem>
            <h2 className="mt-4 max-w-3xl text-balance font-display text-4xl italic text-text-1 md:text-5xl">
              {t('landing.how_title')}
            </h2>
          </LandingItem>
        </LandingReveal>

        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {HOW_STEPS.map((step, i) => (
            <LandingReveal key={step.n} delay={0.15 + i * 0.12} as="li">
              <LandingItem>
                <article className="group relative h-full rounded-2xl border border-violet-400/10 bg-umbra-fog/40 p-7 backdrop-blur-sm transition-[box-shadow,border-color] duration-200 ease-out hover:border-violet-400/25 hover:shadow-[0_0_0_1px_rgba(180,102,255,0.15),0_8px_32px_-12px_rgba(180,102,255,0.25)]">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs tracking-[0.2em] text-violet-300/70 tabular-nums">
                      {step.n}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
                      {t(step.labelKey)}
                    </span>
                  </div>
                  <h3 className="mt-6 text-pretty font-display text-2xl text-text-1">{t(step.titleKey)}</h3>
                  <p className="mt-3 text-pretty font-body text-sm leading-relaxed text-text-2">
                    {t(step.descKey)}
                  </p>
                </article>
              </LandingItem>
            </LandingReveal>
          ))}
        </ol>
      </section>

      {/* PILLARS */}
      <section id="pilares" className="relative mx-auto max-w-6xl px-6 py-24 md:px-10">
        <LandingReveal>
          <LandingItem>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
              {t('landing.pillars_eyebrow')}
            </p>
          </LandingItem>
          <LandingItem>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-4xl italic text-text-1 md:text-5xl">
              {t('landing.pillars_title')}
            </h2>
          </LandingItem>
        </LandingReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {PILLARS.map(({ titleKey, descKey }, i) => (
            <LandingReveal key={titleKey} delay={0.1 + i * 0.1} as="div">
              <LandingItem>
                <article
                  className={`relative h-full rounded-2xl border border-violet-400/10 bg-umbra-fog/30 p-8 backdrop-blur-sm transition-[box-shadow,border-color] duration-200 ease-out hover:border-violet-400/25 hover:shadow-[0_0_0_1px_rgba(180,102,255,0.15),0_8px_32px_-12px_rgba(180,102,255,0.25)] ${
                    i % 2 === 0 ? 'md:translate-y-3' : ''
                  }`}
                >
                  <Sparkle size={22} weight="duotone" className="text-violet-300" />
                  <h3 className="mt-5 text-pretty font-display text-2xl text-text-1">{t(titleKey)}</h3>
                  <p className="mt-3 text-pretty font-body text-sm leading-relaxed text-text-2">
                    {t(descKey)}
                  </p>
                </article>
              </LandingItem>
            </LandingReveal>
          ))}
        </div>
      </section>

      {/* TRUST / DATA */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 md:px-10">
        <LandingReveal>
          <LandingItem>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
              {t('landing.trust_eyebrow')}
            </p>
          </LandingItem>
          <LandingItem>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-4xl italic text-text-1 md:text-5xl">
              {t('landing.trust_title')}
            </h2>
          </LandingItem>
        </LandingReveal>

        <ul className="mt-12 grid gap-3 md:grid-cols-2">
          {TRUST.map((row, i) => (
            <LandingReveal key={row.key} delay={0.05 + i * 0.06} as="li">
              <LandingItem>
                <div className="flex items-start gap-3 rounded-xl border border-violet-400/8 bg-umbra-fog/20 p-4 transition-[border-color] duration-200 hover:border-violet-400/20">
                  <ChatCircleDots size={18} weight="duotone" className="mt-0.5 shrink-0 text-violet-300" />
                  <p className="text-pretty font-body text-sm leading-relaxed text-text-2">
                    {t(row.key)}
                  </p>
                </div>
              </LandingItem>
            </LandingReveal>
          ))}
        </ul>
      </section>

      {/* CLOSING */}
      <section className="relative mx-auto max-w-4xl px-6 py-24 text-center md:px-10">
        <LandingReveal>
          <LandingItem>
            <h2 className="text-balance font-display text-4xl italic text-text-1 md:text-6xl">
              {t('landing.closing_title')}
            </h2>
          </LandingItem>
          <LandingItem>
            <p className="mx-auto mt-6 max-w-xl text-pretty font-body text-base text-text-2 md:text-lg">
              {t('landing.closing_desc')}
            </p>
          </LandingItem>
          <LandingItem>
            <div className="mt-10">
              <Link href="/register">
                <Button variant="primary" size="lg" className="pl-7 pr-6">
                  <span>{t('landing.cta_start')}</span>
                  <ArrowRight size={18} weight="bold" />
                </Button>
              </Link>
            </div>
          </LandingItem>
        </LandingReveal>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-violet-400/10 px-6 py-12 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="font-display text-2xl text-text-1">Umbra</div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-4">
              {t('landing.footer_credits')}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-5 font-heading text-xs text-text-3">
            <Link href="/privacy" className="transition-colors duration-150 hover:text-text-1">
              Privacidad
            </Link>
            <Link href="/terms" className="transition-colors duration-150 hover:text-text-1">
              Términos
            </Link>
            <Link href="/login" className="transition-colors duration-150 hover:text-text-1">
              Ingresar
            </Link>
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-pretty font-body text-xs text-text-4">
          {t('landing.footer_not_therapy')}
        </p>
      </footer>
    </main>
  );
}
