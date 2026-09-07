'use client';

import SectionError from '@/components/ui/SectionError';

export default function EmpresaError({
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
      title="Este panel no pudo cargar"
      description="Ocurrió un error al traer los datos de tu empresa. Podés reintentar o volver al inicio del panel."
      backHref="/empresa"
      backLabel="Ir al panel"
    />
  );
}
