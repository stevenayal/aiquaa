'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import {
  getExamDetailAction,
  saveExamReviewAction,
  type ExamDetail,
} from '@/actions/exam-review';
import { getDesarrolloChallenge } from '@/lib/labs/desarrolloChallenges';

const PASSING_SCORE = 70;
const MAX_SCORE = 100;

const REVIEW_STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: 'Pendiente', color: 'bg-gray-100 text-gray-600' },
  pending_correction: {
    text: '⏳ Pendiente de corrección',
    color: 'bg-amber-100 text-amber-700',
  },
  in_review: { text: 'En revisión', color: 'bg-blue-100 text-blue-700' },
  reviewed: { text: '✅ Revisado', color: 'bg-green-100 text-green-700' },
};

export default function EvaluarDesarrolloPage() {
  const { isDarkMode } = useTheme();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const params = useParams();
  const router = useRouter();
  const resultId = params?.resultId as string;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const [score, setScore] = useState<number | null>(null);
  const [overallNotes, setOverallNotes] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!resultId) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await getExamDetailAction(resultId);
      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setExam(data);
      setOverallNotes(data.review_data?.overallNotes ?? '');
      setScore(
        data.review_data?.adjustedScore ??
          (data.review_status === 'reviewed' ? data.score : null)
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [resultId]);

  const submission =
    exam?.metadata && 'repoUrl' in exam.metadata ? exam.metadata : null;
  const challenge = submission
    ? getDesarrolloChallenge(submission.challengeId)
    : undefined;

  const handleSave = async (status: 'in_review' | 'reviewed') => {
    if (status === 'reviewed' && score == null) {
      setSaveError('Cargá un puntaje antes de finalizar la corrección.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const finalScore =
      status === 'reviewed' && score != null
        ? {
            score,
            percentage: score, // el máximo es 100, score y porcentaje coinciden
            passed: score >= PASSING_SCORE,
          }
        : undefined;

    const { error } = await saveExamReviewAction(
      resultId,
      { overallNotes, adjustedScore: score },
      status,
      finalScore
    );

    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 3000);
    if (status === 'reviewed') {
      setExam((prev) => (prev ? { ...prev, review_status: 'reviewed' } : prev));
    }
  };

  const cardClass = `rounded-xl border p-6 ${
    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
  }`;
  const mutedClass = isDarkMode ? 'text-slate-400' : 'text-gray-500';
  const labelClass = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;

  if (authLoading || loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (notFound || !exam) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDarkMode ? 'bg-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`}
      >
        <p className="text-lg font-semibold">Resultado no encontrado</p>
        <Link href="/empresa/candidatos" className="text-indigo-500 underline">
          Volver a candidatos
        </Link>
      </div>
    );
  }

  const statusLabel = REVIEW_STATUS_LABELS[exam.review_status] ?? {
    text: exam.review_status,
    color: 'bg-gray-100 text-gray-600',
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <header className="space-y-2">
          <Link
            href="/empresa/candidatos"
            className={`text-sm ${mutedClass} hover:underline`}
          >
            ← Volver a candidatos
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {challenge
                ? `${challenge.emoji} ${challenge.title}`
                : 'Prueba de desarrollo'}
            </h1>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusLabel.color}`}
            >
              {statusLabel.text}
            </span>
          </div>
          <p className={`text-sm ${mutedClass}`}>
            {exam.participant_name ?? 'Candidato sin nombre'}
            {exam.participant_email ? ` · ${exam.participant_email}` : ''}
            {exam.process_code ? ` · proceso ${exam.process_code}` : ''}
          </p>
        </header>

        {/* Entrega */}
        <section className={`${cardClass} space-y-4`}>
          <h2
            className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Entrega del candidato
          </h2>

          {submission ? (
            <>
              <div>
                <p className={labelClass}>Repositorio</p>
                <a
                  href={submission.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-indigo-500 underline break-all"
                >
                  {submission.repoUrl}
                </a>
                <p className={`text-xs mt-1 ${mutedClass}`}>
                  Link enviado por el candidato. Se abre en una pestaña nueva.
                </p>
              </div>

              {submission.githubUser ? (
                <div>
                  <p className={labelClass}>Usuario de GitHub</p>
                  <p
                    className={`text-sm font-mono ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    {submission.githubUser}
                  </p>
                </div>
              ) : null}

              {submission.notes ? (
                <div>
                  <p className={labelClass}>Notas del candidato</p>
                  <p
                    className={`text-sm whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    {submission.notes}
                  </p>
                </div>
              ) : null}

              <p className={`text-xs ${mutedClass}`}>
                Entregado el{' '}
                {new Date(
                  submission.submittedAt ?? exam.created_at
                ).toLocaleString('es-PY')}
              </p>
            </>
          ) : (
            <p className={`text-sm ${mutedClass}`}>
              Este resultado no tiene una entrega de repositorio asociada.
            </p>
          )}
        </section>

        {/* Consigna y criterios */}
        {challenge ? (
          <section className={`${cardClass} space-y-4`}>
            <h2
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Qué se le pidió ({challenge.clase})
            </h2>
            <ol
              className={`list-decimal space-y-2 pl-5 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
            >
              {challenge.consigna.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>

            <div>
              <p className={`${labelClass} mt-4`}>Criterios de evaluación</p>
              <ul
                className={`list-disc space-y-2 pl-5 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                {challenge.criteriosDeEvaluacion.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* Corrección */}
        <section className={`${cardClass} space-y-4`}>
          <h2
            className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Corrección
          </h2>

          <div>
            <label className={labelClass} htmlFor="puntaje">
              Puntaje (0 a {MAX_SCORE}) *
            </label>
            <input
              id="puntaje"
              type="number"
              min={0}
              max={MAX_SCORE}
              value={score ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  setScore(null);
                  return;
                }
                const parsed = Number(raw);
                if (Number.isNaN(parsed)) return;
                setScore(Math.min(MAX_SCORE, Math.max(0, Math.round(parsed))));
              }}
              className={`w-32 rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`text-xs mt-1 ${mutedClass}`}>
              Se aprueba con {PASSING_SCORE}.{' '}
              {score != null
                ? score >= PASSING_SCORE
                  ? 'Con este puntaje el candidato aprueba.'
                  : 'Con este puntaje el candidato no aprueba.'
                : ''}
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="comentarios">
              Comentarios para el candidato
            </label>
            <textarea
              id="comentarios"
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="Qué resolvió bien, qué faltó, qué reforzar..."
              className={`w-full min-h-32 rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {saveError && (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
              {saveError}
            </div>
          )}
          {savedOk && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              Cambios guardados.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleSave('in_review')}
              disabled={saving}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                isDarkMode
                  ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Guardar borrador
            </button>
            <button
              type="button"
              onClick={() => handleSave('reviewed')}
              disabled={saving || score == null}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Finalizar corrección'}
            </button>
          </div>
          <p className={`text-xs ${mutedClass}`}>
            Al finalizar la corrección, el puntaje cargado pasa a ser el puntaje
            oficial del examen y el candidato lo ve en su perfil.
          </p>
        </section>
      </div>
    </div>
  );
}
