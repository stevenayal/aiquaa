import Link from 'next/link';
import { apiTestingFundamentalsDefinition } from './api-testing-fundamentals/data/assessment-definition';

export default function AssessmentsIndexPage() {
  const overview = apiTestingFundamentalsDefinition;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            AIQUAA Assessments
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Evaluaciones técnicas con foco real en criterio QA
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Challenges progresivos para medir comprensión conceptual, análisis
            de contratos, diseño de casos y calidad de reporte.
          </p>
        </div>

        <div className="grid gap-6">
          {/* API Testing Fundamentals */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Examen teórico · Auto-corregido
                </p>
                <h2 className="mt-2 text-3xl font-bold">{overview.title}</h2>
                <p className="mt-3 text-slate-300">{overview.description}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    {overview.type}
                  </span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    {overview.level}
                  </span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    {overview.duration_minutes} min
                  </span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    {overview.total_score} puntos
                  </span>
                </div>
              </div>
              <Link
                href={`/assessments/${overview.slug}`}
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Ver assessment
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {overview.sections.map((section) => (
                <div
                  key={section.slug}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Nivel {section.order_index}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold text-slate-50">
                    {section.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {section.description}
                  </p>
                  <p className="mt-4 text-xs text-amber-300">
                    Máximo: {section.max_score} pts
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* QA API Challenge — Banking Transactions */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Challenge práctico · Auto-corregido · Semi Senior
                </p>
                <h2 className="mt-2 text-3xl font-bold">
                  API Banking{' '}
                  <span className="font-normal text-slate-400">
                    — Challenge práctico (Banking Transactions)
                  </span>
                </h2>
                <p className="mt-3 text-slate-300">
                  Explorá y testeá una API bancaria simulada. Identificá 12 bugs
                  intencionales, diseñá casos de prueba y generá un reporte
                  profesional. Auto-scoring de 100 pts.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    API Testing
                  </span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    Semi Senior
                  </span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    90–120 min
                  </span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    100 puntos
                  </span>
                </div>
              </div>
              <Link
                href="/assessments/api-banking"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Ver challenge
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                {
                  label: 'Diseño de tests',
                  pts: 25,
                  desc: 'Variedad y cobertura',
                },
                {
                  label: 'Validación API',
                  pts: 25,
                  desc: 'Bugs funcionales y contrato',
                },
                {
                  label: 'Seguridad',
                  pts: 20,
                  desc: 'IDOR, datos sensibles, auth',
                },
                {
                  label: 'Bug Reporting',
                  pts: 20,
                  desc: 'Calidad y completitud',
                },
                { label: 'Resumen', pts: 10, desc: 'Síntesis ejecutiva' },
              ].map((cat) => (
                <div
                  key={cat.label}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    {cat.pts} pts
                  </p>
                  <h3 className="mt-2 text-sm font-semibold text-slate-50">
                    {cat.label}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
