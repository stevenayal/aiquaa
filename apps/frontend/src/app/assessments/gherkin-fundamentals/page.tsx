import { Metadata } from 'next';
import { gherkinFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Gherkin y BDD — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica sobre Gherkin y BDD: fundamentos de Behavior-Driven Development, sintaxis Dado/Cuando/Entonces y escenarios avanzados aplicados al testing.',
  keywords: [
    'Gherkin',
    'BDD',
    'Behavior-Driven Development',
    'Cucumber',
    'Given When Then',
    'Dado Cuando Entonces',
    'Scenario Outline',
    'criterios de aceptación',
    'QA',
    'testing',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'Gherkin y BDD — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre Gherkin y BDD: fundamentos, sintaxis Dado/Cuando/Entonces y escenarios avanzados aplicados al testing.',
    url: 'https://aiquaa.com/assessments/gherkin-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Gherkin%20y%20BDD%20-%20Fundamentos&subtitle=BDD%20y%20Gherkin%20para%20QA&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Gherkin y BDD Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gherkin y BDD — Fundamentos | AIQUAA',
    description:
      'Prueba técnica sobre BDD y la sintaxis Gherkin aplicada al testing.',
    images: [
      '/api/og?title=Gherkin%20y%20BDD%20-%20Fundamentos&subtitle=BDD%20y%20Gherkin&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/gherkin-fundamentals',
  },
};

export default function GherkinFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-gherkin-fundamentals',
      slug: gherkinFundamentalsDefinition.slug,
      title: gherkinFundamentalsDefinition.title,
      description: gherkinFundamentalsDefinition.description,
      level: gherkinFundamentalsDefinition.level,
      type: gherkinFundamentalsDefinition.type,
      duration_minutes: gherkinFundamentalsDefinition.duration_minutes,
      total_score: gherkinFundamentalsDefinition.total_score,
      is_active: gherkinFundamentalsDefinition.is_active,
      metadata: gherkinFundamentalsDefinition.metadata,
    },
    sections: gherkinFundamentalsDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-gherkin-fundamentals',
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
      startHref="/assessments/gherkin-fundamentals/start"
      evaluatesCopy="Qué es BDD, los 3 amigos, discovery/formulation/automation y documentación viva; sintaxis Gherkin: Dado/Cuando/Entonces, And/But, Background y keywords en español; Scenario Outline, data tables, tags, estilo declarativo vs imperativo y step definitions."
      scoringCopy="Automático en los 3 niveles: selección múltiple y verdadero/falso."
      resultCopy="Score total, score por nivel, fortalezas, debilidades y temas a reforzar."
    />
  );
}
