import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/providers/auth-context';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { ThemeProvider } from '@/lib/providers/theme';
import './globals.css';
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans', display: 'swap' });

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
    <html lang="es" className={dmSans.variable}>
      {/* direction29378ec1 · Operate: light reflection journal. Original geometric U,
          DM Sans, grayscale, authored mirror geometry and finite state motion. No cosmic decoration,
          clinical or precision claims. Verify desktop and mobile snapshots. */}
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
