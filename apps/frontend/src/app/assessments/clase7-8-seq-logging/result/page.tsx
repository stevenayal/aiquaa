import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function Clase78SeqLoggingResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/clase7-8-seq-logging/start"
        fallbackRecommendation={
          'Repasá el material de las Clases 7 y 8: límites de kubectl logs, por qué los logs locales se pierden, JSON con pares clave-valor, los sinks de Serilog, la diferencia entre Warning y Error, y el despliegue de Seq con Service y volumen.'
        }
      />
    </Suspense>
  );
}
