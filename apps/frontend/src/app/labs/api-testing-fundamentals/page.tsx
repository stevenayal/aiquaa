import { Metadata } from 'next';
import ApiTestingFundamentalsClient from '@/app/assessments/api-testing-fundamentals/page';

export const metadata: Metadata = {
  title: 'API Testing — Fundamentos | AIQUAA Labs',
  description:
    'Examen teórico de API Testing: conceptos de API, lectura de documentación, diseño de casos y análisis de respuestas en 5 niveles progresivos.',
  keywords: [
    'API Testing',
    'testing de APIs',
    'REST API',
    'SOAP',
    'GraphQL',
    'QA',
    'testing',
    'AIQUAA',
    'herramienta gratuita',
    'fundamentos API',
  ],
  openGraph: {
    title: 'API Testing — Fundamentos | AIQUAA',
    description:
      'Examen teórico de API Testing en 5 niveles progresivos con corrección automática.',
    url: 'https://aiquaa.com/labs/api-testing-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=API%20Testing%20Fundamentos&subtitle=Examen%20teórico%20en%205%20niveles%20progresivos&section=Labs',
        width: 1200,
        height: 630,
        alt: 'API Testing Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Testing — Fundamentos | AIQUAA',
    description: 'Examen teórico de API Testing en 5 niveles progresivos.',
    images: [
      '/api/og?title=API%20Testing%20Fundamentos&subtitle=Examen%20teórico%20en%205%20niveles&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/api-testing-fundamentals',
  },
};

export default function LabsApiTestingFundamentalsPage() {
  return <ApiTestingFundamentalsClient />;
}
