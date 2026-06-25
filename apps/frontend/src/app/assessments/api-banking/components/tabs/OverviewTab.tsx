import {
  API_CHALLENGE_MIN_FINDINGS,
  API_CHALLENGE_MIN_SUMMARY_CHARS,
  API_CHALLENGE_MIN_TEST_CASES,
  getApiChallengeTarget,
  type ApiChallengeTargetId,
} from '../../data/apiChallengeTargets';
import {
  API_CHALLENGE_EVALUATION_CRITERIA,
  API_CHALLENGE_TOTAL_SCORE,
} from '../../data/evaluationCriteria';

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
          Criterio de evaluacion
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Total: {API_CHALLENGE_TOTAL_SCORE} puntos. La correccion premia
          criterio QA, claridad y reproducibilidad. No dependes de encontrar un
          bug real en la API publica.
        </p>
        <div className="space-y-3">
          {API_CHALLENGE_EVALUATION_CRITERIA.map((criterion) => (
            <div
              key={criterion.key}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {criterion.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {criterion.summary}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {criterion.maxScore} pts
                </span>
              </div>
              <ul className="mt-2 list-disc list-inside space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                {criterion.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
