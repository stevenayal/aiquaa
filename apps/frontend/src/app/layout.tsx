import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '../components/ErrorBoundary';
import Layout from '../components/Layout';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
// import { initializeSentry } from '../lib/observability'; // Temporarily disabled for Server Components
import Providers from './providers';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

/**
 * Metadatos generales para AIQUAA
 * La imagen OG se genera dinámicamente desde /api/og
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aiquaa.com'),
  title: {
    default: 'AIQUAA - Comunidad y Herramientas de QA en Paraguay',
    template: '%s | AIQUAA',
  },
  description:
    'Plataforma freemium de QA con IA para LATAM. Simulador ISTQB, generador de casos con IA y automatización con Playwright. Hecho en Paraguay.',
  keywords: [
    'QA',
    'testing',
    'calidad de software',
    'Paraguay',
    'ISTQB',
    'JMeter',
    'automatización',
    'pruebas técnicas',
  ],
  authors: [{ name: 'AIQUAA' }],
  creator: 'AIQUAA',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/favicon-512.png',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    url: '/',
    siteName: 'AIQUAA',
    title: 'AIQUAA - Comunidad y Herramientas de QA en Paraguay',
    description: 'Plataforma freemium de QA con IA para LATAM. Simulador ISTQB, generador de casos con IA y automatización con Playwright. Hecho en Paraguay.',
    images: [
      {
        url: '/api/og?title=AIQUAA&subtitle=Comunidad%20y%20herramientas%20QA%20en%20español&section=Home',
        width: 1200,
        height: 630,
        alt: 'AIQUAA - Comunidad QA Paraguay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIQUAA - Comunidad y Herramientas de QA',
    description: 'Plataforma freemium de QA con IA para LATAM. Simulador ISTQB, generador de casos con IA y automatización con Playwright. Hecho en Paraguay.',
    images: ['/api/og?title=AIQUAA&subtitle=Comunidad%20QA%20en%20español&section=Home'],
  },
};

// Initialize Sentry - Temporarily disabled for Server Components compatibility
// if (typeof window !== 'undefined') {
//   initializeSentry();
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={sora.className}>
        <ErrorBoundary>
          <Providers>
            <LanguageProvider>
              <ThemeProvider>
                <Layout>
                  {children}
                </Layout>
              </ThemeProvider>
            </LanguageProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
