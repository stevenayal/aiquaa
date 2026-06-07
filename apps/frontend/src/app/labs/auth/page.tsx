import Link from 'next/link';

const endpoints = [
  'POST /api/v1/auth/login',
  'POST /api/v1/auth/request-reset',
  'POST /api/v1/auth/reset',
  'GET /api/v1/auth/me',
  'POST /api/v1/auth/2fa/send-code',
  'POST /api/v1/auth/2fa/complete-login',
];

export default function LabsAuthPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
          Modulo 1
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">
          Acceso y recuperacion
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Este modulo existe solo como superficie de practica. La interaccion
          visible del laboratorio usa rutas controladas de{' '}
          <code>/labs/test-app</code> y no debe afectar el login ni el registro
          productivo de AIQUAA.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/labs/auth/login"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Abrir login
          </Link>
          <Link
            href="/labs/auth/forgot-password"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Recuperacion
          </Link>
          <Link
            href="/labs/auth/2fa"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Edge case 2FA
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Casos minimos
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Login valido</li>
            <li>Login invalido</li>
            <li>Usuario no existente</li>
            <li>Recuperacion de acceso</li>
            <li>Token invalido o expirado</li>
            <li>2FA por email como edge case opcional</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Contrato de referencia
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Estos endpoints se documentan como referencia para API testing, pero
            las pantallas del laboratorio no envian requests al auth productivo.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {endpoints.map((endpoint) => (
              <li key={endpoint}>
                <code>{endpoint}</code>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
