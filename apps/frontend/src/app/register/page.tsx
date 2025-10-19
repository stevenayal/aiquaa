'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Registro no disponible
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            El sistema de registro se encuentra temporalmente deshabilitado.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            <strong>¡Buenas noticias!</strong>
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Todas nuestras herramientas de QA están disponibles sin necesidad de crear una cuenta. Podés empezar a usarlas ahora mismo.
          </p>
        </div>

        <Link
          href="/labs"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition w-full mb-3"
        >
          Explorar herramientas
        </Link>

        <Link
          href="/"
          className="inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
