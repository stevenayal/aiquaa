'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * UI compartida para los error.tsx de cada seccion.
 *
 * Antes solo existian tres boundaries (raiz, assessments y labs), asi que casi
 * cualquier error de render mandaba al usuario al de la raiz, que no sabe de
 * donde venia ni adonde devolverlo. Este componente concentra el markup para
 * que agregar un boundary por seccion cueste ocho lineas y no haya diez copias
 * del mismo bloque.
 */
export default function SectionError({
  error,
  reset,
  emoji,
  title,
  description,
  backHref,
  backLabel,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  emoji: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div
        role="alert"
        className="max-w-md w-full text-center rounded-2xl p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm"
      >
        <div className="text-5xl mb-4" aria-hidden="true">
          {emoji}
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">
          {description}
        </p>
        {/*
          El digest es lo unico que permite cruzar este error con el log del
          servidor. Sin mostrarlo, un reporte de usuario es inaccionable.
        */}
        {error.digest ? (
          <p className="mb-6 font-mono text-xs text-gray-500 dark:text-slate-400">
            Código de error: {error.digest}
          </p>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Reintentar
          </button>
          <Link
            href={backHref}
            className="rounded-lg border border-gray-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
