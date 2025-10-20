import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-background flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-dark-text mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Artículo no encontrado
          </h2>
          <p className="text-gray-600 dark:text-dark-muted">
            El artículo que estás buscando no existe o fue eliminado.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blog"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-dark-accent dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Ver todos los artículos
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary dark:hover:bg-gray-700 text-gray-900 dark:text-dark-text font-medium rounded-lg transition-colors"
          >
            Ir al inicio
          </Link>
        </div>

        {/* Illustration */}
        <div className="mt-12">
          <svg
            className="w-64 h-64 mx-auto text-gray-300 dark:text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
