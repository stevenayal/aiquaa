import { Metadata } from 'next';
import PlaywrightPracticoClient from './PlaywrightPracticoClient';

export const metadata: Metadata = {
  title: 'Prueba práctica de Playwright | AIQUAA Labs',
  description:
    'Prueba técnica práctica de Playwright: automatizá login, catálogo, carrito y checkout de la Test App y entregá tus specs por Pull Request. Verificación automática vía GitHub API.',
  keywords: [
    'prueba técnica Playwright',
    'playwright práctico',
    'automatización E2E',
    'test automation',
    'pull request',
    'QA',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'Prueba práctica de Playwright | AIQUAA',
    description:
      'Automatizá 4 escenarios E2E contra la Test App y entregalos por PR. Corrección automática.',
    url: 'https://aiquaa.com/labs/playwright-practico',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Prueba%20pr%C3%A1ctica%20de%20Playwright&subtitle=Login%20%E2%86%92%20cat%C3%A1logo%20%E2%86%92%20carrito%20%E2%86%92%20checkout&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Prueba práctica de Playwright - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prueba práctica de Playwright | AIQUAA',
    description:
      'Automatizá 4 escenarios E2E contra la Test App y entregalos por PR. Corrección automática.',
    images: [
      '/api/og?title=Prueba%20pr%C3%A1ctica%20de%20Playwright&subtitle=Login%20%E2%86%92%20cat%C3%A1logo%20%E2%86%92%20carrito%20%E2%86%92%20checkout&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/playwright-practico',
  },
};

export default function PlaywrightPracticoPage() {
  return <PlaywrightPracticoClient />;
}
