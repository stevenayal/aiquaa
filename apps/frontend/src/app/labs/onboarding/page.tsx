import Link from 'next/link';

export default function LabsOnboardingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">
          Modulo 2
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">
          Onboarding / alta
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Este modulo reutiliza un flujo controlado del laboratorio. No debe
          afectar el registro productivo de AIQUAA ni depender de cuentas
          reales.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/labs/onboarding/register"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Abrir alta
          </Link>
          <Link
            href="/labs/onboarding/confirm"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Verificacion
          </Link>
          <Link
            href="/labs/onboarding/result"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Resultado esperado
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Casos minimos
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Registro exitoso</li>
            <li>Email duplicado</li>
            <li>Password invalida</li>
            <li>Usuario pendiente de verificacion</li>
            <li>Activacion o cambio de estado visible</li>
            <li>Un caso inconsistente controlado para practica de reporte</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Contrato de referencia
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Se listan como contrato de referencia. La practica visible del
            laboratorio sigue usando rutas controladas de{' '}
            <code>/labs/test-app</code>.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              <code>POST /api/v1/auth/register</code>
            </li>
            <li>
              <code>GET /api/v1/auth/verify-email?token=...</code>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
