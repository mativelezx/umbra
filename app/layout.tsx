import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { AuthProvider } from '@/lib/providers/auth-context';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { ThemeProvider } from '@/lib/providers/theme';
import './globals.css';
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: 'variable', axes: ['opsz'], variable: '--font-bricolage', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const SITE_NAME = 'Umbra';
const SITE_TAGLINE = 'Un espacio para mirarte con atención.';
const SITE_DESCRIPTION =
  'Un espacio de autoconocimiento con Big Five experimental, interpretación de IA inspirada en Jung y actividades de reflexión. Proyecto académico en español.';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={bricolage.variable}>
      {/* THESIS: A personal reflection journal with distinct stages, not a clinical scorecard.
          OWN-WORLD: lowercase umbra, Bricolage Grotesque, graphite and ivory, original ink illustrations;
          black primary surfaces, white reading panels, compact navigation and grouped controls.
          STORY: Answer, explore an experimental reading, choose an activity; chat and PDF complement it.
          FIRST VIEWPORT: Dark editorial hero, large left heading and entry action, fluid contour field
          around a white three-state illustrative panel. Interiors remain light and task-centered.
          FORM: User-pinned Stoic patterns override exploration direction29378ec1; code-first approved.
          Signature: switch the example between questions, reading and activities; ambient motion pauses
          manually, offscreen and in hidden documents, and remains static with reduced motion.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
          the verdict, DESIGN.md, and every shipping raster carrying its provenance */}
      <body data-design-direction="29378ec1" className="font-body bg-umbra-void text-text-1 antialiased">
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
