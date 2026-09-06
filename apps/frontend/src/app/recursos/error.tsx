'use client';

import SectionError from '@/components/ui/SectionError';

export default function RecursosError({
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
      emoji="📚"
      title="Los recursos no pudieron cargar"
      description="Ocurrió un error al traer el material. Podés reintentar en unos segundos."
      backHref="/"
      backLabel="Ir al inicio"
    />
  );
}
