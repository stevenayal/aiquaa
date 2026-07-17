import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function GherkinFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/gherkin-fundamentals/start"
        fallbackRecommendation="Repasá la referencia oficial de Gherkin y la guía de BDD de Cucumber: keywords Dado/Cuando/Entonces, Background, Scenario Outline y el estilo declarativo."
      />
    </Suspense>
  );
}
