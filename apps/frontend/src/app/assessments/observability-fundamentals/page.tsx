import { Metadata } from 'next';
import { observabilityFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Observabilidad — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica para bootcamp de desarrollo: logging estructurado con Serilog, centralización de logs en Seq sobre Kubernetes, niveles de log y visualización para diagnosticar producción.',
  keywords: [
    'observabilidad',
    'Serilog',
    'Seq',
    'logging estructurado',
    'niveles de log',
    'monitoreo',
    'desarrollo backend',
    'DevOps',
    'bootcamp',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'Observabilidad — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre logging estructurado, centralización en Seq, niveles de log y visualización.',
    url: 'https://aiquaa.com/assessments/observability-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Observabilidad%20-%20Fundamentos&subtitle=Serilog%2C%20Seq%20y%20niveles%20de%20log&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Observabilidad Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Observabilidad — Fundamentos | AIQUAA',
    description:
      'Prueba técnica sobre logging estructurado, Serilog, Seq y niveles de log.',
    images: [
      '/api/og?title=Observabilidad%20-%20Fundamentos&subtitle=Serilog%2C%20Seq%20y%20niveles%20de%20log&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/observability-fundamentals',
  },
};

export default function ObservabilityFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-observability-fundamentals',
      slug: observabilityFundamentalsDefinition.slug,
      title: observabilityFundamentalsDefinition.title,
      description: observabilityFundamentalsDefinition.description,
      level: observabilityFundamentalsDefinition.level,
      type: observabilityFundamentalsDefinition.type,
      duration_minutes: observabilityFundamentalsDefinition.duration_minutes,
      total_score: observabilityFundamentalsDefinition.total_score,
      is_active: observabilityFundamentalsDefinition.is_active,
      metadata: observabilityFundamentalsDefinition.metadata,
    },
    sections: observabilityFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-observability-fundamentals',
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
      startHref="/assessments/observability-fundamentals/start"
      evaluatesCopy="Logging estructurado con Serilog (templates, properties, sinks, enrichment); centralización de logs de múltiples réplicas en Seq sobre Kubernetes; uso correcto de niveles Information/Warning/Error/Debug; consulta y visualización de logs en Seq para diagnosticar producción."
      scoringCopy="Automático en las 4 secciones: selección múltiple y verdadero/falso."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
