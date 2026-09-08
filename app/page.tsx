import Link from 'next/link';
import { ArrowRight, ArrowDown, ChatCircleText, FilePdf } from '@phosphor-icons/react/dist/ssr';
import { Brand } from '@/components/layout/Brand';
import { HeroExperience } from '@/components/landing/HeroExperience';
import { LandingEducation, LandingPossibilities } from '@/components/landing/EducationalSections';
import { ReflectionArt } from '@/components/ui/ReflectionArt';
import { t } from '@/lib/i18n/dict';
import styles from '@/components/landing/Landing.module.css';

/* Approved September 7: a personal story unfolding into a reading and an action.
 * Paper scene stays decorative; the interactive preview is explicitly synthetic.
 * Text and controls never wait for animation; pause/reduced motion preserve them.
 */
export default function LandingPage() {
  return (
    <main className={styles.landing}>
      <div className={styles.darkOpening}>
        <header className={styles.header}>
          <Brand />
          <nav aria-label="Navegación principal" className={styles.headerNav}>
            <Link href="#como" className={styles.headerAbout}>Cómo funciona</Link>
            <Link href="/login" className={styles.loginLink}>Ingresar <ArrowRight size={17} aria-hidden="true" /></Link>
          </nav>
        </header>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <h1 id="landing-title">Tu cabeza,{' '}<br /><span className={styles.titleEnding}>en palabras.<svg viewBox="0 0 520 34" fill="none" aria-hidden="true" focusable="false"><path pathLength="100" d="M5 22C132 3 358 1 510 11M21 30C170 15 361 15 478 21" /></svg></span></h1>
            <p className={styles.heroDescription}>Respondé preguntas sobre tus decisiones y hábitos. Recibí una lectura de tus respuestas y actividades para probar en tu día.</p>
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.primaryAction}>Empezar a conocerme <ArrowRight size={21} aria-hidden="true" /></Link>
              <Link href="#como" className={styles.howLink}>Ver cómo funciona <ArrowDown size={17} aria-hidden="true" /></Link>
            </div>
            {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <Link href="/onboarding" className={styles.demoLink}>Recorrer el ejemplo local <ArrowRight size={16} aria-hidden="true" /></Link>}
            <p className={styles.heroLimit}>Para personas adultas. Usa IA y puede equivocarse. Es un proyecto académico, no terapia ni diagnóstico.</p>
          </div>
          <HeroExperience />
        </section>
        <div className={styles.openingFooter}>
          <p>No necesitás saber de psicología para empezar.</p>
          <div className={styles.companionLinks}>
            <span>Al crear tu cuenta</span>
            <Link href="/chat"><ChatCircleText size={18} aria-hidden="true" /> Chat</Link>
            <Link href="/export"><FilePdf size={18} aria-hidden="true" /> Informe PDF</Link>
          </div>
        </div>
      </div>

      <LandingPossibilities />

      <section id="como" className={styles.howSection}>
        <div className={styles.sectionHeading}>
          <h2>Vos contás. Umbra te ayuda a mirar.</h2>
          <p>Primero compartís tu experiencia. Después elegís qué ideas te sirven y qué querés probar.</p>
        </div>
        <ol className={styles.steps}>
          {[
            ['Contá lo que te pasa', 'Creá tu cuenta y revisá el uso de tus datos. Respondé preguntas sobre tus decisiones, relaciones e intereses. También podés traer un texto de ChatGPT y completarlo con tus palabras.'],
            ['Leé y compará con tu experiencia', 'Recibís una lectura de IA basada en tus respuestas. Podés sumar un cuestionario opcional de 30 afirmaciones para ver cómo te describís en cinco aspectos.'],
            ['Probá un paso concreto', 'Elegí una actividad de escritura, atención o conversación. Marcá tus avances, seguí pensando en el chat o descargá tu lectura en PDF.'],
          ].map(([title, body], index) => (
            <li key={title}>
              <span className={styles.stepNumber}>Paso {index + 1}</span>
              <ReflectionArt variant={(['dialogue', 'mirror', 'steps'] as const)[index]} className={styles.stepArt} />
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <LandingEducation isDemo={process.env.NEXT_PUBLIC_DEMO_MODE === 'true'} />

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <Brand />
          <nav aria-label="Información"><Link href="/privacy">Privacidad</Link><Link href="/terms">Términos</Link><Link href="/login">Ingresar</Link></nav>
        </div>
        <p className={styles.footerLimit}>{t('landing.footer_not_therapy')}</p>
        <p className={styles.academicCredit}>Umbra · Trabajo Final de Graduación · Universidad Siglo 21</p>
      </footer>
    </main>
  );
}
