'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import type { AssessmentOverview } from '../types';

export default function AssessmentWelcome({
  overview,
  startHref = '/assessments/api-testing-fundamentals/start',
  evaluatesCopy = 'Fundamentos de API, criterio QA, diseño de casos, validación de respuestas y bug reporting.',
  scoringCopy = 'Automático en niveles 1, 2 y 4. Heurístico en niveles 3 y 5.',
  resultCopy = 'Score total, score por nivel, fortalezas, debilidades y temas a reforzar.',
  referenceLinks,
}: {
  overview: AssessmentOverview;
  startHref?: string;
  evaluatesCopy?: string;
  scoringCopy?: string;
  resultCopy?: string;
  /** Links a documentación oficial recomendados antes de empezar (opcional). */
  referenceLinks?: Array<{ label: string; href: string }>;
}) {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen px-4 py-12 ${
        isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 p-8 text-slate-50 shadow-2xl shadow-cyan-950/20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            AIQUAA Assessments
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            {overview.assessment.title}
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">
            {overview.assessment.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span className="rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1">
              {overview.assessment.type}
            </span>
            <span className="rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1">
              {overview.assessment.level}
            </span>
            <span className="rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1">
              {overview.assessment.duration_minutes} minutos sugeridos
            </span>
            <span className="rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1">
              {overview.assessment.total_score} puntos totales
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {overview.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  Nivel {section.order_index}
                </p>
                <h2 className="mt-3 text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {section.description}
                </p>
                <p className="mt-4 text-xs text-cyan-200">
                  Máximo: {section.max_score} pts
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Qué evalúa
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {evaluatesCopy}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Scoring
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {scoringCopy}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Resultado final
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {resultCopy}
              </p>
            </div>
          </div>

          {referenceLinks && referenceLinks.length > 0 ? (
            <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Documentación de referencia
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Te recomendamos repasar estos recursos oficiales antes de
                empezar.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {referenceLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={startHref}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Empezar assessment
            </Link>
            <Link
              href="/assessments"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Volver a catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
