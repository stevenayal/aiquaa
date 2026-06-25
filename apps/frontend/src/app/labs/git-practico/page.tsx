import { Metadata } from 'next';
import GitPracticoClient from './GitPracticoClient';

export const metadata: Metadata = {
  title: 'Prueba práctica de GitHub | AIQUAA Labs',
  description:
    'Prueba técnica práctica de GitHub: creá un issue, una rama, subí una carpeta y abrí un Pull Request que cierre el issue. Verificación automática vía GitHub API.',
  keywords: [
    'prueba técnica GitHub',
    'git práctico',
    'pull request',
    'issue',
    'branch',
    'QA',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'Prueba práctica de GitHub | AIQUAA',
    description:
      'Issue → rama → carpeta → Pull Request que cierra el issue. Corrección automática.',
    url: 'https://aiquaa.com/labs/git-practico',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Prueba%20pr%C3%A1ctica%20de%20GitHub&subtitle=Issue%20%E2%86%92%20rama%20%E2%86%92%20PR&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Prueba práctica de GitHub - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prueba práctica de GitHub | AIQUAA',
    description:
      'Issue → rama → carpeta → Pull Request. Corrección automática.',
    images: [
      '/api/og?title=Prueba%20pr%C3%A1ctica%20de%20GitHub&subtitle=Issue%20%E2%86%92%20rama%20%E2%86%92%20PR&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/git-practico',
  },
};

export default function GitPracticoPage() {
  return <GitPracticoClient />;
}
