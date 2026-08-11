import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function DockerFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/docker-fundamentals/start"
        fallbackRecommendation="Repasá la documentación oficial de Docker: builder/multi-stage builds, best practices para Dockerfiles, manejo de variables de entorno y docker-compose para desarrollo local."
      />
    </Suspense>
  );
}
