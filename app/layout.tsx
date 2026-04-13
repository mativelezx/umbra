import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/providers/auth-context';
import { ThemeProvider } from '@/lib/providers/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Umbra — Conocé tu sombra. Iluminá tu camino.',
  description:
    'Plataforma de autoconocimiento que triangula Jung, Big Five y Positive Computing para generar perfiles profundos y narrativas personalizadas.',
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
            <div className="relative z-10 min-h-screen">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
