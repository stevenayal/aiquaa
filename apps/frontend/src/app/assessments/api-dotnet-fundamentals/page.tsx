import { Metadata } from 'next';
import { apiDotnetFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'API .NET — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica para bootcamp de desarrollo: diseño REST y versionado en .NET, contrato OpenAPI/Swagger, Clean Architecture y manejo de errores.',
  keywords: [
    '.NET',
    'ASP.NET Core',
    'API REST',
    'Clean Architecture',
    'OpenAPI',
    'Swagger',
    'manejo de errores',
    'ProblemDetails',
    'desarrollo backend',
    'bootcamp',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'API .NET — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre diseño REST, OpenAPI/Swagger, Clean Architecture y manejo de errores en .NET.',
    url: 'https://aiquaa.com/assessments/api-dotnet-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=API%20.NET%20-%20Fundamentos&subtitle=REST%2C%20Swagger%20y%20Clean%20Architecture&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'API .NET Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API .NET — Fundamentos | AIQUAA',
    description:
      'Prueba técnica sobre diseño REST, Swagger, Clean Architecture y manejo de errores en .NET.',
    images: [
      '/api/og?title=API%20.NET%20-%20Fundamentos&subtitle=REST%2C%20Swagger%20y%20Clean%20Architecture&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/api-dotnet-fundamentals',
  },
};

export default function ApiDotnetFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-api-dotnet-fundamentals',
      slug: apiDotnetFundamentalsDefinition.slug,
      title: apiDotnetFundamentalsDefinition.title,
      description: apiDotnetFundamentalsDefinition.description,
      level: apiDotnetFundamentalsDefinition.level,
      type: apiDotnetFundamentalsDefinition.type,
      duration_minutes: apiDotnetFundamentalsDefinition.duration_minutes,
      total_score: apiDotnetFundamentalsDefinition.total_score,
      is_active: apiDotnetFundamentalsDefinition.is_active,
      metadata: apiDotnetFundamentalsDefinition.metadata,
    },
    sections: apiDotnetFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-api-dotnet-fundamentals',
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
      startHref="/assessments/api-dotnet-fundamentals/start"
      evaluatesCopy="Diseño de rutas REST, verbos HTTP e idempotencia, versionado de API; contrato OpenAPI/Swagger y atributos de documentación; separación en capas con Clean Architecture y la regla de dependencia; manejo centralizado de errores con ProblemDetails sin filtrar detalles internos."
      scoringCopy="Automático en las 4 secciones: selección múltiple y verdadero/falso."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
