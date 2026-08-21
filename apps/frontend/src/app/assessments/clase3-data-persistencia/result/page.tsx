import { Suspense } from 'react';
import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function Clase3DataPersistenciaResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
        </div>
      }
    >
      <AssessmentResultClient
        startHref="/assessments/clase3-data-persistencia/start"
        fallbackRecommendation={
          'Repasá el material de la Clase 3: diferencias entre ADO.NET y Entity Framework Core, migraciones, seguridad y pooling en PostgreSQL, separación entre DTOs y entidades de dominio, y reglas de FluentValidation.'
        }
      />
    </Suspense>
  );
}
