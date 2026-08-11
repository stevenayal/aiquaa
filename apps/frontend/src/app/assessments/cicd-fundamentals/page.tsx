import { Metadata } from 'next';
import { cicdFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'CI/CD — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica para bootcamp de desarrollo: pipelines de integración continua (restore/build/test), despliegue continuo automatizado y buenas prácticas DevOps de versionado.',
  keywords: [
    'CI/CD',
    'integración continua',
    'despliegue continuo',
    'pipeline',
    'Conventional Commits',
    'buenas prácticas DevOps',
    'desarrollo backend',
    'bootcamp',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'CI/CD — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre pipelines de CI, despliegue continuo y buenas prácticas de versionado.',
    url: 'https://aiquaa.com/assessments/cicd-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=CI%2FCD%20-%20Fundamentos&subtitle=Pipelines%2C%20deploy%20y%20buenas%20pr%C3%A1cticas&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'CI/CD Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CI/CD — Fundamentos | AIQUAA',
    description:
      'Prueba técnica sobre pipelines de CI, despliegue continuo y buenas prácticas DevOps.',
    images: [
      '/api/og?title=CI%2FCD%20-%20Fundamentos&subtitle=Pipelines%2C%20deploy%20y%20buenas%20pr%C3%A1cticas&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/cicd-fundamentals',
  },
};

export default function CicdFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-cicd-fundamentals',
      slug: cicdFundamentalsDefinition.slug,
      title: cicdFundamentalsDefinition.title,
      description: cicdFundamentalsDefinition.description,
      level: cicdFundamentalsDefinition.level,
      type: cicdFundamentalsDefinition.type,
      duration_minutes: cicdFundamentalsDefinition.duration_minutes,
      total_score: cicdFundamentalsDefinition.total_score,
      is_active: cicdFundamentalsDefinition.is_active,
      metadata: cicdFundamentalsDefinition.metadata,
    },
    sections: cicdFundamentalsDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-cicd-fundamentals',
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
      startHref="/assessments/cicd-fundamentals/start"
      evaluatesCopy="Integración continua: restore, build y tests disparados automáticamente en cada cambio; despliegue continuo con artefactos versionados, idempotencia y rollback; buenas prácticas de versionado (Conventional Commits, .gitignore) y documentación mínima del repositorio."
      scoringCopy="Automático en las 3 secciones: selección múltiple y verdadero/falso."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
