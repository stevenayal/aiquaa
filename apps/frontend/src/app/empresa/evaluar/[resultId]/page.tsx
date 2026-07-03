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

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

type BugReviewMap = Record<
  string,
  { approved: boolean; evaluatorNotes: string }
>;

const SEVERITY_COLORS: Record<Severity, { bg: string; text: string }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-800' },
  High: { bg: 'bg-orange-100', text: 'text-orange-800' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Low: { bg: 'bg-green-100', text: 'text-green-800' },
};

const REVIEW_STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: 'Pendiente', color: 'bg-gray-100 text-gray-600' },
  pending_correction: {
    text: '⏳ Pendiente de corrección',
    color: 'bg-amber-100 text-amber-700',
  },
  in_review: { text: 'En revisión', color: 'bg-blue-100 text-blue-700' },
  reviewed: { text: '✅ Revisado', color: 'bg-green-100 text-green-700' },
};

const EXAM_LABEL = '🧪 Test App — Bug Hunt';

const IMAGE_URL_PATTERN = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|avif|svg)(\?\S*)?$/i;

function isImageUrl(value: string): boolean {
  return IMAGE_URL_PATTERN.test(value.trim());
}

function EvidencePreview({
  evidence,
  isDarkMode,
}: {
  evidence: string;
  isDarkMode: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const trimmed = evidence.trim();

  if (!imageFailed && isImageUrl(trimmed)) {
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block w-fit max-w-xs rounded-lg overflow-hidden border border-slate-600/40"
      >
        <img
          src={trimmed}
          alt="Evidencia"
          className="max-h-48 w-auto object-contain"
          onError={() => setImageFailed(true)}
        />
      </a>
    );
  }

  return (
    <p
      className={`text-sm mt-1 break-all ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
    >
      {trimmed}
    </p>
  );
}

export default function EvaluarPage() {
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

  const [bugReviews, setBugReviews] = useState<BugReviewMap>({});
  const [overallNotes, setOverallNotes] = useState('');
  const [adjustedScore, setAdjustedScore] = useState<number | null>(null);
  const [expandedBugId, setExpandedBugId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!resultId) return;
    const load = async () => {
      const { data, error } = await getExamDetailAction(resultId);
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setExam(data);

      const initialReviews: BugReviewMap = {};
      const bugs = data.metadata?.bugs ?? [];
      const savedReview = data.review_data;
      bugs.forEach((bug) => {
        const saved = savedReview?.bugs?.[bug.id];
        initialReviews[bug.id] = {
          approved: saved?.approved ?? true,
          evaluatorNotes: saved?.evaluatorNotes ?? '',
        };
      });
      setBugReviews(initialReviews);
      setOverallNotes(savedReview?.overallNotes ?? '');
      setAdjustedScore(savedReview?.adjustedScore ?? null);
      setLoading(false);
    };
    load();
  }, [resultId]);

  const bugs = exam?.metadata?.bugs ?? [];
  const autoScore = exam?.score ?? 0;

  const approvedCount = Object.values(bugReviews).filter(
    (r) => r.approved
  ).length;
  const rejectedCount = Object.values(bugReviews).filter(
    (r) => !r.approved
  ).length;

  const effectiveScore = adjustedScore != null ? adjustedScore : autoScore;
  const maxPoints = exam?.total_questions ?? 30;
  const effectivePercentage = maxPoints
    ? Math.round((effectiveScore / maxPoints) * 100)
    : 0;

  const updateBugReview = (
    bugId: string,
    updates: Partial<{ approved: boolean; evaluatorNotes: string }>
  ) => {
    setBugReviews((prev) => ({
      ...prev,
      [bugId]: { ...prev[bugId], ...updates },
    }));
  };

  const handleSave = async (status: 'in_review' | 'reviewed') => {
    setSaving(true);
    setSaveError(null);

    const passingScore = exam?.passing_score ?? Math.round(maxPoints * 0.6);
    const finalScore =
      status === 'reviewed'
        ? {
            score: effectiveScore,
            percentage: effectivePercentage,
            passed: effectiveScore >= passingScore,
          }
        : undefined;

    const { error } = await saveExamReviewAction(
      resultId,
      { bugs: bugReviews, overallNotes, adjustedScore },
      status,
      finalScore
    );

    setSaving(false);
    if (error) {
      setSaveError(error);
    } else {
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    }
  };

  const card = isDarkMode
    ? 'bg-dark-secondary border-slate-700'
    : 'bg-white border-gray-200';
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelClass = `text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`;

  if (authLoading || loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDarkMode ? 'bg-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`}
      >
        <p className="text-5xl">🔍</p>
        <p className="text-xl font-semibold">Resultado no encontrado</p>
        <Link
          href="/empresa/candidatos"
          className="text-indigo-400 hover:underline text-sm"
        >
          ← Volver a candidatos
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link
              href="/empresa/candidatos"
              className={`text-sm mb-2 inline-block ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ← Candidatos
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {exam?.participant_name || 'Sin nombre'}
              </h1>
              {exam?.review_status && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    REVIEW_STATUS_LABELS[exam.review_status]?.color ??
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  {REVIEW_STATUS_LABELS[exam.review_status]?.text ??
                    exam.review_status}
                </span>
              )}
            </div>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              {EXAM_LABEL}
            </p>
            {exam?.participant_email && (
              <p
                className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                {exam.participant_email}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {exam?.process_code && (
              <span
                className={`text-xs font-mono px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}
              >
                {exam.process_code}
              </span>
            )}
            <span
              className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              {exam?.created_at
                ? new Date(exam.created_at).toLocaleDateString('es-PY', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </span>
          </div>
        </div>

        {/* Score Overview */}
        <div className={`rounded-xl border p-6 ${card}`}>
          <h2
            className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Puntuación
          </h2>
          {exam?.review_status === 'pending_correction' && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                isDarkMode
                  ? 'bg-amber-900/30 border border-amber-700 text-amber-300'
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
              }`}
            >
              ⏳ El puntaje "Auto" se calcula por cantidad de bugs y heurísticas
              de texto, no valida que cada bug sea real ni evita duplicados.
              Revisá los bugs de abajo y confirmá o ajustá el puntaje antes de
              finalizar la revisión.
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
            >
              <p className={labelClass}>Auto</p>
              <p
                className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {autoScore}/{maxPoints}
              </p>
            </div>
            <div
              className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
            >
              <p className={labelClass}>Aprobados</p>
              <p className={`text-xl font-bold text-emerald-500`}>
                {approvedCount}/{bugs.length}
              </p>
            </div>
            <div
              className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
            >
              <p className={labelClass}>Rechazados</p>
              <p className={`text-xl font-bold text-red-500`}>
                {rejectedCount}/{bugs.length}
              </p>
            </div>
            <div
              className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}
            >
              <p className={labelClass}>Efectivo</p>
              <p
                className={`text-xl font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}
              >
                {effectiveScore}/{maxPoints}
              </p>
            </div>
            <div
              className={`text-center p-3 rounded-lg ${effectivePercentage >= 60 ? (isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100') : isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}
            >
              <p className={labelClass}>
                {effectivePercentage >= 60 ? 'Aprobado' : 'No aprobado'}
              </p>
              <p
                className={`text-xl font-bold ${effectivePercentage >= 60 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {effectivePercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Bugs List */}
        <div className={`rounded-xl border ${card}`}>
          <div
            className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
          >
            <h2
              className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Bugs Reportados ({bugs.length})
            </h2>
          </div>

          {bugs.length === 0 ? (
            <div
              className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              <p className="text-3xl mb-2">🐛</p>
              <p className="font-medium">Sin bugs reportados</p>
              <p className="text-sm mt-1">
                El candidato no documentó ningún bug
              </p>
            </div>
          ) : (
            <div className="divide-y divide-inherit">
              {bugs.map((bug, index) => {
                const review = bugReviews[bug.id];
                const isExpanded = expandedBugId === bug.id;
                const severityColor =
                  SEVERITY_COLORS[bug.severity as Severity] ??
                  SEVERITY_COLORS.Medium;

                return (
                  <div key={bug.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() =>
                          setExpandedBugId(isExpanded ? null : bug.id)
                        }
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                          >
                            #{index + 1}
                          </span>
                          <h3
                            className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {bug.title}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColor.bg} ${severityColor.text}`}
                          >
                            {bug.severity}
                          </span>
                          {bug.category && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {bug.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <label
                          className={`flex items-center gap-1.5 text-sm cursor-pointer select-none ${
                            review?.approved
                              ? 'text-emerald-500'
                              : isDarkMode
                                ? 'text-slate-500'
                                : 'text-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={review?.approved ?? true}
                            onChange={() =>
                              updateBugReview(bug.id, {
                                approved: !(review?.approved ?? true),
                              })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Aprobado
                        </label>
                        <button
                          onClick={() =>
                            setExpandedBugId(isExpanded ? null : bug.id)
                          }
                          className={`text-sm transition-colors ${
                            isDarkMode
                              ? 'text-slate-400 hover:text-slate-200'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 pl-6">
                        <div>
                          <p className={labelClass}>Descripción</p>
                          <p
                            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                          >
                            {bug.description || 'Sin descripción'}
                          </p>
                        </div>

                        <div>
                          <p className={labelClass}>Pasos para Reproducir</p>
                          <ol
                            className={`list-decimal list-inside text-sm mt-1 space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                          >
                            {bug.stepsToReproduce.map(
                              (step: string, i: number) => (
                                <li key={i}>{step}</li>
                              )
                            )}
                          </ol>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className={labelClass}>Resultado Esperado</p>
                            <p
                              className={`text-sm mt-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}
                            >
                              {bug.expectedResult}
                            </p>
                          </div>
                          <div>
                            <p className={labelClass}>Resultado Real</p>
                            <p
                              className={`text-sm mt-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}
                            >
                              {bug.actualResult}
                            </p>
                          </div>
                        </div>

                        {bug.evidence && (
                          <div>
                            <p className={labelClass}>Evidencia</p>
                            <EvidencePreview
                              evidence={bug.evidence}
                              isDarkMode={isDarkMode}
                            />
                          </div>
                        )}

                        {bug.images && bug.images.length > 0 && (
                          <div>
                            <p className={labelClass}>
                              Imágenes evidencia ({bug.images.length})
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                              {bug.images.map((image) => (
                                <a
                                  key={image.id}
                                  href={image.base64Data}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block rounded-lg overflow-hidden border border-slate-600/40"
                                >
                                  <img
                                    src={image.base64Data}
                                    alt={image.fileName}
                                    className="w-full h-32 object-cover"
                                  />
                                  <p
                                    className={`text-xs px-1.5 py-1 truncate ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'}`}
                                  >
                                    {image.fileName}
                                  </p>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                          >
                            Nota del evaluador
                          </label>
                          <textarea
                            value={review?.evaluatorNotes ?? ''}
                            onChange={(e) =>
                              updateBugReview(bug.id, {
                                evaluatorNotes: e.target.value,
                              })
                            }
                            rows={2}
                            className={inputClass}
                            placeholder="Ej: Bug bien documentado, pasos claros..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Evaluator Notes & Score Adjust */}
        <div className={`rounded-xl border p-6 ${card}`}>
          <h2
            className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Revisión del Evaluador
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Notas generales
              </label>
              <textarea
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Resumen de la evaluación, observaciones generales..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Puntaje ajustado{' '}
                  <span
                    className={`font-normal ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    (opcional — si se deja vacío, se usa el automático)
                  </span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={maxPoints}
                  value={adjustedScore ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAdjustedScore(v === '' ? null : parseInt(v, 10));
                  }}
                  placeholder={`Auto: ${autoScore}`}
                  className={inputClass}
                />
              </div>
              <div
                className={`flex items-end p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
              >
                <div>
                  <p className={labelClass}>Puntaje final</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {effectiveScore}/{maxPoints}
                  </p>
                  <p
                    className={`text-sm ${effectivePercentage >= 60 ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {effectivePercentage}%{' '}
                    {effectivePercentage >= 60 ? '✓ Aprobado' : '✗ No aprobado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`rounded-xl border p-6 ${card}`}>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSave('in_review')}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : '💾 Guardar borrador'}
            </button>
            <button
              onClick={() => handleSave('reviewed')}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : '✅ Finalizar revisión'}
            </button>
            <Link
              href="/empresa/candidatos"
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ← Volver
            </Link>
          </div>

          {saveError && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                isDarkMode
                  ? 'bg-red-900/30 border border-red-700 text-red-300'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {saveError}
            </div>
          )}
          {savedOk && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                isDarkMode
                  ? 'bg-emerald-900/30 border border-emerald-700 text-emerald-300'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              Revisión guardada correctamente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
