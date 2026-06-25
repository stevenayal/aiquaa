import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function DatabaseFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/database-fundamentals/start"
        fallbackRecommendation="Seguí practicando consultas SQL y modelado relacional con casos reales."
      />
    </Suspense>
  );
}
