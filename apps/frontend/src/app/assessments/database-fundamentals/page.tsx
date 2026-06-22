import { Metadata } from 'next';
import { databaseFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Bases de Datos — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica sobre modelo relacional, SQL básico, joins, agregaciones y constraints. Evalúa tus conocimientos de bases de datos.',
  keywords: [
    'bases de datos',
    'SQL',
    'modelo relacional',
    'JOINs',
    'agregaciones',
    'constraints',
    'QA',
    'testing',
    'AIQUAA',
    'evaluación técnica',
    'fundamentos SQL',
  ],
  openGraph: {
    title: 'Bases de Datos — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre modelo relacional, SQL básico, joins, agregaciones y constraints.',
    url: 'https://aiquaa.com/assessments/database-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Bases%20de%20Datos%20-%20Fundamentos&subtitle=Evaluación%20de%20SQL%20y%20modelo%20relacional&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Bases de Datos Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bases de Datos — Fundamentos | AIQUAA',
    description: 'Prueba técnica sobre modelo relacional y SQL básico.',
    images: [
      '/api/og?title=Bases%20de%20Datos%20-%20Fundamentos&subtitle=Evaluación%20de%20SQL&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/database-fundamentals',
  },
};

export default function DatabaseFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-database-fundamentals',
      slug: databaseFundamentalsDefinition.slug,
      title: databaseFundamentalsDefinition.title,
      description: databaseFundamentalsDefinition.description,
      level: databaseFundamentalsDefinition.level,
      type: databaseFundamentalsDefinition.type,
      duration_minutes: databaseFundamentalsDefinition.duration_minutes,
      total_score: databaseFundamentalsDefinition.total_score,
      is_active: databaseFundamentalsDefinition.is_active,
      metadata: databaseFundamentalsDefinition.metadata,
    },
    sections: databaseFundamentalsDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-database-fundamentals',
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
      startHref="/assessments/database-fundamentals/start"
      evaluatesCopy="Modelo relacional, claves primarias y foráneas, tipos de datos, consultas SELECT, JOINs, agregaciones y constraints."
      scoringCopy="Automático en los 3 niveles: selección múltiple, verdadero/falso y respuestas cortas por keywords."
      resultCopy="Score total, score por nivel, fortalezas, debilidades y temas a reforzar."
    />
  );
}
