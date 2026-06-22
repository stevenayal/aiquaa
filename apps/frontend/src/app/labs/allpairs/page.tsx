import { Metadata } from 'next';
import AllPairsClient from './AllPairsClient';

export const metadata: Metadata = {
  title: 'Generador All Pairs | AIQUAA Labs',
  description:
    'Genera combinaciones de pruebas pairwise para reducir casos de prueba manteniendo la cobertura. Técnica 2-way coverage.',
  keywords: [
    'All Pairs',
    'pairwise testing',
    'pruebas pairwise',
    'diseño de casos de prueba',
    'combinaciones',
    'cobertura',
    'QA',
    'testing',
    'AIQUAA',
    'herramienta gratuita',
  ],
  openGraph: {
    title: 'Generador All Pairs | AIQUAA',
    description:
      'Genera combinaciones de pruebas pairwise para reducir casos de prueba manteniendo la cobertura.',
    url: 'https://aiquaa.com/labs/allpairs',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Generador%20All%20Pairs&subtitle=Combinaciones%20pairwise%20para%20diseño%20de%20pruebas&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Generador All Pairs - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador All Pairs | AIQUAA',
    description:
      'Genera combinaciones de pruebas pairwise para reducir casos de prueba.',
    images: [
      '/api/og?title=Generador%20All%20Pairs&subtitle=Combinaciones%20pairwise&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/allpairs',
  },
};

export default function AllPairsPage() {
  return <AllPairsClient />;
}
