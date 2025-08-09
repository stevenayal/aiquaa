import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Layout from '@/components/Layout';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const sora = Sora({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AIQUAA - Inteligencia Artificial y Desarrollo',
  description: 'Plataforma de inteligencia artificial y desarrollo con herramientas, laboratorios y comunidad.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={sora.className}>
        <ThemeProvider>
          <GoogleAnalytics />
          <Layout>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
