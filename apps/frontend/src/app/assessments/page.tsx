import Link from 'next/link';
import { apiDeveloperFundamentalsDefinition } from './api-developer-fundamentals/data/assessment-definition';
import { apiDotnetFundamentalsDefinition } from './api-dotnet-fundamentals/data/assessment-definition';
import { cicdFundamentalsDefinition } from './cicd-fundamentals/data/assessment-definition';
import { apiTestingFundamentalsDefinition } from './api-testing-fundamentals/data/assessment-definition';
import { databaseFundamentalsDefinition } from './database-fundamentals/data/assessment-definition';
import { dockerFundamentalsDefinition } from './docker-fundamentals/data/assessment-definition';
import { databasePracticeDefinition } from './database-practice/data/assessment-definition';
import { gherkinFundamentalsDefinition } from './gherkin-fundamentals/data/assessment-definition';
import { infrastructureFundamentalsDefinition } from './infrastructure-fundamentals/data/assessment-definition';
import { kubernetesHelmFundamentalsDefinition } from './kubernetes-helm-fundamentals/data/assessment-definition';
import { observabilityFundamentalsDefinition } from './observability-fundamentals/data/assessment-definition';
import { playwrightFundamentalsDefinition } from './playwright-fundamentals/data/assessment-definition';
import { clase3DataPersistenciaDefinition } from './clase3-data-persistencia/data/assessment-definition';
import { clase5KubernetesDefinition } from './clase5-kubernetes/data/assessment-definition';
import { clase6ConfigKubernetesDefinition } from './clase6-config-kubernetes/data/assessment-definition';
import { clase78SeqLoggingDefinition } from './clase7-8-seq-logging/data/assessment-definition';
import { clase9CicdGithubActionsDefinition } from './clase9-cicd-github-actions/data/assessment-definition';

