import Link from 'next/link';
import {
  assessmentCategories,
  assessmentCount,
  featuredAssessments,
  type AssessmentEntry,
} from '@/lib/assessmentsCatalog';
import {
  getMyAssessmentProgressAction,
  type AssessmentProgress,
} from '@/actions/assessments';

export const metadata = {
  title: 'Evaluaciones técnicas | AIQUAA',
  description:
    'Evaluaciones técnicas de QA, DevOps y backend con corrección automática.',
};

/**
 * Estado del usuario sobre una evaluación, en una sola mirada.
 *
 * Efecto Von Restorff: si todo se ve igual, nada resalta. "Aprobado" en verde
 * es lo único que rompe la uniformidad de la tarjeta, así que lo ya logrado se
 * distingue de un vistazo sin tener que leer cada título.
 */
function ProgressBadge({ progress }: { progress?: AssessmentProgress }) {
  if (!progress) return null;

  if (progress.passed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">
        Aprobado · {progress.bestPercentage}%
      </span>
    );
  }

  if (progress.inProgress) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-400/15 dark:text-amber-300">
        En curso
      </span>
    );
  }

  if (progress.bestPercentage > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Mejor: {progress.bestPercentage}%
      </span>
    );
  }

  return null;
}

function AssessmentCard({
  entry,
  progress,
}: {
  entry: AssessmentEntry;
  progress?: AssessmentProgress;
}) {
  const { definition, icon } = entry;
  const href = `/assessments/${definition.slug}`;
  const cta = progress?.inProgress
    ? 'Continuar'
    : progress?.passed
      ? 'Volver a rendir'
      : 'Ver evaluación';

  return (
    <article className="relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-cyan-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-cyan-500">
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl" aria-hidden="true">
          {icon}
        </span>
        <ProgressBadge progress={progress} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
        {/*
          El enlace envuelve el título y se estira sobre toda la tarjeta con
          ::after. Así el área clickeable es la tarjeta entera (Ley de Fitts)
          pero el nombre accesible del enlace sigue siendo el título, en vez de
          todo el texto de la tarjeta leído de corrido.
        */}
        <Link
          href={href}
          className="after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
        >
          {definition.title}
        </Link>
      </h3>

      {/*
        line-clamp: las descripciones van de 90 a 400 caracteres. Sin recortar,
        una tarjeta triplica la altura de su vecina y la grilla se desarma.
      */}
      <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
        {definition.description}
      </p>

      {/*
        Miller: tres datos, no los siete chips de antes. Nivel, duración y
        puntaje son los que se comparan al elegir; el resto está adentro.
      */}
      <dl className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
          <dt className="sr-only">Nivel</dt>
          <dd>{definition.level}</dd>
        </div>
        <div className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
          <dt className="sr-only">Duración</dt>
          <dd>{definition.duration_minutes} min</dd>
        </div>
        <div className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
          <dt className="sr-only">Puntaje total</dt>
          <dd>{definition.total_score} pts</dd>
        </div>
      </dl>

      <p className="mt-5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
        {cta} <span aria-hidden="true">→</span>
      </p>
    </article>
  );
}

export default async function AssessmentsIndexPage() {
  const progress = await getMyAssessmentProgressAction();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-400/30 dark:text-cyan-200">
            AIQUAA Assessments
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Evaluaciones técnicas con foco real en criterio QA
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
            {assessmentCount} evaluaciones con corrección automática, agrupadas
            por tema. Miden comprensión conceptual, análisis de contratos,
            diseño de casos y calidad de reporte.
          </p>
        </header>

        {/*
          Efecto de Posición en Serie: lo primero de una lista es lo que se
          recuerda. Antes el orden era histórico y lo más valioso quedaba en el
          medio de 5.000 px de scroll.
        */}
        <section aria-labelledby="destacados" className="mb-14">
          <h2
            id="destacados"
            className="text-xl font-semibold text-slate-900 dark:text-white"
          >
            ⭐ Para empezar
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Las evaluaciones más representativas del perfil QA.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredAssessments.map((entry) => (
              <AssessmentCard
                key={entry.definition.slug}
                entry={entry}
                progress={progress[entry.definition.slug]}
              />
            ))}
          </div>
        </section>

        <div className="space-y-14">
          {assessmentCategories.map((category) => (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <h2
                id={`cat-${category.id}`}
                className="text-xl font-semibold text-slate-900 dark:text-white"
              >
                {category.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {category.description}
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.assessments.map((entry) => (
                  <AssessmentCard
                    key={entry.definition.slug}
                    entry={entry}
                    progress={progress[entry.definition.slug]}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
