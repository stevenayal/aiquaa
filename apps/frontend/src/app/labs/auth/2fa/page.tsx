export default function LabsAuthTwoFactorPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-violet-700">
          Edge Case
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">
          Segundo factor por email
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Este caso se usa para una práctica avanzada de BDD y API testing. No
          hace falta activarlo en el flujo inicial del laboratorio, pero
          conviene dejarlo visible como variante controlada.
        </p>
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-900">
          <p>
            <strong>Endpoints:</strong>
          </p>
          <ul className="mt-2 space-y-2">
            <li>
              <code>POST /api/v1/auth/2fa/send-code</code>
            </li>
            <li>
              <code>POST /api/v1/auth/2fa/complete-login</code>
            </li>
            <li>
              <code>GET /api/v1/auth/2fa/status</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
