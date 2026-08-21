import { Metadata } from 'next';
import { clase9CicdGithubActionsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Clase 9 — CI/CD con GitHub Actions | AIQUAA',
  description:
    'Prueba técnica teórica sobre CI/CD con GitHub Actions: pipeline, Delivery vs Deployment, triggers, jobs, steps, Variables y Secrets.',
  keywords: [
    'CI/CD',
    'GitHub Actions',
    'pipeline',
    'Continuous Delivery',
    'Continuous Deployment',
    'workflow',
    'triggers',
    'Secrets',
    'bootcamp',
    'AIQUAA',
  ],
  openGraph: {
    title: 'Clase 9 — CI/CD con GitHub Actions | AIQUAA',
    description:
      'Prueba técnica teórica sobre CI/CD con GitHub Actions: pipeline, Delivery vs Deployment, triggers, jobs, steps, Variables y Secrets.',
    url: 'https://aiquaa.com/assessments/clase9-cicd-github-actions',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Clase%209%20-%20CI%2FCD%20con%20GitHub%20Actions&subtitle=Pipelines%2C%20triggers%20y%20Secrets&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Clase 9 — CI/CD con GitHub Actions - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clase 9 — CI/CD con GitHub Actions | AIQUAA',
    description:
      'Prueba técnica teórica sobre CI/CD con GitHub Actions: pipeline, Delivery vs Deployment, triggers, jobs, steps, Variables y Secrets.',
    images: [
      '/api/og?title=Clase%209%20-%20CI%2FCD%20con%20GitHub%20Actions&subtitle=Pipelines%2C%20triggers%20y%20Secrets&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/clase9-cicd-github-actions',
  },
};

export default function Clase9CicdGithubActionsPage() {
  const overview = {
    assessment: {
      id: 'static-clase9-cicd-github-actions',
      slug: clase9CicdGithubActionsDefinition.slug,
      title: clase9CicdGithubActionsDefinition.title,
      description: clase9CicdGithubActionsDefinition.description,
      level: clase9CicdGithubActionsDefinition.level,
      type: clase9CicdGithubActionsDefinition.type,
      duration_minutes: clase9CicdGithubActionsDefinition.duration_minutes,
      total_score: clase9CicdGithubActionsDefinition.total_score,
      is_active: clase9CicdGithubActionsDefinition.is_active,
      metadata: clase9CicdGithubActionsDefinition.metadata,
    },
    sections: clase9CicdGithubActionsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-clase9-cicd-github-actions',
        slug: section.slug,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        max_score: section.max_score,
        metadata: section.metadata,
      })
    ),
  };

  return (
    <AssessmentWelcome
      overview={overview}
      startHref="/assessments/clase9-cicd-github-actions/start"
      evaluatesCopy={
        'El objetivo de CI/CD sobre los cambios de una API; los beneficios de la automatización; la práctica que inicia el ciclo de feedback rápido; la diferencia real entre Continuous Delivery y Continuous Deployment y los pasos que comparten; la secuencia completa del pipeline; los conceptos de Pipeline, Jobs, Steps, Triggers y Runners; la comparación entre GitHub Actions, Jenkins y Azure DevOps; los triggers y el orden de steps de un workflow; y la separación entre Variables y Secrets.'
      }
      scoringCopy="Automático en las 3 secciones: 9 preguntas de respuesta única y 1 de varias respuestas, con crédito parcial."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
