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
    console.error('[LabsError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-md w-full text-center rounded-2xl p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
        <p className="text-4xl mb-3" aria-hidden="true">🧪</p>
        <h1 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
          No pudimos cargar este lab
        </h1>
        <p className="text-sm mb-5 text-gray-500 dark:text-slate-400">
          Ocurrió un error al cargar el laboratorio. Podés intentar de nuevo o
          volver al listado de labs.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-colors text-sm"
          >
            Reintentar
          </button>
          <Link
            href="/labs"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            Ver todos los labs
          </Link>
        </div>
      </div>
    </div>
  );
}
