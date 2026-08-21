import { Metadata } from 'next';
import { clase6ConfigKubernetesDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Clase 6 — Configuración en Kubernetes | AIQUAA',
  description:
    'Prueba técnica teórica sobre configuración en Kubernetes: inmutabilidad, ConfigMaps, envFrom, Secrets, Base64, Helm y CI/CD.',
  keywords: [
    'Kubernetes',
    'ConfigMap',
    'Secrets',
    'envFrom',
    'variables de entorno',
    'Helm',
    'values.yaml',
    'CI/CD',
    'bootcamp',
    'AIQUAA',
  ],
  openGraph: {
    title: 'Clase 6 — Configuración en Kubernetes | AIQUAA',
    description:
      'Prueba técnica teórica sobre configuración en Kubernetes: inmutabilidad, ConfigMaps, envFrom, Secrets, Base64, Helm y CI/CD.',
    url: 'https://aiquaa.com/assessments/clase6-config-kubernetes',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Clase%206%20-%20Configuraci%C3%B3n%20en%20Kubernetes&subtitle=ConfigMaps%2C%20Secrets%20y%20Helm&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Clase 6 — Configuración en Kubernetes - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clase 6 — Configuración en Kubernetes | AIQUAA',
    description:
      'Prueba técnica teórica sobre configuración en Kubernetes: inmutabilidad, ConfigMaps, envFrom, Secrets, Base64, Helm y CI/CD.',
    images: [
      '/api/og?title=Clase%206%20-%20Configuraci%C3%B3n%20en%20Kubernetes&subtitle=ConfigMaps%2C%20Secrets%20y%20Helm&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/clase6-config-kubernetes',
  },
};

export default function Clase6ConfigKubernetesPage() {
  const overview = {
    assessment: {
      id: 'static-clase6-config-kubernetes',
      slug: clase6ConfigKubernetesDefinition.slug,
      title: clase6ConfigKubernetesDefinition.title,
      description: clase6ConfigKubernetesDefinition.description,
      level: clase6ConfigKubernetesDefinition.level,
      type: clase6ConfigKubernetesDefinition.type,
      duration_minutes: clase6ConfigKubernetesDefinition.duration_minutes,
      total_score: clase6ConfigKubernetesDefinition.total_score,
      is_active: clase6ConfigKubernetesDefinition.is_active,
      metadata: clase6ConfigKubernetesDefinition.metadata,
    },
    sections: clase6ConfigKubernetesDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-clase6-config-kubernetes',
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
      startHref="/assessments/clase6-config-kubernetes/start"
      evaluatesCopy={
        'El principio de inmutabilidad (una imagen, muchos entornos); la configuración externa al contenedor; qué información va en un ConfigMap y cuál no; el motor de inyección con envFrom; cómo consume una API .NET esas variables; la diferencia entre codificar en Base64 y cifrar; la matriz ConfigMaps frente a Secrets; el papel de Helm al parametrizar YAML; y el flujo CI/CD que entrega la configuración al clúster.'
      }
      scoringCopy="Automático en las 3 secciones: 9 preguntas de respuesta única y 1 de varias respuestas, con crédito parcial."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
