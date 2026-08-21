import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function Clase9CicdGithubActionsResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/clase9-cicd-github-actions/start"
        fallbackRecommendation={
          'Repasá el material de la Clase 9: beneficios de la automatización, Delivery frente a Deployment, las seis etapas del pipeline, los triggers pull_request/workflow_dispatch/push con el orden restore → build → test, y qué va en Variables y qué en Secrets.'
        }
      />
    </Suspense>
  );
}
