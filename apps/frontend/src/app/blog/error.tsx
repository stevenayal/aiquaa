'use client';

import SectionError from '@/components/ui/SectionError';

export default function BlogError({
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
      emoji="📝"
      title="Esta nota no pudo cargar"
      description="Ocurrió un error al traer el contenido. Podés reintentar o volver al listado."
      backHref="/blog"
      backLabel="Ir al blog"
    />
  );
}
