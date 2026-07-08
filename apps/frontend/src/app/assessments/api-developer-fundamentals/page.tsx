import { Metadata } from 'next';
import { apiDeveloperFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'APIs para Desarrolladores — Fundamentos | AIQUAA',
  description:
    'Prueba técnica para desarrolladores sobre fundamentos de APIs REST: principios de arquitectura, recursos y URIs, OpenAPI, request/response, params y verbos HTTP.',
  keywords: [
    'APIs',
    'REST',
    'desarrolladores',
    'OpenAPI',
    'HTTP',
    'query params',
    'route params',
    'backend',
    'AIQUAA',
    'evaluación técnica',
    'prueba técnica',
    'desarrollo',
  ],
  openGraph: {
    title: 'APIs para Desarrolladores — Fundamentos | AIQUAA',
    description:
      'Prueba técnica para desarrolladores sobre fundamentos de APIs REST: principios, recursos, OpenAPI, params y verbos HTTP.',
    url: 'https://aiquaa.com/assessments/api-developer-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=APIs%20para%20Desarrolladores&subtitle=Fundamentos%20REST&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'APIs para Desarrolladores - Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APIs para Desarrolladores — Fundamentos | AIQUAA',
    description:
      'Prueba técnica de fundamentos REST para desarrolladores de APIs.',
    images: [
      '/api/og?title=APIs%20para%20Desarrolladores&subtitle=Fundamentos%20REST&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/api-developer-fundamentals',
  },
};

export default function ApiDeveloperFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-api-developer-fundamentals',
      slug: apiDeveloperFundamentalsDefinition.slug,
      title: apiDeveloperFundamentalsDefinition.title,
      description: apiDeveloperFundamentalsDefinition.description,
      level: apiDeveloperFundamentalsDefinition.level,
      type: apiDeveloperFundamentalsDefinition.type,
      duration_minutes: apiDeveloperFundamentalsDefinition.duration_minutes,
      total_score: apiDeveloperFundamentalsDefinition.total_score,
      is_active: apiDeveloperFundamentalsDefinition.is_active,
      metadata: apiDeveloperFundamentalsDefinition.metadata,
    },
    sections: apiDeveloperFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-api-developer-fundamentals',
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
      startHref="/assessments/api-developer-fundamentals/start"
      evaluatesCopy="Principios REST (Client–Server, Stateless, Cacheable, Uniform Interface), recursos y URIs, contrato OpenAPI, anatomía de request/response, query y route params, y verbos HTTP."
      scoringCopy="Automático: 11 preguntas de selección única sobre 100 puntos."
      resultCopy="Score total, aprobación al 70%, fortalezas, debilidades y temas a reforzar."
    />
  );
}
