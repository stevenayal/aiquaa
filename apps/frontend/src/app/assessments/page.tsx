import {
  assessmentCategories,
  assessmentCount,
} from '@/lib/assessmentsCatalog';
import { getMyAssessmentProgressAction } from '@/actions/assessments';
import AssessmentsCatalog, {
  type CatalogItem,
} from './_components/AssessmentsCatalog';

export const metadata = {
  title: 'Evaluaciones técnicas | AIQUAA',
  description:
    'Evaluaciones técnicas de QA, DevOps y backend con corrección automática.',
};

/**
 * Índice de evaluaciones.
 *
 * Sigue siendo Server Component: acá se resuelve la sesión y el progreso, y al
 * cliente solo viaja `AssessmentsCatalog` con los datos que el filtro necesita
 * leer. Las definiciones completas (secciones, preguntas, metadata de scoring)
 * se quedan en el servidor.
 */
export default async function AssessmentsIndexPage() {
  const { hasSession, progress } = await getMyAssessmentProgressAction();

  const items: CatalogItem[] = assessmentCategories.flatMap((category) =>
    category.assessments.map((entry) => {
      const p = progress[entry.definition.slug];
      const status: CatalogItem['status'] = p?.passed
        ? 'passed'
        : p?.inProgress
          ? 'in_progress'
          : p && p.bestPercentage > 0
            ? 'attempted'
            : 'new';

      return {
        slug: entry.definition.slug,
        title: entry.definition.title,
        description: entry.definition.description,
        level: entry.definition.level,
        durationMinutes: entry.definition.duration_minutes,
        totalScore: entry.definition.total_score,
        icon: entry.icon,
        categoryId: category.id,
        categoryName: category.name,
        featured: Boolean(entry.featured),
        status,
        bestPercentage: p?.bestPercentage ?? 0,
      };
    })
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
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

        <AssessmentsCatalog
          items={items}
          categories={assessmentCategories.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
          }))}
          hasSession={hasSession}
        />
      </div>
    </div>
  );
}
