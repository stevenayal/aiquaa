'use client';

import SectionError from '@/components/ui/SectionError';

export default function ComunidadError({
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
      emoji="💬"
      title="La comunidad no pudo cargar"
      description="Ocurrió un error al traer las publicaciones. Podés reintentar o volver al inicio."
      backHref="/"
      backLabel="Ir al inicio"
    />
  );
}
