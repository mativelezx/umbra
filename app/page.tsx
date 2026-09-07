import Link from 'next/link';
import { ArrowRight, ArrowDown, ChatCircleText, FilePdf } from '@phosphor-icons/react/dist/ssr';
import { Brand } from '@/components/layout/Brand';
import { HeroExperience } from '@/components/landing/HeroExperience';
import { ReflectionArt } from '@/components/ui/ReflectionArt';
import { t } from '@/lib/i18n/dict';
import styles from '@/components/landing/Landing.module.css';

/* Direction 29378ec1, user-pinned revision: dark editorial current / code-first.
 * One fluid contour field carries questions into a reading and an activity.
 * Desktop: large left title/white CTA, a working paper example on the right.
 * Mobile: title and CTA first, then the full example. No hidden content entrance.
 * 16s reversible curve morph; pause, offscreen/hidden stop, static reduced motion.
 * Parent owns browser review, final verdict and design documentation.
 */
export default function LandingPage() {
  return (
    <main className={styles.landing}>
      <div className={styles.darkOpening}>
        <header className={styles.header}>
          <Brand />
          <nav aria-label="Navegación principal" className={styles.headerNav}>
            <Link href="#pilares" className={styles.headerAbout}>Sobre Umbra</Link>
            <Link href="/login" className={styles.loginLink}>Ingresar <ArrowRight size={17} aria-hidden="true" /></Link>
          </nav>
        </header>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <h1 id="landing-title">Un espacio para mirarte con atención.</h1>
            <p className={styles.heroDescription}>Respondé preguntas sobre vos, explorá una lectura experimental y elegí una actividad para reflexionar. A tu ritmo.</p>
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.primaryAction}>Empezar <ArrowRight size={21} aria-hidden="true" /></Link>
              <Link href="#como" className={styles.howLink}>Cómo funciona <ArrowDown size={17} aria-hidden="true" /></Link>
            </div>
            {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <Link href="/onboarding" className={styles.demoLink}>Recorrer el ejemplo local <ArrowRight size={16} aria-hidden="true" /></Link>}
            <p className={styles.heroLimit}>Un proyecto académico de autoconocimiento. No reemplaza el acompañamiento profesional.</p>
          </div>
          <HeroExperience />
        </section>
        <div className={styles.openingFooter}>
          <p>Preguntarte. Leer. Volver a vos.</p>
          <div className={styles.companionLinks}>
            <span>También en Umbra</span>
            <Link href="/chat"><ChatCircleText size={18} aria-hidden="true" /> Chat</Link>
            <Link href="/export"><FilePdf size={18} aria-hidden="true" /> Informe PDF</Link>
          </div>
        </div>
      </div>

      <section id="como" className={styles.howSection}>
        <div className={styles.sectionHeading}>
          <h2>De tus respuestas a una próxima acción.</h2>
          <p>Un recorrido para explorar lo que pensás, sin apurarte a llegar a una conclusión.</p>
        </div>
        <ol className={styles.steps}>
          {[
            ['Respondé', 'Compartí tus respuestas después de revisar el consentimiento. Elegí conversar o traer un texto que ya tengas.'],
            ['Explorá tu lectura', 'Leé el resultado con su origen y sus límites: estimación experimental de Big Five e interpretación de IA inspirada en Jung.'],
            ['Elegí una actividad', 'Encontrá una sugerencia para reflexionar y marcá los pasos que vas haciendo. También podés descargar tu informe.'],
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

      <section id="pilares" className={styles.pillarsSection}>
        <div className={styles.pillarsIntro}>
          <h2>Una lectura para pensar.<br />Con sus límites a la vista.</h2>
          <p>Las partes de Umbra tienen distintos orígenes. Conocerlos también es parte de la experiencia.</p>
          <Link href="/privacy">Leer la política de privacidad <ArrowRight size={19} aria-hidden="true" /></Link>
        </div>
        <div className={styles.pillarsList}>
          {[
            ['Big Five experimental', 'El módulo de aprendizaje automático estima dimensiones a partir de texto. No es un test validado de precisión individual; las dimensiones sin respaldo quedan sin cifra.'],
            ['Jung como interpretación', 'La IA propone una lectura simbólica, no una etiqueta definitiva sobre quién sos. Puede equivocarse.'],
            ['Actividades de reflexión', 'Sugerencias vinculadas con Positive Computing para explorar lo que te resulte útil, sin promesas de resultados.'],
            ['Tus datos y tus decisiones', 'Podés consultar los controles de acceso, exportación y eliminación de datos. Revisá el alcance en la política de privacidad.'],
          ].map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

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
