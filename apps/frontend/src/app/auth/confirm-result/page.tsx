import Link from 'next/link';
import LogoMark from '@/components/LogoMark';

export default async function ConfirmResultPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-slate-900 mb-4">
          <LogoMark size={32} color="#ffffff" wordmark={false} />
        </div>

        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">Error de confirmación</h2>
        <p className="text-gray-600">
          {error === 'link_expired'
            ? 'El enlace expiró o ya fue usado. Solicitá uno nuevo.'
            : 'Ocurrió un error durante la confirmación. Intentá de nuevo.'}
        </p>

        <Link
          href="/register"
          className="inline-block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
        >
          Volver al registro
        </Link>
      </div>
    </div>
  );
}
