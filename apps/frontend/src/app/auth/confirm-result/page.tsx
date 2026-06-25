import Link from 'next/link';
import LogoMark from '@/components/LogoMark';

export default async function ConfirmResultPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; success?: string }>;
}) {
  const { error, next, success } = await searchParams;

  if (success === 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-slate-900 mb-4">
            <LogoMark size={32} color="#ffffff" wordmark={false} />
          </div>

          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            ¡Email confirmado!
          </h2>
          <p className="text-gray-600">
            Tu cuenta fue verificada exitosamente. Ya podés usar AIQUAA.
          </p>

          <Link
            href={next ?? '/ranking'}
            className="inline-block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
          >
            Ingresar a la app →
          </Link>
        </div>
      </div>
    );
  }

  const isPkceError = error === 'pkce_error';
  const isExpired = error === 'link_expired' || error === 'access_denied';
  const isPasswordReset = next?.includes('reset-password');

  const message = isPkceError
    ? 'El enlace fue abierto en un navegador o dispositivo diferente al que inició el proceso. Iniciá sesión nuevamente desde el mismo navegador.'
    : isExpired
      ? 'El enlace expiró o ya fue usado. Solicitá uno nuevo.'
      : 'Ocurrió un error durante la confirmación. Intentá de nuevo.';

  const actionHref = isPkceError
    ? '/login'
    : isPasswordReset
      ? '/auth/forgot-password'
      : '/register';
  const actionLabel = isPkceError
    ? 'Ir al login'
    : isPasswordReset
      ? 'Solicitar nuevo link'
      : 'Volver al registro';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-slate-900 mb-4">
          <LogoMark size={32} color="#ffffff" wordmark={false} />
        </div>

        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          Error de confirmación
        </h2>
        <p className="text-gray-600">{message}</p>

        <Link
          href={actionHref}
          className="inline-block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
        >
          {actionLabel}
        </Link>

        {isPasswordReset && (
          <p className="text-sm text-gray-500">
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← Volver al login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
