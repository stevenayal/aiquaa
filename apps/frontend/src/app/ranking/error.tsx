'use client';

import SectionError from '@/components/ui/SectionError';

export default function RankingError({
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
      emoji="🏆"
      title="El ranking no pudo cargar"
      description="Ocurrió un error al traer las posiciones. Podés reintentar en unos segundos."
      backHref="/dashboard"
      backLabel="Ir a tu panel"
    />
  );
}
