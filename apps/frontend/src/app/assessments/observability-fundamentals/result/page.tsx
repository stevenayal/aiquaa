import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function ObservabilityFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/observability-fundamentals/start"
        fallbackRecommendation="Repasá la documentación oficial de Serilog (logging estructurado, sinks, enrichment) y de Seq (ingesta, consultas y signals), practicando con niveles de log correctos en una app .NET."
      />
    </Suspense>
  );
}
