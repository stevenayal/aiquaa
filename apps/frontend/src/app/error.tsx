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
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-md w-full text-center rounded-2xl p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
        <p className="text-4xl mb-3" aria-hidden="true">⚠️</p>
        <h1 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
          Algo salió mal
        </h1>
        <p className="text-sm mb-5 text-gray-500 dark:text-slate-400">
          Ocurrió un error inesperado. Podés intentar recargar la página.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
