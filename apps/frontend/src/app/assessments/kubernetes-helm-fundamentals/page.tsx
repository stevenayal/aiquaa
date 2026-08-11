import { Metadata } from 'next';
import { kubernetesHelmFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Kubernetes + Helm — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica para bootcamp de desarrollo: manifiestos Deployment/Service, ConfigMaps y Secrets, charts de Helm y despliegue funcional en Minikube.',
  keywords: [
    'Kubernetes',
    'Helm',
    'Minikube',
    'Deployment',
    'Service',
    'ConfigMap',
    'Secret',
    'desarrollo backend',
    'DevOps',
    'bootcamp',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'Kubernetes + Helm — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre manifiestos Kubernetes, ConfigMaps/Secrets, Helm y despliegue en Minikube.',
    url: 'https://aiquaa.com/assessments/kubernetes-helm-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Kubernetes%20%2B%20Helm%20-%20Fundamentos&subtitle=Manifiestos%2C%20ConfigMaps%20y%20Helm&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Kubernetes + Helm Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kubernetes + Helm — Fundamentos | AIQUAA',
    description:
      'Prueba técnica sobre manifiestos Kubernetes, ConfigMaps/Secrets, Helm y despliegue en Minikube.',
    images: [
      '/api/og?title=Kubernetes%20%2B%20Helm%20-%20Fundamentos&subtitle=Manifiestos%2C%20ConfigMaps%20y%20Helm&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/kubernetes-helm-fundamentals',
  },
};

export default function KubernetesHelmFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-kubernetes-helm-fundamentals',
      slug: kubernetesHelmFundamentalsDefinition.slug,
      title: kubernetesHelmFundamentalsDefinition.title,
      description: kubernetesHelmFundamentalsDefinition.description,
      level: kubernetesHelmFundamentalsDefinition.level,
      type: kubernetesHelmFundamentalsDefinition.type,
      duration_minutes: kubernetesHelmFundamentalsDefinition.duration_minutes,
      total_score: kubernetesHelmFundamentalsDefinition.total_score,
      is_active: kubernetesHelmFundamentalsDefinition.is_active,
      metadata: kubernetesHelmFundamentalsDefinition.metadata,
    },
    sections: kubernetesHelmFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-kubernetes-helm-fundamentals',
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
      startHref="/assessments/kubernetes-helm-fundamentals/start"
      evaluatesCopy="Manifiestos Deployment y Service, selectores de labels y RollingUpdate; ConfigMaps y Secrets para desacoplar configuración sensible del código; charts de Helm, values.yaml y el ciclo de vida de un release; despliegue funcional y diagnóstico de Pods en Minikube."
      scoringCopy="Automático en las 4 secciones: selección múltiple y verdadero/falso."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
