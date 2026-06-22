import { Metadata } from 'next';
import YamlValidatorClient from './YamlValidatorClient';

export const metadata: Metadata = {
  title: 'Validador de YAML | AIQUAA Labs',
  description:
    'Valida sintaxis YAML, formatea código y convierte entre YAML y JSON. Herramienta gratuita para testers y desarrolladores.',
  keywords: [
    'validador YAML',
    'YAML validator',
    'formatear YAML',
    'YAML a JSON',
    'QA',
    'testing',
    'AIQUAA',
    'herramienta gratuita',
    'sintaxis YAML',
    'convertir YAML',
  ],
  openGraph: {
    title: 'Validador de YAML | AIQUAA',
    description:
      'Valida sintaxis YAML, formatea código y convierte entre YAML y JSON.',
    url: 'https://aiquaa.com/labs/yaml-validator',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Validador%20de%20YAML&subtitle=Valida%20sintaxis%20y%20convierte%20a%20JSON&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Validador de YAML - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Validador de YAML | AIQUAA',
    description: 'Valida sintaxis YAML y convierte entre YAML y JSON.',
    images: [
      '/api/og?title=Validador%20de%20YAML&subtitle=Valida%20sintaxis%20y%20convierte&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/yaml-validator',
  },
};

export default function YamlValidatorPage() {
  return <YamlValidatorClient />;
}
