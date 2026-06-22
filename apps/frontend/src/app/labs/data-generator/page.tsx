import { Metadata } from 'next';
import DataGeneratorClient from './DataGeneratorClient';

export const metadata: Metadata = {
  title: 'Generador de Datos | AIQUAA Labs',
  description:
    'Genera nombres, emails, teléfonos y datos aleatorios para testing. Herramienta gratuita para testers y QA.',
  keywords: [
    'generador de datos',
    'datos aleatorios',
    'fake data',
    'generador nombres',
    'generador emails',
    'QA',
    'testing',
    'AIQUAA',
    'herramienta gratuita',
    'datos de prueba',
  ],
  openGraph: {
    title: 'Generador de Datos | AIQUAA',
    description:
      'Genera nombres, emails, teléfonos y datos aleatorios para testing.',
    url: 'https://aiquaa.com/labs/data-generator',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Generador%20de%20Datos&subtitle=Nombres%2C%20emails%20y%20datos%20aleatorios%20para%20testing&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Generador de Datos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Datos | AIQUAA',
    description: 'Genera nombres, emails y datos aleatorios para testing.',
    images: [
      '/api/og?title=Generador%20de%20Datos&subtitle=Nombres%2C%20emails%20y%20datos%20aleatorios&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/data-generator',
  },
};

export default function DataGeneratorPage() {
  return <DataGeneratorClient />;
}
