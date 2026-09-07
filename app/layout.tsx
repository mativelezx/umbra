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

const DESIGN_CONTRACT = `<!--
THESIS: A continuous reflection workspace; the reader chooses the pace and the next action.
OWN-WORLD: lowercase umbra, Bricolage, graphite navigation, paper workspace, white reading surface, original vectors.
STORY: Answer, read one section, inspect sources, choose an optional activity, export or finish. Synthetic examples stay identified.
FIRST VIEWPORT: Compact dark navigation frames a clear task title, a large reflective illustration and a chapter reader. Experimental data and symbolic reading have separate tabs.
FORM: User-pinned Stoic principles; code-first direction29378ec1. Approved interior reconstruction September 6, 2026. Signature: a chosen chapter unfolds; an activity opens into a focused illustrated workspace. Reduced motion preserves all content and controls.
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
