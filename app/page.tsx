import Link from 'next/link';
import { Brain, Compass, Sparkle, Path } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n/dict';

const PILLARS = [
  {
    Icon: Brain,
    titleKey: 'landing.pillar_rigor_title',
    descKey: 'landing.pillar_rigor_desc',
  },
  {
    Icon: Compass,
    titleKey: 'landing.pillar_jung_title',
    descKey: 'landing.pillar_jung_desc',
  },
  {
    Icon: Sparkle,
    titleKey: 'landing.pillar_pc_title',
    descKey: 'landing.pillar_pc_desc',
  },
  {
    Icon: Path,
    titleKey: 'landing.pillar_ar_title',
    descKey: 'landing.pillar_ar_desc',
  },
] as const;

export default function LandingPage() {
  return (
    <main className="relative">
      {/* HERO — NO 3-column grid, asymmetric layout to avoid AI slop */}
      <section className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col items-start justify-center px-6 py-24 md:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-1.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(180,102,255,0.8)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-2">
            Umbra — autoconocimiento con rigor
          </span>
        </div>

        <h1 className="mt-8 font-display text-5xl leading-[1.05] text-text-1 md:text-7xl lg:text-[8rem]">
          {t('landing.hero_title_1')}
          <br />
          <span className="italic text-violet-300">{t('landing.hero_title_2')}</span>
        </h1>

        <p className="mt-8 max-w-2xl font-body text-lg text-text-2 md:text-xl">
          {t('landing.hero_subtitle')}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/register">
            <Button variant="primary" size="lg">
              {t('landing.cta_start')} →
            </Button>
          </Link>
          <Link href="#pilares">
            <Button variant="ghost" size="lg">
              {t('landing.cta_learn')}
            </Button>
          </Link>
        </div>

        <p className="mt-20 max-w-xl font-body text-sm text-text-3">
          {t('landing.footer_not_therapy')}
        </p>
      </section>

      {/* PILARES — 2x2 grid (NOT 3 column), asymmetric card layouts */}
      <section id="pilares" className="relative mx-auto max-w-6xl px-6 py-24 md:px-10">
        <div className="mb-16 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
            Cuatro pilares
          </p>
          <h2 className="mt-4 font-display text-4xl italic text-text-1 md:text-5xl">
            En qué se diferencia Umbra
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PILLARS.map(({ Icon, titleKey, descKey }, i) => (
            <article
              key={titleKey}
              className={`glass group relative rounded-lg p-8 transition-all duration-300 ${
                i % 2 === 0 ? 'md:translate-y-4' : ''
              }`}
            >
              <Icon
                size={28}
                weight="regular"
                className="text-violet-300 transition-transform duration-300 group-hover:scale-110"
              />
              <h3 className="mt-5 font-display text-2xl text-text-1">{t(titleKey)}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-text-2">
                {t(descKey)}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="relative mx-auto max-w-4xl px-6 py-24 text-center md:px-10">
        <h2 className="font-display text-4xl italic text-text-1 md:text-6xl">
          ¿Listo para mirar hacia adentro?
        </h2>
        <div className="mt-10">
          <Link href="/register">
            <Button variant="primary" size="lg">
              {t('landing.cta_start')} →
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-violet-400/10 px-6 py-12 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="font-display text-2xl text-text-1">Umbra</div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-4">
              TFG Ingeniería en Software · Universidad Siglo 21
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-5 font-heading text-xs text-text-3">
            <Link href="/privacy" className="hover:text-text-1">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-text-1">
              Términos
            </Link>
            <Link href="/login" className="hover:text-text-1">
              Ingresar
            </Link>
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-6xl font-body text-xs text-text-4">
          {t('landing.footer_not_therapy')}
        </p>
      </footer>
    </main>
  );
}
