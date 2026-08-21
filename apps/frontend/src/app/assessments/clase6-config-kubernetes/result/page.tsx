import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function Clase6ConfigKubernetesResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/clase6-config-kubernetes/start"
        fallbackRecommendation={
          'Repasá el material de la Clase 6: por qué la imagen no cambia entre entornos, casos de uso y límites de ConfigMap, la secuencia de inyección con envFrom, que Base64 no es cifrado, y cómo Helm y el pipeline versionan la configuración.'
        }
      />
    </Suspense>
  );
}
