import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-md w-full text-center rounded-2xl p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
        <p className="text-5xl font-extrabold mb-2 text-amber-500">404</p>
        <h1 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
          Página no encontrada
        </h1>
        <p className="text-sm mb-6 text-gray-500 dark:text-slate-400">
          La página que buscás no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-colors text-sm"
          >
            Ir al inicio
          </Link>
          <Link
            href="/labs"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            Ver Labs
          </Link>
        </div>
      </div>
    </div>
  );
}
