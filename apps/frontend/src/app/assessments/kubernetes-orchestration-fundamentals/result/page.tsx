import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function KubernetesOrchestrationFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/kubernetes-orchestration-fundamentals/start"
        fallbackRecommendation="Repasá 'Clase 5 - Kubernetes.pdf': pilares de orquestación, arquitectura Scheduler/Kubelet, paradigma declarativo y las responsabilidades de Deployment, ReplicaSet, StatefulSet y Service."
      />
    </Suspense>
  );
}
