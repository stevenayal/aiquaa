export function OverviewTab() {
  return (
    <div className="space-y-5 text-sm text-slate-700 dark:text-slate-300">
      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Contexto del negocio
        </h2>
        <p>
          FinTech PY es un banco digital que procesa transferencias entre
          cuentas en guaraníes (PYG). Tu rol es QA Engineer contratado para
          auditar la API antes del lanzamiento a producción.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Instrucciones
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
          <li>
            Revisá la documentación de endpoints en la tab{' '}
            <strong>API Docs</strong>.
          </li>
          <li>Explorá la API usando las credenciales de prueba.</li>
          <li>
            Diseñá casos de prueba positivos, negativos, de borde y de
            seguridad.
          </li>
          <li>Identificá y documentá los bugs que encuentres.</li>
          <li>Escribí un resumen ejecutivo con tus hallazgos.</li>
          <li>
            Enviá tu trabajo usando el botón <strong>Finalizar</strong>.
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Credenciales de prueba
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              user: 'Usuario A',
              email: 'user.a@aiquaa.test',
              pass: 'Test1234!',
              id: 'usr_001',
              account: 'acc_001',
              balance: '₲ 5.000.000',
            },
            {
              user: 'Usuario B',
              email: 'user.b@aiquaa.test',
              pass: 'Test1234!',
              id: 'usr_002',
              account: 'acc_002',
              balance: '₲ 2.500.000',
            },
          ].map((u) => (
            <div
              key={u.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-1 font-mono text-xs bg-slate-50 dark:bg-slate-800/50"
            >
              <p className="font-sans font-semibold text-slate-700 dark:text-slate-300 not-italic">
                {u.user}
              </p>
              <p>
                <span className="text-slate-400">email: </span>
                {u.email}
              </p>
              <p>
                <span className="text-slate-400">pass: </span>
                {u.pass}
              </p>
              <p>
                <span className="text-slate-400">userId:</span>
                {u.id}
              </p>
              <p>
                <span className="text-slate-400">cuenta:</span>
                {u.account}
              </p>
              <p>
                <span className="text-slate-400">saldo: </span>
                {u.balance}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Entregables esperados
        </h2>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
          <li>Casos de prueba positivos, negativos, de borde y de seguridad</li>
          <li>Bug reports con severidad, prioridad y pasos para reproducir</li>
          <li>Resumen ejecutivo con hallazgos, riesgos y recomendaciones</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Distribución de puntaje
        </h2>
        <div className="space-y-1">
          {[
            { label: 'Diseño de casos de prueba', pts: 25 },
            { label: 'Validación API (status, body, contrato)', pts: 25 },
            { label: 'Seguridad (JWT, permisos)', pts: 20 },
            { label: 'Calidad del bug report', pts: 20 },
            { label: 'Resumen ejecutivo', pts: 10 },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                {row.label}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {row.pts} pts
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
