import { Metadata } from 'next';
import { dockerFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Docker — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica para bootcamp de desarrollo: Dockerfiles multistage e imágenes livianas, variables de entorno sin hardcode, y ejecución/reproducibilidad local de contenedores.',
  keywords: [
    'Docker',
    'Dockerfile',
    'multistage build',
    'contenedores',
    'variables de entorno',
    'docker-compose',
    'desarrollo backend',
    'DevOps',
    'bootcamp',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'Docker — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre Dockerfiles, variables de entorno y ejecución/reproducibilidad local de contenedores.',
    url: 'https://aiquaa.com/assessments/docker-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Docker%20-%20Fundamentos&subtitle=Dockerfile%2C%20env%20vars%20y%20ejecuci%C3%B3n%20local&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Docker Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Docker — Fundamentos | AIQUAA',
    description:
      'Prueba técnica sobre Dockerfiles, variables de entorno y ejecución local de contenedores.',
    images: [
      '/api/og?title=Docker%20-%20Fundamentos&subtitle=Dockerfile%2C%20env%20vars%20y%20ejecuci%C3%B3n%20local&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/docker-fundamentals',
  },
};

export default function DockerFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-docker-fundamentals',
      slug: dockerFundamentalsDefinition.slug,
      title: dockerFundamentalsDefinition.title,
      description: dockerFundamentalsDefinition.description,
      level: dockerFundamentalsDefinition.level,
      type: dockerFundamentalsDefinition.type,
      duration_minutes: dockerFundamentalsDefinition.duration_minutes,
      total_score: dockerFundamentalsDefinition.total_score,
      is_active: dockerFundamentalsDefinition.is_active,
      metadata: dockerFundamentalsDefinition.metadata,
    },
    sections: dockerFundamentalsDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-docker-fundamentals',
      slug: section.slug,
      title: section.title,
      description: section.description,
      order_index: section.order_index,
      max_score: section.max_score,
      metadata: section.metadata,
    })),
  };

  return (
    <AssessmentWelcome
      overview={overview}
      startHref="/assessments/docker-fundamentals/start"
      evaluatesCopy="Dockerfiles multistage e imágenes livianas, orden de capas y .dockerignore; diferencia entre ARG y ENV y por qué no hardcodear configuración sensible; ejecución local, mapeo de puertos, healthchecks, docker-compose y comandos básicos de debugging."
      scoringCopy="Automático en las 3 secciones: selección múltiple y verdadero/falso."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
