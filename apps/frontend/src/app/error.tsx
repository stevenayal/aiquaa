'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center rounded-2xl p-8 bg-white border border-gray-200 shadow-sm">
        <div className="text-5xl mb-4" aria-hidden="true">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-sm text-gray-500 mb-6">
          Ocurrió un error inesperado. Podés intentar recargar la página o
          volver al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
