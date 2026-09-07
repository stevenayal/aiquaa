'use client';

import SectionError from '@/components/ui/SectionError';

export default function AdminError({
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
      emoji="🛠️"
      title="El panel de administración no pudo cargar"
      description="Ocurrió un error al traer los datos. Podés reintentar o volver al inicio."
      backHref="/"
      backLabel="Ir al inicio"
    />
  );
}
