import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/providers/auth-context';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { ThemeProvider } from '@/lib/providers/theme';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const SITE_NAME = 'Umbra';
const SITE_TAGLINE = 'Conocé tu sombra. Iluminá tu camino.';
const SITE_DESCRIPTION =
  'Plataforma de autoconocimiento que triangula Jung, Big Five y Positive Computing para generar perfiles profundos y narrativas personalizadas en español rioplatense.';

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
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c0a1a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="font-body bg-umbra-void text-text-1 antialiased">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="orb orb-violet left-[-20%] top-[-10%] h-[60vh] w-[60vh]" />
          <span className="orb orb-indigo right-[-15%] top-[20%] h-[50vh] w-[50vh]" />
          <span className="orb orb-violet bottom-[-25%] left-[20%] h-[55vh] w-[55vh]" />
        </div>
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
