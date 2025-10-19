'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Autenticación no disponible
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            El sistema de inicio de sesión se encuentra temporalmente deshabilitado.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Estamos trabajando en mejorar el sistema de autenticación. Podés seguir explorando las herramientas sin necesidad de registrarte.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition w-full"
        >
          Volver al inicio
        </Link>

        <Link
          href="/labs"
          className="inline-block mt-3 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          Explorar herramientas →
        </Link>
      </div>
    </div>
  );
}
