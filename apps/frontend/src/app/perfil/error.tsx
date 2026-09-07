'use client';

import SectionError from '@/components/ui/SectionError';

export default function PerfilError({
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
      emoji="👤"
      title="Tu perfil no pudo cargar"
      description="Ocurrió un error al traer tus datos. No se modificó nada de tu perfil."
      backHref="/dashboard"
      backLabel="Ir a tu panel"
    />
  );
}
