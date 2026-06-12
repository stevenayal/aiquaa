'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import type { AssessmentResultSummary } from '../types';
import StrengthsWeaknessesPanel from './StrengthsWeaknessesPanel';

export default function AssessmentResultScreen({
  result,
  startHref = '/assessments/api-testing-fundamentals/start',
  fallbackRecommendation = 'Seguí practicando escenarios de API con foco en reglas de negocio.',
}: {
  result: AssessmentResultSummary;
  startHref?: string;
  fallbackRecommendation?: string;
}) {
  const { isDarkMode } = useTheme();
  const score = result.attempt.total_score ?? 0;
  const percentage = result.attempt.percentage ?? 0;

  return (
    <div
      className={`min-h-screen px-4 py-12 ${
        isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-8 text-slate-50 shadow-2xl shadow-cyan-950/20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Resultado final
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold">{result.assessment.title}</h1>
              <p className="mt-3 max-w-3xl text-slate-300">
                Evaluación completada. Este resumen combina scoring automático y
                heurístico por nivel.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-5 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                Score total
              </p>
              <p className="mt-2 text-5xl font-bold">
                {score}
                <span className="text-2xl text-slate-300">/100</span>
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {percentage}% · {result.attempt.candidate_level}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {result.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Nivel {section.order_index}
                </p>
                <h2 className="mt-3 text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-2xl font-bold text-cyan-200">
                  {section.score}/{section.max_score}
                </p>
                <p className="mt-3 text-sm text-slate-400">
                  {section.feedback}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <StrengthsWeaknessesPanel
              title="Fortalezas"
              tone="strength"
              items={
                result.attempt.strengths && result.attempt.strengths.length > 0
                  ? result.attempt.strengths
                  : ['Todavía no se identificaron fortalezas automáticas.']
              }
            />
            <StrengthsWeaknessesPanel
              title="Debilidades"
              tone="weakness"
              items={
                result.attempt.weaknesses &&
                result.attempt.weaknesses.length > 0
                  ? result.attempt.weaknesses
                  : [
                      'No se registraron debilidades importantes en esta corrida.',
                    ]
              }
            />
            <StrengthsWeaknessesPanel
              title="Recomendaciones"
              tone="recommendation"
              items={
                result.attempt.recommendations &&
                result.attempt.recommendations.length > 0
                  ? result.attempt.recommendations
                  : [fallbackRecommendation]
              }
            />
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <h3 className="text-xl font-semibold">Feedback por nivel</h3>
            <div className="mt-4 space-y-4">
              {result.feedback.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
                >
                  <p className="text-sm font-semibold text-cyan-200">
                    Nivel {entry.level}
                  </p>
                  <p className="mt-2 text-sm text-slate-200">{entry.message}</p>
                  {entry.recommendations.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.recommendations.map((recommendation) => (
                        <span
                          key={recommendation}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                        >
                          {recommendation}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={startHref}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Reintentar assessment
            </Link>
            <Link
              href="/perfil"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Ver mi historial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
