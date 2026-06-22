import { Metadata } from 'next';
import GitClient from './GitClient';

export const metadata: Metadata = {
  title: 'Examen Técnico GIT | AIQUAA Labs',
  description:
    'Evalúa tus conocimientos de Git con 40 preguntas de fundamentos de control de versiones. Modo examen y entrenamiento.',
  keywords: [
    'GIT',
    'control de versiones',
    'git exam',
    'examen técnico',
    'QA',
    'testing',
    'AIQUAA',
    'herramienta gratuita',
    'git fundamentals',
    'repositorios',
  ],
  openGraph: {
    title: 'Examen Técnico GIT | AIQUAA',
    description:
      'Evalúa tus conocimientos de Git con 40 preguntas de fundamentos de control de versiones.',
    url: 'https://aiquaa.com/labs/git',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Examen%20Técnico%20GIT&subtitle=40%20preguntas%20de%20control%20de%20versiones&section=Labs',
        width: 1200,
        height: 630,
        alt: 'Examen Técnico GIT - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Examen Técnico GIT | AIQUAA',
    description:
      'Evalúa tus conocimientos de Git con 40 preguntas de fundamentos.',
    images: [
      '/api/og?title=Examen%20Técnico%20GIT&subtitle=40%20preguntas%20de%20control%20de%20versiones&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/git',
  },
};

export default function GitPage() {
  return <GitClient />;
}
