import { Metadata } from 'next';
import { kubernetesOrchestrationFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Kubernetes — Fundamentos de Orquestación | AIQUAA',
  description:
    'Prueba técnica teórica sobre Kubernetes: propósito de la plataforma, pilares de la orquestación, arquitectura Scheduler/Kubelet, Pods, paradigma declarativo, Deployment/ReplicaSet, StatefulSet, Services y ecosistema.',
  keywords: [
    'Kubernetes',
    'orquestación',
    'Pods',
    'Deployment',
    'ReplicaSet',
    'StatefulSet',
    'Service',
    'Scheduler',
    'Kubelet',
    'Minikube',
    'DevOps',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'Kubernetes — Fundamentos de Orquestación | AIQUAA',
    description:
      'Prueba técnica teórica sobre Kubernetes: pilares de orquestación, arquitectura, Pods, paradigma declarativo y ecosistema de controladores.',
    url: 'https://aiquaa.com/assessments/kubernetes-orchestration-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Kubernetes%20-%20Fundamentos%20de%20Orquestacion&subtitle=Kubernetes%20para%20desarrollo&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Kubernetes Fundamentos de Orquestación - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kubernetes — Fundamentos de Orquestación | AIQUAA',
    description:
      'Prueba técnica sobre los fundamentos de orquestación de Kubernetes.',
    images: [
      '/api/og?title=Kubernetes%20-%20Fundamentos%20de%20Orquestacion&subtitle=Kubernetes&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical:
      'https://aiquaa.com/assessments/kubernetes-orchestration-fundamentals',
  },
};

export default function KubernetesOrchestrationFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-kubernetes-orchestration-fundamentals',
      slug: kubernetesOrchestrationFundamentalsDefinition.slug,
      title: kubernetesOrchestrationFundamentalsDefinition.title,
      description: kubernetesOrchestrationFundamentalsDefinition.description,
      level: kubernetesOrchestrationFundamentalsDefinition.level,
      type: kubernetesOrchestrationFundamentalsDefinition.type,
      duration_minutes:
        kubernetesOrchestrationFundamentalsDefinition.duration_minutes,
      total_score: kubernetesOrchestrationFundamentalsDefinition.total_score,
      is_active: kubernetesOrchestrationFundamentalsDefinition.is_active,
      metadata: kubernetesOrchestrationFundamentalsDefinition.metadata,
    },
    sections: kubernetesOrchestrationFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-kubernetes-orchestration-fundamentals',
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
      startHref="/assessments/kubernetes-orchestration-fundamentals/start"
      evaluatesCopy="Propósito de Kubernetes y los tres pilares de la orquestación; arquitectura Scheduler/Kubelet y entorno local vs. producción; ciclo de vida de los Pods, el paradigma declarativo, Deployment/ReplicaSet y StatefulSet; Services y el resto del ecosistema."
      scoringCopy="Automático en las 3 secciones: selección múltiple de una o varias respuestas correctas."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
