import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function PlaywrightFundamentalsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/playwright-fundamentals/start"
        fallbackRecommendation="Repasá la documentación oficial de Playwright: Test CLI, locators, assertions y fixtures (https://playwright.dev/docs)."
      />
    </Suspense>
  );
}
