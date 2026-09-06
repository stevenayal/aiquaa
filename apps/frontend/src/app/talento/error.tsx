'use client';

import SectionError from '@/components/ui/SectionError';

export default function TalentoError({
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
      emoji="🎯"
      title="Esta sección no pudo cargar"
      description="Ocurrió un error al traer los perfiles. Podés reintentar o volver al inicio."
      backHref="/"
      backLabel="Ir al inicio"
    />
  );
}
