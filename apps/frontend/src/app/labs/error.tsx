'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LabsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center rounded-2xl p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="text-5xl mb-4" aria-hidden="true">
          🧪
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Este lab no pudo cargar
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Ocurrió un error inesperado. Podés intentar reiniciar el lab o volver
          al catálogo de herramientas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Reintentar
          </button>
          <Link
            href="/labs"
            className="rounded-lg border border-gray-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Volver a Labs
          </Link>
        </div>
      </div>
    </div>
  );
}
