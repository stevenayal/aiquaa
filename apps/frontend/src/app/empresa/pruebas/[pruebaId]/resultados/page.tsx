'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getPruebaAction,
  listIntentosAction,
  listPreguntasAction,
  type EmpresaPrueba,
  type EmpresaIntentoSummary,
  type EmpresaPreguntaRow,
} from '@/actions/empresa-pruebas';
import type { EmpresaScoreResult } from '@/actions/lib/empresa-scoring';

// Default "passed" threshold for the ranking bar color when the prueba has
// no explicit passing score — matches the platform-wide 60% convention.
const RANKING_PASS_THRESHOLD = 60;

function getIntentoTimeSpentSeconds(intento: EmpresaIntentoSummary): number {
  if (!intento.started_at || !intento.submitted_at) return 0;
  const started = new Date(intento.started_at).getTime();
  const submitted = new Date(intento.submitted_at).getTime();
  return Math.max(0, Math.round((submitted - started) / 1000));
}

function mins(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function getPercentage(intento: EmpresaIntentoSummary): number | null {
  return intento.score !== null && intento.max_score
    ? Math.round((intento.score / intento.max_score) * 100)
    : null;
}

function getDisplayName(intento: EmpresaIntentoSummary) {
  return (
    intento.candidate_name || intento.candidate_email || 'Candidato sin nombre'
  );
}

export default function ResultadosPage() {
  const { isDarkMode } = useTheme();
  const params = useParams<{ pruebaId: string }>();
  const pruebaId = params.pruebaId;

  const [prueba, setPrueba] = useState<EmpresaPrueba | null>(null);
  const [intentos, setIntentos] = useState<EmpresaIntentoSummary[]>([]);
  const [preguntas, setPreguntas] = useState<EmpresaPreguntaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'recientes' | 'ranking'>(
    'recientes'
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPruebaAction(pruebaId),
      listIntentosAction(pruebaId),
      listPreguntasAction(pruebaId),
    ]).then(([pruebaRes, intentosRes, preguntasRes]) => {
      setPrueba(pruebaRes.data);
      setIntentos(intentosRes.data ?? []);
      setPreguntas(preguntasRes.data ?? []);
      setError(pruebaRes.error ?? intentosRes.error ?? preguntasRes.error);
      setLoading(false);
    });
  }, [pruebaId]);

  const cardClass = `rounded-xl border p-5 ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`;
  const preguntasById = new Map(preguntas.map((p) => [p.id, p]));

  const ranking = [...intentos]
    .filter((i) => i.submitted_at && i.max_score)
    .sort((a, b) => (getPercentage(b) ?? 0) - (getPercentage(a) ?? 0));

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link
              href={`/empresa/pruebas/${pruebaId}`}
              className={`text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
            >
              ← {prueba?.title ?? 'Prueba'}
            </Link>
            <h1
              className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Resultados
            </h1>
          </div>

          {intentos.length > 0 && (
            <div
              className={`flex rounded-lg border overflow-hidden shrink-0 ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}
            >
              {(['recientes', 'ranking'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'text-slate-300 hover:bg-slate-700'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {mode === 'recientes' ? '☰ Recientes' : '📊 Ranking'}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
            Cargando...
          </p>
        ) : intentos.length === 0 ? (
          <div className={cardClass}>
            <p
              className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Todavía nadie rindió esta prueba.
            </p>
          </div>
        ) : viewMode === 'ranking' ? (
          <div className={cardClass}>
            {ranking.length === 0 ? (
              <p
                className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Todavía no hay intentos enviados para rankear.
              </p>
            ) : (
              <div className="space-y-3">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Ranking por puntaje — {ranking.length} candidato
                  {ranking.length === 1 ? '' : 's'}
                </p>
                {ranking.map((intento, index) => {
                  const percentage = getPercentage(intento) ?? 0;
                  const passed = percentage >= RANKING_PASS_THRESHOLD;
                  return (
                    <div
                      key={intento.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}
                    >
                      <span
                        className={`text-sm font-bold w-6 text-center shrink-0 ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                              ? 'text-slate-400'
                              : index === 2
                                ? 'text-amber-600'
                                : isDarkMode
                                  ? 'text-slate-500'
                                  : 'text-gray-400'
                        }`}
                      >
                        {index === 0
                          ? '🥇'
                          : index === 1
                            ? '🥈'
                            : index === 2
                              ? '🥉'
                              : `${index + 1}`}
                      </span>
                      <div className="min-w-0 w-36 shrink-0">
                        <p
                          className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          {getDisplayName(intento)}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div
                          className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold w-12 text-right shrink-0 ${passed ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {percentage}%
                      </span>
                      <span
                        className={`text-xs w-16 text-right shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                      >
                        {mins(getIntentoTimeSpentSeconds(intento))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {intentos.map((intento) => {
              const breakdown =
                (intento.breakdown as EmpresaScoreResult[] | null) ?? [];
              const answers =
                (intento.answers as Record<string, unknown> | null) ?? {};
              const percentage = getPercentage(intento);
              const hasAutoScored = breakdown.some((b) => b.autoScored);
              const isExpanded = expandedId === intento.id;
              const timeSpentSeconds = getIntentoTimeSpentSeconds(intento);

              return (
                <div key={intento.id} className={cardClass}>
                  <div
                    className="flex items-start justify-between gap-4 flex-wrap cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : intento.id)
                    }
                  >
                    <div>
                      <p
                        className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                      >
                        {getDisplayName(intento)}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                      >
                        {intento.submitted_at
                          ? `Enviado ${new Date(intento.submitted_at).toLocaleString()} · ${mins(timeSpentSeconds)}`
                          : 'En progreso'}
                      </p>
                      {hasAutoScored && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          Incluye puntaje automático — revisar
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {intento.score !== null && intento.max_score !== null ? (
                        <p
                          className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          {intento.score}/{intento.max_score}
                          {percentage !== null && (
                            <span
                              className={`text-xs font-normal ml-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              ({percentage}%)
                            </span>
                          )}
                        </p>
                      ) : (
                        <p
                          className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                        >
                          Sin enviar
                        </p>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      className={`mt-4 pt-4 border-t space-y-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
                    >
                      {breakdown.map((result) => {
                        const pregunta = preguntasById.get(result.questionId);
                        if (!pregunta) return null;
                        return (
                          <div key={result.questionId} className="text-sm">
                            <p
                              className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                            >
                              {pregunta.prompt}{' '}
                              <span
                                className={
                                  result.isCorrect
                                    ? 'text-green-600'
                                    : 'text-red-500'
                                }
                              >
                                ({result.score}/{result.maxScore})
                              </span>
                              {result.autoScored && (
                                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                  automático — revisar
                                </span>
                              )}
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              Respuesta:{' '}
                              {JSON.stringify(answers[result.questionId] ?? '')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
