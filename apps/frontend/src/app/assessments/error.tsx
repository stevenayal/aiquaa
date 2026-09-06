'use client';

import SectionError from '@/components/ui/SectionError';

export default function AssessmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      error={error}
      reset={reset}
      emoji="⚠️"
      title="No se pudo cargar la evaluación"
      // El autosave es lo primero que el usuario necesita saber acá: lo que
      // teme es haber perdido las respuestas del nivel en curso.
      description="Ocurrió un error inesperado. Tu progreso guardado no se perdió — podés reintentar o volver al catálogo."
      // Antes volvía a /labs, que es otra sección: se llegaba a Labs desde un
      // error de assessments.
      backHref="/assessments"
      backLabel="Ir a evaluaciones"
    />
  );
}
