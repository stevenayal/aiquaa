import { Metadata } from 'next';
import { apiTestingFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from './components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'API Testing — Fundamentos | AIQUAA Labs',
  description:
    'Examen teórico de API Testing: conceptos de API, lectura de documentación, diseño de casos y análisis de respuestas en 5 niveles progresivos.',
  keywords: [
    'API Testing',
    'testing de APIs',
    'REST API',
    'SOAP',
    'GraphQL',
    'QA',
    'testing',
    'AIQUAA',
    'herramienta gratuita',
    'fundamentos API',
  ],
  openGraph: {
    title: 'API Testing — Fundamentos | AIQUAA',
    description:
      'Examen teórico de API Testing en 5 niveles progresivos con corrección automática.',
    url: 'https://aiquaa.com/labs/api-testing-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=API%20Testing%20Fundamentos&subtitle=Examen%20teórico%20en%205%20niveles%20progresivos&section=Labs',
        width: 1200,
        height: 630,
        alt: 'API Testing Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Testing — Fundamentos | AIQUAA',
    description: 'Examen teórico de API Testing en 5 niveles progresivos.',
    images: [
      '/api/og?title=API%20Testing%20Fundamentos&subtitle=Examen%20teórico%20en%205%20niveles&section=Labs',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/labs/api-testing-fundamentals',
  },
};

export default function ApiTestingFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-api-testing-fundamentals',
      slug: apiTestingFundamentalsDefinition.slug,
      title: apiTestingFundamentalsDefinition.title,
      description: apiTestingFundamentalsDefinition.description,
      level: apiTestingFundamentalsDefinition.level,
      type: apiTestingFundamentalsDefinition.type,
      duration_minutes: apiTestingFundamentalsDefinition.duration_minutes,
      total_score: apiTestingFundamentalsDefinition.total_score,
      is_active: apiTestingFundamentalsDefinition.is_active,
      metadata: apiTestingFundamentalsDefinition.metadata,
    },
    sections: apiTestingFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-api-testing-fundamentals',
        slug: section.slug,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        max_score: section.max_score,
        metadata: section.metadata,
      })
    ),
  };

  return <AssessmentWelcome overview={overview} />;
}
