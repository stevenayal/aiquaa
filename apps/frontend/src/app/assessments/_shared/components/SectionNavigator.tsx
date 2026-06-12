'use client';

import Link from 'next/link';

export default function SectionNavigator({
  currentIndex,
  total,
  previousHref,
  submitLabel,
  isSubmitting,
  onSubmit,
}: {
  currentIndex: number;
  total: number;
  previousHref: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Navegación
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Estás en el nivel {currentIndex} de {total}. Podés volver al nivel
          anterior para revisar tu respuesta antes de enviar este bloque.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={previousHref}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Ir al nivel anterior
        </Link>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Procesando...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
