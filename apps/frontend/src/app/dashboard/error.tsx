'use client';

import SectionError from '@/components/ui/SectionError';

export default function DashboardError({
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
      emoji="📊"
      title="Tu panel no pudo cargar"
      description="Ocurrió un error inesperado al armar tu panel. Tus datos no se perdieron."
      backHref="/"
      backLabel="Ir al inicio"
    />
  );
}
