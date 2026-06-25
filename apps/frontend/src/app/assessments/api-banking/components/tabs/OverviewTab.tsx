import {
  API_CHALLENGE_MIN_FINDINGS,
  API_CHALLENGE_MIN_SUMMARY_CHARS,
  API_CHALLENGE_MIN_TEST_CASES,
  getApiChallengeTarget,
  type ApiChallengeTargetId,
} from '../../data/apiChallengeTargets';

interface Props {
  apiTarget: ApiChallengeTargetId;
}

export function OverviewTab({ apiTarget }: Props) {
  const target = getApiChallengeTarget(apiTarget);

  return (
    <div className="space-y-5 text-sm text-slate-700 dark:text-slate-300">
      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Contexto de la prueba
        </h2>
        <p>
          Tu rol es QA Engineer. Debes auditar una API publica, documentar una
          estrategia de prueba reproducible y reportar hallazgos con evidencia.
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/50">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            API elegida: {target.name}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {target.description}
          </p>
          {target.apiKeyNote && (
            <p className="mt-2 text-blue-700 dark:text-blue-300">
              {target.apiKeyNote}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Instrucciones
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
          <li>Revisa la documentacion y los endpoints sugeridos.</li>
          <li>
            Ejecuta requests reales con una herramienta como Postman, curl o
            navegador.
          </li>
          <li>
            Disena casos positivos, negativos, borde, contrato y seguridad
            cuando aplique.
          </li>
          <li>
            Documenta hallazgos: bugs, riesgos, inconsistencias, limitaciones o
            mejoras testables.
          </li>
          <li>
            Incluye evidencia reproducible: URL, status code, body relevante y
            datos usados.
          </li>
          <li>Escribe un resumen ejecutivo y envia tu trabajo.</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Tareas sugeridas
        </h2>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
          {target.tasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Entregables minimos
        </h2>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
          <li>{API_CHALLENGE_MIN_TEST_CASES} casos de prueba variados.</li>
          <li>
            {API_CHALLENGE_MIN_FINDINGS} hallazgos o reportes reproducibles.
          </li>
          <li>
            Resumen ejecutivo de al menos {API_CHALLENGE_MIN_SUMMARY_CHARS}{' '}
            caracteres.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Riesgos a observar
        </h2>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
          {target.risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Distribucion de puntaje
        </h2>
        <div className="space-y-1">
          {[
            { label: 'Diseno de casos de prueba', pts: 30 },
            { label: 'Ejecucion y evidencia', pts: 25 },
            { label: 'Analisis de contrato y datos', pts: 20 },
            { label: 'Calidad de reportes', pts: 15 },
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