export default function AssessmentsIndexPage() {
  const overview = apiTestingFundamentalsDefinition;
  const assessmentCards = [
    {
      definition: clase3DataPersistenciaDefinition,
      badge: 'Examen teórico · Auto-corregido',
      badgeColor: 'text-amber-300',
      accentColor: 'text-violet-200',
      buttonClass: 'bg-violet-500 hover:bg-violet-400',
    },
    {
      definition: clase5KubernetesDefinition,
      badge: 'Examen teórico · Auto-corregido',
      badgeColor: 'text-amber-300',
      accentColor: 'text-blue-200',
      buttonClass: 'bg-blue-500 hover:bg-blue-400',
    },
    {
      definition: clase6ConfigKubernetesDefinition,
      badge: 'Examen teórico · Auto-corregido',
      badgeColor: 'text-amber-300',
      accentColor: 'text-teal-200',
      buttonClass: 'bg-teal-500 hover:bg-teal-400',
    },
    {
      definition: clase78SeqLoggingDefinition,
      badge: 'Examen teórico · Auto-corregido',
      badgeColor: 'text-amber-300',
      accentColor: 'text-emerald-200',
      buttonClass: 'bg-emerald-500 hover:bg-emerald-400',
    },
    {
      definition: clase9CicdGithubActionsDefinition,
      badge: 'Examen teórico · Auto-corregido',
      badgeColor: 'text-amber-300',
      accentColor: 'text-orange-200',
      buttonClass: 'bg-orange-500 hover:bg-orange-400',
    },
    {
      definition: databaseFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido',
      badgeColor: 'text-amber-300',
      accentColor: 'text-cyan-200',
      buttonClass: 'bg-cyan-500 hover:bg-cyan-400',
    },
    {
      definition: databasePracticeDefinition,
      badge: 'Challenge práctico · Auto-corregido',
      badgeColor: 'text-emerald-300',
      accentColor: 'text-emerald-200',
      buttonClass: 'bg-emerald-500 hover:bg-emerald-400',
    },
    {
      definition: infrastructureFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido',
      badgeColor: 'text-amber-300',
      accentColor: 'text-sky-200',
      buttonClass: 'bg-sky-500 hover:bg-sky-400',
    },
    {
      definition: apiDeveloperFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido · Desarrollo',
      badgeColor: 'text-amber-300',
      accentColor: 'text-indigo-200',
      buttonClass: 'bg-indigo-500 hover:bg-indigo-400',
    },
    {
      definition: apiDotnetFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido · .NET',
      badgeColor: 'text-amber-300',
      accentColor: 'text-violet-200',
      buttonClass: 'bg-violet-500 hover:bg-violet-400',
    },
    {
      definition: dockerFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido · Docker',
      badgeColor: 'text-amber-300',
      accentColor: 'text-blue-200',
      buttonClass: 'bg-blue-500 hover:bg-blue-400',
    },
    {
      definition: kubernetesHelmFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido · Kubernetes',
      badgeColor: 'text-amber-300',
      accentColor: 'text-sky-200',
      buttonClass: 'bg-sky-500 hover:bg-sky-400',
    },
    {
      definition: observabilityFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido · Observabilidad',
      badgeColor: 'text-amber-300',
      accentColor: 'text-teal-200',
      buttonClass: 'bg-teal-500 hover:bg-teal-400',
    },
    {
      definition: cicdFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido · CI/CD',
      badgeColor: 'text-amber-300',
      accentColor: 'text-orange-200',
      buttonClass: 'bg-orange-500 hover:bg-orange-400',
    },
    {
      definition: playwrightFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido · Playwright',
      badgeColor: 'text-amber-300',
      accentColor: 'text-fuchsia-200',
      buttonClass: 'bg-fuchsia-500 hover:bg-fuchsia-400',
    },
    {
      definition: gherkinFundamentalsDefinition,
      badge: 'Examen teórico · Auto-corregido · BDD',
      badgeColor: 'text-amber-300',
      accentColor: 'text-lime-200',
      buttonClass: 'bg-lime-500 hover:bg-lime-400',
    },
  ];

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

          {/* Database Fundamentals + Database Practice + Infrastructure Fundamentals */}
          {assessmentCards.map((card) => (
            <div
              key={card.definition.slug}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p
                    className={`text-sm font-semibold uppercase tracking-[0.2em] ${card.badgeColor}`}
                  >
                    {card.badge}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">
                    {card.definition.title}
                  </h2>
                  <p className="mt-3 text-slate-300">
                    {card.definition.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="rounded-full border border-slate-700 px-3 py-1">
                      {card.definition.type}
                    </span>
                    <span className="rounded-full border border-slate-700 px-3 py-1">
                      {card.definition.level}
                    </span>
                    <span className="rounded-full border border-slate-700 px-3 py-1">
                      {card.definition.duration_minutes} min
                    </span>
                    <span className="rounded-full border border-slate-700 px-3 py-1">
                      {card.definition.total_score} puntos
                    </span>
                  </div>
                </div>
                <Link
                  href={`/assessments/${card.definition.slug}`}
                  className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950 transition ${card.buttonClass}`}
                >
                  Ver assessment
                </Link>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {card.definition.sections.map((section) => (
                  <div
                    key={section.slug}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.18em] ${card.accentColor}`}
                    >
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
          ))}

          {/* API Testing Challenge */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Challenge practico - Auto-corregido - Flexible
                </p>
                <h2 className="mt-2 text-3xl font-bold">
                  API Testing{' '}
                  <span className="font-normal text-slate-400">
                    - Challenge practico con APIs publicas
                  </span>
                </h2>
                <p className="mt-3 text-slate-300">
                  Elegi entre Rick and Morty, Chuck Norris o NASA. Disena casos
                  reproducibles, documenta hallazgos y genera un reporte
                  profesional. Auto-scoring flexible de 100 pts.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    API Testing
                  </span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    Semi Senior
                  </span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    90-120 min
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
                  label: 'Diseno de tests',
                  pts: 30,
                  desc: 'Variedad y cobertura',
                },
                {
                  label: 'Evidencia',
                  pts: 25,
                  desc: 'Requests reproducibles',
                },
                {
                  label: 'Contrato y datos',
                  pts: 15,
                  desc: 'Schema, errores, filtros',
                },
                {
                  label: 'Reportes',
                  pts: 20,
                  desc: 'Impacto y prioridad',
                },
                { label: 'Resumen', pts: 10, desc: 'Sintesis ejecutiva' },
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
