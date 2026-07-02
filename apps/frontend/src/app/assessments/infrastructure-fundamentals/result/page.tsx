import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function InfrastructureFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/infrastructure-fundamentals/start"
        fallbackRecommendation="Repasá los conceptos de contenedores y la arquitectura de Kubernetes en la documentación oficial de Docker y Kubernetes."
      />
    </Suspense>
  );
}
