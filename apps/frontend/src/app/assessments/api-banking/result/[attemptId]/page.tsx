import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  RUBRIC_CATEGORIES,
  RUBRIC_THRESHOLDS,
  SCORE_MAX,
} from '../../lib/scoring';
import {
  DEFAULT_API_TARGET_ID,
  getApiChallengeTarget,
} from '../../data/apiChallengeTargets';

interface Props {
  params: { attemptId: string };
}

function getRubricLabel(
  score: number,
  max: number
): { label: string; color: string } {
  const ratio = score / max;
  if (ratio >= RUBRIC_THRESHOLDS.excellent)
    return { label: 'Excelente', color: 'text-green-600 dark:text-green-400' };
  if (ratio >= RUBRIC_THRESHOLDS.acceptable)
    return { label: 'Aceptable', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'A mejorar', color: 'text-red-600 dark:text-red-400' };
}

export default async function ResultPage({ params }: Props) {
  const attemptId = Number(params.attemptId);

  if (isNaN(attemptId)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Attempt no valido.</p>
      </main>
    );
  }

  const supabase = createAdminClient();
  const [attemptRes, scoreRes] = await Promise.all([
    supabase.from('qac_attempts').select('*').eq('id', attemptId).single(),
    supabase
      .from('qac_scores')
      .select('*')
      .eq('attempt_id', attemptId)
      .single(),
  ]);

  const attempt = attemptRes.data;
  const score = scoreRes.data;

  if (!attempt || !score) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-slate-500 dark:text-slate-400">
            {!attempt
              ? 'Attempt no encontrado.'
              : 'El challenge todavia no fue enviado.'}
          </p>
          <Link
            href="/assessments"
            className="text-sm text-blue-600 hover:underline"
          >
            Volver a Assessments
          </Link>
        </div>
      </main>
    );
  }

  const target = getApiChallengeTarget(
    attempt.api_target || DEFAULT_API_TARGET_ID
  );
  const categories = RUBRIC_CATEGORIES.map((category) => ({
    ...category,
    score: Number(score[category.key]),
  }));

  const totalScore = Number(score.total_score);
  const passed = totalScore >= 60;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{passed ? 'OK' : 'QA'}</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Resultado del challenge
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {attempt.candidate_name} - API Testing Challenge - {target.name}
          </p>
        </div>

        <div
          className={`rounded-xl border p-6 text-center space-y-2 ${
            passed
              ? 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/10'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
          }`}
        >
          <p className="text-5xl font-bold text-slate-900 dark:text-white">
            {totalScore.toFixed(1)}
            <span className="text-xl text-slate-400 font-normal"> / 100</span>
          </p>
          <p
            className={`text-sm font-medium ${passed ? 'text-green-700 dark:text-green-400' : 'text-slate-500'}`}
          >
            {passed ? 'Aprobado' : 'No aprobado (min. 60)'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">
            Cobertura de evaluacion
          </h2>
          <div className="space-y-3">
            {categories.map((cat) => {
              const pct = Math.round((cat.score / cat.max) * 100);
              const rubric = getRubricLabel(cat.score, cat.max);
              return (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      {cat.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${rubric.color}`}>
                        {rubric.label}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {cat.score.toFixed(1)} / {cat.max}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 90
                          ? 'bg-green-500'
                          : pct >= 60
                            ? 'bg-amber-500'
                            : 'bg-red-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">
            Rubrica aplicada
          </h2>
          <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-400">
            <p>Diseno de casos: {SCORE_MAX.testDesign} pts.</p>
            <p>Ejecucion y evidencia: {SCORE_MAX.apiValidation} pts.</p>
            <p>Analisis de contrato y datos: {SCORE_MAX.security} pts.</p>
            <p>Calidad de reportes: {SCORE_MAX.bugReporting} pts.</p>
            <p>Resumen ejecutivo: {SCORE_MAX.executiveSummary} pts.</p>
          </div>
        </div>

        {score.feedback && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-2">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              Feedback
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {score.feedback}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/assessments/api-banking"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Volver a intentar
          </Link>
          <Link
            href="/assessments"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors"
          >
            Todos los assessments
          </Link>
        </div>
      </div>
    </main>
  );
}
