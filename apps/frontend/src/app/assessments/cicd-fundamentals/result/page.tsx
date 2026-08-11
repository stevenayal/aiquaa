import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function CicdFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/cicd-fundamentals/start"
        fallbackRecommendation="Repasá los conceptos de integración y despliegue continuo (CI/CD), Conventional Commits, y buenas prácticas de organización de un repositorio Git para un proyecto real."
      />
    </Suspense>
  );
}
