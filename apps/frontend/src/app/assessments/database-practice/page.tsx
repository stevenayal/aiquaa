import { Metadata } from 'next';
import { databasePracticeDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Bases de Datos — Práctica SQL | AIQUAA',
  description:
    'Challenge práctico con una mini base e-commerce: predecí resultados, detectá bugs y escribí SQL. Evalúa tus habilidades prácticas de SQL.',
  keywords: [
    'práctica SQL',
    'SQL queries',
    'consultas SQL',
    'e-commerce',
    'bases de datos',
    'QA',
    'testing',
    'AIQUAA',
    'evaluación práctica',
    'desafío SQL',
  ],
  openGraph: {
    title: 'Bases de Datos — Práctica SQL | AIQUAA',
    description:
      'Challenge práctico con una mini base e-commerce: predecí resultados, detectá bugs y escribí SQL.',
    url: 'https://aiquaa.com/assessments/database-practice',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Bases%20de%20Datos%20-%20Práctica%20SQL&subtitle=Challenge%20práctico%20con%20mini%20base%20e-commerce&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Bases de Datos Práctica SQL - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bases de Datos — Práctica SQL | AIQUAA',
    description: 'Challenge práctico con mini base e-commerce.',
    images: [
      '/api/og?title=Bases%20de%20Datos%20-%20Práctica%20SQL&subtitle=Challenge%20práctico&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/database-practice',
  },
};

export default function DatabasePracticePage() {
  const overview = {
    assessment: {
      id: 'static-database-practice',
      slug: databasePracticeDefinition.slug,
      title: databasePracticeDefinition.title,
      description: databasePracticeDefinition.description,
      level: databasePracticeDefinition.level,
      type: databasePracticeDefinition.type,
      duration_minutes: databasePracticeDefinition.duration_minutes,
      total_score: databasePracticeDefinition.total_score,
      is_active: databasePracticeDefinition.is_active,
      metadata: databasePracticeDefinition.metadata,
    },
    sections: databasePracticeDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-database-practice',
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
      startHref="/assessments/database-practice/start"
      evaluatesCopy="Lectura de esquemas y datos, predicción de resultados de queries, detección de bugs en SQL y escritura de consultas de validación."
      scoringCopy="Automático en los 3 niveles: predicción, veredicto correcto/bug con justificación y escritura SQL por keywords."
      resultCopy="Score total, score por nivel, fortalezas, debilidades y temas a reforzar."
    />
  );
}
