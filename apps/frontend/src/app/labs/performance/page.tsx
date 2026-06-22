import { Metadata } from 'next';
import PerformanceClient from './PerformanceClient';

export const metadata: Metadata = {
  title: 'Examen Performance Testing | AIQUAA Labs',
  description:
    'Examen técnico de 27 preguntas sobre fundamentos, métricas y herramientas de pruebas de rendimiento. Modo examen y entrenamiento.',
  keywords: [
    'Performance Testing',
    'pruebas de rendimiento',
    'testing de carga',
    'load testing',
    'stress testing',
    'JMeter',
    'Gatling',
    'k6',
    'QA',
    'AIQUAA',
    'herramienta gratuita',
  ],
  openGraph: {
    title: 'Examen Performance Testing | AIQUAA',
    description:
      'Evaluación técnica de 27 preguntas sobre fundamentos, métricas y herramientas de pruebas de rendimiento.',
    url: 'https://aiquaa.com/labs/performance',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Examen%20Performance%20Testing&subtitle=27%20preguntas%20sobre%20métricas%20y%20herramientas&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Examen Performance Testing - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Examen Performance Testing | AIQUAA',
    description:
      'Evaluación técnica de 27 preguntas sobre fundamentos, métricas y herramientas.',
    images: [
      '/api/og?title=Examen%20Performance%20Testing&subtitle=27%20preguntas%20sobre%20métricas&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/performance',
  },
};

export default function PerformancePage() {
  return <PerformanceClient />;
}
