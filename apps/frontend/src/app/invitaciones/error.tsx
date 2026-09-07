'use client';

import SectionError from '@/components/ui/SectionError';

export default function InvitacionesError({
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
      emoji="✉️"
      title="Las invitaciones no pudieron cargar"
      description="Ocurrió un error al traer tus invitaciones. Podés reintentar en unos segundos."
      backHref="/dashboard"
      backLabel="Ir a tu panel"
    />
  );
}
