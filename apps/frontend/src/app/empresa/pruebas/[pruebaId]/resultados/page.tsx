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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
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
        ) : (
          <div className="space-y-3">
            {intentos.map((intento) => {
              const breakdown =
                (intento.breakdown as EmpresaScoreResult[] | null) ?? [];
              const answers =
                (intento.answers as Record<string, unknown> | null) ?? {};
              const percentage =
                intento.score !== null && intento.max_score
                  ? Math.round((intento.score / intento.max_score) * 100)
                  : null;
              const hasAutoScored = breakdown.some((b) => b.autoScored);
              const isExpanded = expandedId === intento.id;

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
                        {intento.candidate_name ||
                          intento.candidate_email ||
                          'Candidato sin nombre'}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                      >
                        {intento.submitted_at
                          ? `Enviado ${new Date(intento.submitted_at).toLocaleString()}`
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
