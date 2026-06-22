import { Metadata } from 'next';
import JsonValidatorClient from './JsonValidatorClient';

export const metadata: Metadata = {
  title: 'Validador de JSON | AIQUAA Labs',
  description:
    'Valida sintaxis JSON, formatea y detecta errores en tiempo real. Herramienta gratuita para testers y desarrolladores.',
  keywords: [
    'validador JSON',
    'JSON validator',
    'formatear JSON',
    'lint JSON',
    'QA',
    'testing',
    'AIQUAA',
    'herramienta gratuita',
    'validar JSON',
    'sintaxis JSON',
  ],
  openGraph: {
    title: 'Validador de JSON | AIQUAA',
    description:
      'Valida sintaxis JSON, formatea y detecta errores en tiempo real.',
    url: 'https://aiquaa.com/labs/json-validator',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Validador%20de%20JSON&subtitle=Valida%20sintaxis%20y%20formatea%20en%20tiempo%20real&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Validador de JSON - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Validador de JSON | AIQUAA',
    description: 'Valida sintaxis JSON, formatea y detecta errores.',
    images: [
      '/api/og?title=Validador%20de%20JSON&subtitle=Valida%20sintaxis%20y%20formatea&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/json-validator',
  },
};

export default function JsonValidatorPage() {
  return <JsonValidatorClient />;
}
