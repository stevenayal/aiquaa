import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '../components/ErrorBoundary';
import Layout from '../components/Layout';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NextAuthProvider } from '../contexts/NextAuthContext';
import { AuthProvider } from '../contexts/AuthContext';
import { initializeSentry } from '../lib/observability';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

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
    'Comunidad y herramientas QA en español para Paraguay y LATAM. Testing de software, pruebas técnicas, recursos ISTQB y JMeter. Totalmente gratis y open source.',
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
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    url: '/',
    siteName: 'AIQUAA',
    title: 'AIQUAA - Comunidad y Herramientas de QA en Paraguay',
    description: 'Comunidad y herramientas QA en español. Testing, pruebas técnicas, ISTQB y JMeter.',
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
    description: 'Comunidad y herramientas QA en español para Paraguay y LATAM',
    images: ['/api/og?title=AIQUAA&subtitle=Comunidad%20QA%20en%20español&section=Home'],
  },
};

// Initialize Sentry
if (typeof window !== 'undefined') {
  initializeSentry();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <LanguageProvider>
              <ThemeProvider>
                <NextAuthProvider>
                  <AuthProvider>
                    <Layout>
                      {children}
                    </Layout>
                  </AuthProvider>
                </NextAuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
