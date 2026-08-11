import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function KubernetesHelmFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/kubernetes-helm-fundamentals/start"
        fallbackRecommendation="Repasá la documentación oficial de Kubernetes (Deployments, Services, ConfigMaps, Secrets) y la guía de Helm (charts, values, ciclo de vida de releases), practicando con Minikube en local."
      />
    </Suspense>
  );
}
