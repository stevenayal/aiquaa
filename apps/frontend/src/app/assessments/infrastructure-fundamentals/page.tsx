import { Metadata } from 'next';
import { infrastructureFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Infraestructura — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica sobre contenedores Docker, conceptos de Kubernetes y arquitectura de clúster: control plane, nodos y pods.',
  keywords: [
    'infraestructura',
    'Docker',
    'contenedores',
    'Kubernetes',
    'orquestación',
    'control plane',
    'pods',
    'QA',
    'testing',
    'AIQUAA',
    'evaluación técnica',
    'DevOps',
  ],
  openGraph: {
    title: 'Infraestructura — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre contenedores Docker, conceptos de Kubernetes y arquitectura de clúster.',
    url: 'https://aiquaa.com/assessments/infrastructure-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Infraestructura%20-%20Fundamentos&subtitle=Docker%20y%20Kubernetes%20para%20QA&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Infraestructura Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Infraestructura — Fundamentos | AIQUAA',
    description: 'Prueba técnica sobre Docker y arquitectura de Kubernetes.',
    images: [
      '/api/og?title=Infraestructura%20-%20Fundamentos&subtitle=Docker%20y%20Kubernetes&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/infrastructure-fundamentals',
  },
};

export default function InfrastructureFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-infrastructure-fundamentals',
      slug: infrastructureFundamentalsDefinition.slug,
      title: infrastructureFundamentalsDefinition.title,
      description: infrastructureFundamentalsDefinition.description,
      level: infrastructureFundamentalsDefinition.level,
      type: infrastructureFundamentalsDefinition.type,
      duration_minutes: infrastructureFundamentalsDefinition.duration_minutes,
      total_score: infrastructureFundamentalsDefinition.total_score,
      is_active: infrastructureFundamentalsDefinition.is_active,
      metadata: infrastructureFundamentalsDefinition.metadata,
    },
    sections: infrastructureFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-infrastructure-fundamentals',
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
      startHref="/assessments/infrastructure-fundamentals/start"
      evaluatesCopy="Contenedores vs VMs, imágenes, aislamiento, registries; qué es Kubernetes, qué provee y qué no, diferencias vs otras tecnologías; arquitectura: control plane, nodos y pods."
      scoringCopy="Automático en los 3 niveles: selección múltiple y verdadero/falso."
      resultCopy="Score total, score por nivel, fortalezas, debilidades y temas a reforzar."
    />
  );
}
