import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { AuthProvider } from '@/lib/providers/auth-context';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { ThemeProvider } from '@/lib/providers/theme';
import './globals.css';
import './art-motion.css';
import './reading-experience.css';
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: 'variable', axes: ['opsz'], variable: '--font-bricolage', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const SITE_NAME = 'Umbra';
const SITE_TAGLINE = 'Tu cabeza, en palabras.';
const SITE_DESCRIPTION =
  'Respondé preguntas sobre tus decisiones y hábitos. Recibí una lectura de tus respuestas y actividades para probar en tu día. Prototipo académico con IA; no es terapia.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'autoconocimiento',
    'Jung',
    'Big Five',
    'Positive Computing',
    'funciones cognitivas',
    'arquetipos',
    'psicología',
    'TFG',
  ],
  authors: [{ name: 'Umbra — TFG Ingeniería en Software, Universidad Siglo 21' }],
  creator: 'Umbra',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#f7f7f4',
  width: 'device-width',
  initialScale: 1,
};

const DESIGN_CONTRACT = `<!--
THESIS: A continuous reflection workspace; the reader chooses the pace and the next action.
OWN-WORLD: Young Serif lowercase umbra lettering (SIL OFL, vector outlines) beside a two-part aperture symbol; Bricolage for interface text, graphite navigation, paper workspace, white reading surface, original vectors.
STORY: Answer, read one section, inspect sources, choose an optional activity, export or finish. Synthetic examples stay identified.
FIRST VIEWPORT: Graphite navigation, task heading and an ink-black personal opening. Three moving sheets connect story, interpretation and action beside the reading button; playback is controllable. Chapter index and symbolic versus experimental sources remain distinct.
FORM: User-pinned Stoic, code-first, extended September 7, 2026. Legacy identifier29378ec1 is not a corroborated random seed or visual approval. Signature: eight-second paper unfolding with pause/offscreen/reduced-motion control, finite chapter gestures and a 1240 ms full-viewport brand interlude. Scroll bookmark follows actual position. Personal PDF: black openings, explained symbols, everyday examples and reflection space on white paper, without an olive frame; saved content retained.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={bricolage.variable}>
      <body data-design-direction="29378ec1" className="font-body bg-umbra-void text-text-1 antialiased">
        <template dangerouslySetInnerHTML={{ __html: DESIGN_CONTRACT }} />
        <ThemeProvider>
          <AuthProvider>
            <MotionProvider>
              <div className="relative z-10 min-h-screen">{children}</div>
            </MotionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
