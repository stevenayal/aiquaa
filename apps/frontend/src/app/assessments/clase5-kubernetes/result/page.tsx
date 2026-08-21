import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function Clase5KubernetesResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/clase5-kubernetes/start"
        fallbackRecommendation={
          'Repasá el material de la Clase 5: pilares de la orquestación, plano de control y agente de nodo, por qué un Pod suelto no va a producción, la relación Deployment/ReplicaSet y para qué sirve cada componente del ecosistema.'
        }
      />
    </Suspense>
  );
}
