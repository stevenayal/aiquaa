import { Metadata } from 'next';
import Link from 'next/link';
import {
  API_CHALLENGE_MIN_FINDINGS,
  API_CHALLENGE_MIN_TEST_CASES,
  API_CHALLENGE_TARGETS,
} from './data/apiChallengeTargets';
import {
  API_CHALLENGE_EVALUATION_CRITERIA,
  API_CHALLENGE_TOTAL_SCORE,
} from './data/evaluationCriteria';

export const metadata: Metadata = {
  title: 'API Testing - Challenge Practico | AIQUAA',
  description:
    'Prueba tecnica flexible de API Testing con APIs publicas: Rick and Morty, Chuck Norris o NASA.',
  keywords: [
    'API testing',
    'prueba tecnica QA',
    'testing de APIs',
    'Postman',
    'contrato API',
    'QA',
    'AIQUAA',
    'evaluacion practica',
  ],
  openGraph: {
    title: 'API Testing - Challenge Practico | AIQUAA',
    description:
      'Elegi una API publica, disena casos, documenta hallazgos y recibe un score flexible de 100 pts.',
    url: 'https://aiquaa.com/assessments/api-banking',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=API%20Testing%20Challenge&subtitle=Prueba%20tecnica%20replicable%20con%20APIs%20publicas&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'API Testing Challenge - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Testing - Challenge Practico | AIQUAA',
    description: 'Prueba tecnica replicable con APIs publicas.',
    images: [
      '/api/og?title=API%20Testing%20Challenge&subtitle=Prueba%20tecnica%20replicable&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/api-banking',
  },
};

export default function ApiBankingLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              API Testing
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
              Flexible
            </span>
            <span className="text-xs text-slate-400">90-120 min</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            API Testing Challenge
            <span className="block text-slate-400 font-normal text-xl mt-1">
              Prueba tecnica replicable con APIs publicas
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Elegi una API publica, disena casos de prueba, ejecuta requests
            reales y documenta hallazgos con evidencia. La evaluacion premia
            cobertura, reproducibilidad y criterio QA.
          </p>
        </div>

        <div className="grid gap-5">
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              APIs disponibles
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {API_CHALLENGE_TARGETS.map((target) => (
                <div
                  key={target.id}
                  className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {target.shortName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {target.recommendedFor}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              Que vas a practicar
            </h2>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Lectura de documentacion y contrato de API.</li>
              <li>Diseno de casos positivos, negativos, borde y contrato.</li>
              <li>Ejecucion reproducible con URLs, parametros y evidencias.</li>
              <li>Analisis de schema, status codes, filtros y paginacion.</li>
              <li>Reporte profesional de bugs, riesgos o mejoras testables.</li>
              <li>Resumen ejecutivo con hallazgos y recomendacion final.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              Como se evalua
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              La evaluacion suma {API_CHALLENGE_TOTAL_SCORE} puntos. No se exige
              encontrar bugs reales: tambien cuentan riesgos, inconsistencias,
              limitaciones y mejoras testables si estan bien justificadas.
            </p>
            <div className="space-y-3">
              {API_CHALLENGE_EVALUATION_CRITERIA.map((criterion) => (
                <div
                  key={criterion.key}
                  className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700"
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
                    <span className="shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                      {criterion.maxScore} pts
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {criterion.fullCredit}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              Entregables minimos
            </h2>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside">
              <li>Elegir una de las APIs disponibles al iniciar.</li>
              <li>
                Crear al menos {API_CHALLENGE_MIN_TEST_CASES} casos de prueba.
              </li>
              <li>
                Documentar al menos {API_CHALLENGE_MIN_FINDINGS} hallazgos:
                bugs, riesgos, inconsistencias, limitaciones o mejoras.
              </li>
              <li>Escribir un resumen ejecutivo antes de enviar.</li>
            </ol>
          </section>
        </div>

        <div className="flex gap-3">
          <Link
            href="/assessments/api-banking/start"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Iniciar challenge
          </Link>
          <Link
            href="/assessments"
            className="inline-flex items-center px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors"
          >
            Ver todos
          </Link>
        </div>
      </div>
    </main>
  );
}
