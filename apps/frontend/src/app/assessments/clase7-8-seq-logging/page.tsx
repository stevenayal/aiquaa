import { Metadata } from 'next';
import { clase78SeqLoggingDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Clases 7 y 8 — SEQ Structured Logging | AIQUAA',
  description:
    'Prueba técnica teórica sobre logging estructurado: límites de kubectl logs, Serilog, sinks, niveles de severidad y Seq en Kubernetes.',
  keywords: [
    'logging estructurado',
    'Serilog',
    'Seq',
    'observabilidad',
    'sinks',
    'niveles de log',
    'Kubernetes',
    'kubectl logs',
    'bootcamp',
    'AIQUAA',
  ],
  openGraph: {
    title: 'Clases 7 y 8 — SEQ Structured Logging | AIQUAA',
    description:
      'Prueba técnica teórica sobre logging estructurado: límites de kubectl logs, Serilog, sinks, niveles de severidad y Seq en Kubernetes.',
    url: 'https://aiquaa.com/assessments/clase7-8-seq-logging',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Clases%207%20y%208%20-%20SEQ%20Structured%20Logging&subtitle=Serilog%2C%20sinks%20y%20Seq&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Clases 7 y 8 — SEQ Structured Logging - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clases 7 y 8 — SEQ Structured Logging | AIQUAA',
    description:
      'Prueba técnica teórica sobre logging estructurado: límites de kubectl logs, Serilog, sinks, niveles de severidad y Seq en Kubernetes.',
    images: [
      '/api/og?title=Clases%207%20y%208%20-%20SEQ%20Structured%20Logging&subtitle=Serilog%2C%20sinks%20y%20Seq&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/clase7-8-seq-logging',
  },
};

export default function Clase78SeqLoggingPage() {
  const overview = {
    assessment: {
      id: 'static-clase7-8-seq-logging',
      slug: clase78SeqLoggingDefinition.slug,
      title: clase78SeqLoggingDefinition.title,
      description: clase78SeqLoggingDefinition.description,
      level: clase78SeqLoggingDefinition.level,
      type: clase78SeqLoggingDefinition.type,
      duration_minutes: clase78SeqLoggingDefinition.duration_minutes,
      total_score: clase78SeqLoggingDefinition.total_score,
      is_active: clase78SeqLoggingDefinition.is_active,
      metadata: clase78SeqLoggingDefinition.metadata,
    },
    sections: clase78SeqLoggingDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-clase7-8-seq-logging',
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
      startHref="/assessments/clase7-8-seq-logging/start"
      evaluatesCopy={
        'Por qué sin logging centralizado el diagnóstico de un sistema distribuido es inviable; qué permite y qué bloquea kubectl logs; por qué los logs del Pod son efímeros; el diseño de logs como datos estructurados pensados para búsquedas futuras; las capacidades de Serilog y su pipeline de sinks; el termómetro de severidad (Information, Warning, Error, Fatal); Seq como receptor central; y el blueprint de despliegue de Seq en Minikube.'
      }
      scoringCopy="Automático en las 3 secciones: 9 preguntas de respuesta única y 1 de varias respuestas, con crédito parcial."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
