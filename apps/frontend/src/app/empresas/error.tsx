'use client';

import SectionError from '@/components/ui/SectionError';

export default function EmpresasError({
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
      emoji="🏢"
      title="No se pudieron cargar las empresas"
      description="Ocurrió un error al traer el listado. Podés reintentar en unos segundos."
      backHref="/"
      backLabel="Ir al inicio"
    />
  );
}
