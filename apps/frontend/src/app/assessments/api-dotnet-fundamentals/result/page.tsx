import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function ApiDotnetFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/api-dotnet-fundamentals/start"
        fallbackRecommendation="Repasá la documentación oficial de ASP.NET Core: convenciones REST, Swashbuckle/OpenAPI, la guía de Clean Architecture (Microsoft eShopOnWeb) y el manejo de excepciones con ProblemDetails."
      />
    </Suspense>
  );
}
