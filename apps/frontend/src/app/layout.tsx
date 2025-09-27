import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '../components/ErrorBoundary';
import Layout from '../components/Layout';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NextAuthProvider } from '../contexts/NextAuthContext';
import { initializeSentry } from '../lib/observability';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AIQUAA - Herramientas de QA',
  description: 'Plataforma de herramientas de QA y testing',
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
            <ThemeProvider>
              <NextAuthProvider>
                <AuthProvider>
                  <Layout>
                    {children}
                  </Layout>
                </AuthProvider>
              </NextAuthProvider>
            </ThemeProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
