import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center rounded-2xl p-8 bg-white border border-gray-200 shadow-sm">
        <div className="text-6xl mb-4" aria-hidden="true">
          🔍
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Página no encontrada
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Esta página no existe o fue movida. Verificá la URL o volvé al inicio.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
