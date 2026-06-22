import { Metadata } from 'next';
import ISTQBClient from './ISTQBClient';

export const metadata: Metadata = {
  title: 'Simulador ISTQB CTFL v4.0 | AIQUAA Labs',
  description:
    'Examen de práctica ISTQB CTFL v4.0 con 40 preguntas oficiales. Modo examen y entrenamiento con feedback inmediato.',
  keywords: [
    'ISTQB',
    'CTFL',
    'certificación ISTQB',
    'simulador ISTQB',
    'examen ISTQB',
    'QA',
    'testing',
    'AIQUAA',
    'herramienta gratuita',
    'simulacro CTFL',
    'foundation level',
  ],
  openGraph: {
    title: 'Simulador ISTQB CTFL v4.0 | AIQUAA',
    description:
      'Examen de práctica ISTQB CTFL v4.0 con 40 preguntas oficiales. Modo examen y entrenamiento.',
    url: 'https://aiquaa.com/labs/istqb',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Simulador%20ISTQB%20CTFL%20v4.0&subtitle=40%20preguntas%20oficiales%20con%20modo%20examen%20y%20entrenamiento&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Simulador ISTQB CTFL v4.0 - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador ISTQB CTFL v4.0 | AIQUAA',
    description:
      'Examen de práctica ISTQB CTFL v4.0 con 40 preguntas oficiales.',
    images: [
      '/api/og?title=Simulador%20ISTQB%20CTFL%20v4.0&subtitle=40%20preguntas%20oficiales&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/istqb',
  },
};

export default function ISTQBPage() {
  return <ISTQBClient />;
}
