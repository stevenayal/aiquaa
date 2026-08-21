import { Metadata } from 'next';
import { clase5KubernetesDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Clase 5 — Kubernetes | AIQUAA',
  description:
    'Prueba técnica teórica sobre Kubernetes: orquestación, arquitectura del clúster, Pods, Deployment/ReplicaSet, StatefulSet y Services.',
  keywords: [
    'Kubernetes',
    'orquestación de contenedores',
    'Pods',
    'Deployment',
    'ReplicaSet',
    'StatefulSet',
    'Service',
    'Minikube',
    'bootcamp',
    'AIQUAA',
  ],
  openGraph: {
    title: 'Clase 5 — Kubernetes | AIQUAA',
    description:
      'Prueba técnica teórica sobre Kubernetes: orquestación, arquitectura del clúster, Pods, Deployment/ReplicaSet, StatefulSet y Services.',
    url: 'https://aiquaa.com/assessments/clase5-kubernetes',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Clase%205%20-%20Kubernetes&subtitle=Orquestaci%C3%B3n%2C%20Pods%20y%20controladores&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Clase 5 — Kubernetes - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clase 5 — Kubernetes | AIQUAA',
    description:
      'Prueba técnica teórica sobre Kubernetes: orquestación, arquitectura del clúster, Pods, Deployment/ReplicaSet, StatefulSet y Services.',
    images: [
      '/api/og?title=Clase%205%20-%20Kubernetes&subtitle=Orquestaci%C3%B3n%2C%20Pods%20y%20controladores&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/clase5-kubernetes',
  },
};

export default function Clase5KubernetesPage() {
  const overview = {
    assessment: {
      id: 'static-clase5-kubernetes',
      slug: clase5KubernetesDefinition.slug,
      title: clase5KubernetesDefinition.title,
      description: clase5KubernetesDefinition.description,
      level: clase5KubernetesDefinition.level,
      type: clase5KubernetesDefinition.type,
      duration_minutes: clase5KubernetesDefinition.duration_minutes,
      total_score: clase5KubernetesDefinition.total_score,
      is_active: clase5KubernetesDefinition.is_active,
      metadata: clase5KubernetesDefinition.metadata,
    },
    sections: clase5KubernetesDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-clase5-kubernetes',
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
      startHref="/assessments/clase5-kubernetes/start"
      evaluatesCopy={
        'La definición y el propósito de Kubernetes; los tres pilares de la orquestación (alta disponibilidad, escalado dinámico y autorecuperación); el reparto de responsabilidades entre Scheduler y Kubelet; entorno local con Minikube/Kind frente a producción; el ciclo de vida del Pod y su debilidad fuera de un controlador; el paradigma declarativo; Deployment frente a ReplicaSet; StatefulSet para cargas con estado; y el rol del Service frente a Pods efímeros.'
      }
      scoringCopy="Automático en las 3 secciones: 9 preguntas de respuesta única y 1 de varias respuestas, con crédito parcial."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
