'use client';

import SectionError from '@/components/ui/SectionError';

export default function LabsError({
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
      emoji="🧪"
      title="Este lab no pudo cargar"
      description="Ocurrió un error inesperado. Podés intentar reiniciar el lab o volver al catálogo de herramientas."
      backHref="/labs"
      backLabel="Ir al catálogo"
    />
  );
}
