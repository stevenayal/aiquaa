'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ExamResult } from '../types';
import { exportToCSV, downloadCSV, formatTime } from '../utils';
import { useSubmitResults } from '../hooks/useSubmitResults';

interface ResultsScreenProps {
  result: ExamResult;
  onReset: () => void;
  mode: 'exam' | 'training';
}

export default function ResultsScreen({
  result,
  onReset,
  mode,
}: ResultsScreenProps) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'summary' | 'learning-objectives' | 'details'>('summary');
  const { emailSent } = useSubmitResults(result, mode);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Enviar resultados al backend automáticamente al cargar la pantalla
    const submitResults = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantName: result.participantName,
            participantEmail: undefined,
            startTime: new Date(Date.now() - result.timeSpent * 1000).toISOString(),
            endTime: new Date().toISOString(),
            timeSpent: result.timeSpent,
            score: result.score,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctAnswers,
            incorrectAnswers: result.incorrectAnswers,
            percentage: result.percentage,
            passed: result.passed,
            mode: mode.toUpperCase() as 'EXAM' | 'TRAINING',
            answers: result.answers,
            learningObjectiveAnalysis: result.learningObjectiveAnalysis,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Resultados enviados exitosamente:', data);
          setEmailSent(true);
        } else {
          console.error('Error enviando resultados:', await response.text());
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
    };

    submitResults();
  }, [result, mode]);

  const handleExportCSV = () => {
    const csv = exportToCSV(result);
    const filename = `istqb-resultado-${result.participantName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  return (
    <div className={`min-h-screen py-8 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            AIQUAA | Simulacro CTFL v4.0
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Resultados del Examen</p>
        </div>

        <div className={`rounded-lg shadow-lg mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {result.participantName}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Modo: {mode === 'exam' ? 'Examen' : 'Entrenamiento'}
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleExportCSV}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 md:flex-none ${
                    isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                      : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                  }`}
                >
                  📥 Exportar CSV
                </button>
                <button
                  onClick={onReset}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex-1 md:flex-none"
                >
                  🔄 Nuevo Intento
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              result.passed
                ? isDarkMode
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-green-50 border-green-300'
                : isDarkMode
                ? 'bg-red-900/20 border-red-700'
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{result.passed ? '🏆' : '✗'}</span>
                  <span className={`text-lg font-semibold ${
                    result.passed
                      ? isDarkMode ? 'text-green-300' : 'text-green-900'
                      : isDarkMode ? 'text-red-300' : 'text-red-900'
                  }`}>
                    {result.passed ? '¡APROBADO!' : 'NO APROBADO'}
                  </span>
                </div>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {result.score} / {result.totalQuestions}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`text-center p-5 rounded-xl border-2 shadow-sm ${
                isDarkMode
                  ? 'bg-amber-900/30 border-amber-700'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <span className="text-4xl block mb-2">🏆</span>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>Puntaje</p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>{result.score}</p>
              </div>

              <div className={`text-center p-5 rounded-xl border-2 shadow-sm ${
                isDarkMode
                  ? 'bg-green-900/30 border-green-700'
                  : 'bg-green-50 border-green-200'
              }`}>
                <span className="text-4xl block mb-2">✓</span>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Correctas</p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>{result.correctAnswers}</p>
              </div>

              <div className={`text-center p-5 rounded-xl border-2 shadow-sm ${
                isDarkMode
                  ? 'bg-red-900/30 border-red-700'
                  : 'bg-red-50 border-red-200'
              }`}>
                <span className="text-4xl block mb-2">✗</span>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Incorrectas</p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>{result.incorrectAnswers}</p>
              </div>

              <div className={`text-center p-5 rounded-xl border-2 shadow-sm ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-4xl block mb-2">⏱️</span>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Tiempo</p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{formatTime(result.timeSpent)}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className={`flex justify-between mb-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                <span className="font-semibold">Porcentaje de Acierto</span>
                <span className="font-bold text-base">{result.percentage.toFixed(2)}%</span>
              </div>
              <div className={`w-full rounded-full h-3 shadow-inner ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-3 rounded-full transition-all shadow-sm ${
                    result.passed
                      ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
                      : isDarkMode ? 'bg-red-500' : 'bg-red-600'
                  }`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'summary'
                    ? isDarkMode
                      ? 'bg-slate-700 text-white border-b-2 border-amber-500'
                      : 'bg-white text-gray-900 border-b-2 border-amber-600'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎯 Resumen
              </button>
              <button
                onClick={() => setActiveTab('learning-objectives')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'learning-objectives'
                    ? isDarkMode
                      ? 'bg-slate-700 text-white border-b-2 border-amber-500'
                      : 'bg-white text-gray-900 border-b-2 border-amber-600'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Por LO
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'details'
                    ? isDarkMode
                      ? 'bg-slate-700 text-white border-b-2 border-amber-500'
                      : 'bg-white text-gray-900 border-b-2 border-amber-600'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✓ Detalles
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resultado:</h3>
                  <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                    {result.passed ? (
                      <>
                        ¡Felicitaciones! Has aprobado el simulacro con un puntaje de{' '}
                        <strong>{result.score}</strong> sobre {result.totalQuestions}, logrando un{' '}
                        <strong>{result.percentage.toFixed(2)}%</strong> de aciertos. El puntaje mínimo requerido es 26 puntos (65%).
                      </>
                    ) : (
                      <>
                        No has alcanzado el puntaje mínimo de aprobación. Obtuviste <strong>{result.score}</strong> puntos sobre{' '}
                        {result.totalQuestions}, equivalente a un <strong>{result.percentage.toFixed(2)}%</strong>. Se requieren al menos 26 puntos (65%) para aprobar. Te recomendamos revisar las áreas de mejora identificadas y volver a intentarlo.
                      </>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className={`p-5 rounded-xl border-2 shadow-sm ${
                    isDarkMode
                      ? 'border-green-700 bg-green-900/20'
                      : 'border-green-200 bg-green-50/50'
                  }`}>
                    <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                      isDarkMode ? 'text-green-300' : 'text-green-900'
                    }`}>
                      <span className="text-xl">💪</span>
                      Fortalezas Identificadas:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {result.learningObjectiveAnalysis
                        .filter((lo) => lo.percentage >= 70)
                        .slice(0, 5)
                        .map((lo) => (
                          <li key={lo.learningObjective} className="flex items-center gap-2">
                            <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>✓</span>
                            <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                              {lo.learningObjective}: <strong>{lo.correctAnswers}/{lo.totalQuestions}</strong> ({lo.percentage.toFixed(0)}%)
                            </span>
                          </li>
                        ))}
                      {result.learningObjectiveAnalysis.filter((lo) => lo.percentage >= 70).length === 0 && (
                        <li className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                          Ninguna área con desempeño sobresaliente identificada.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className={`p-5 rounded-xl border-2 shadow-sm ${
                    isDarkMode
                      ? 'border-amber-700 bg-amber-900/20'
                      : 'border-amber-200 bg-amber-50/50'
                  }`}>
                    <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                      isDarkMode ? 'text-amber-300' : 'text-amber-900'
                    }`}>
                      <span className="text-xl">📚</span>
                      Áreas de Mejora:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {result.learningObjectiveAnalysis
                        .filter((lo) => lo.percentage < 70)
                        .slice(0, 5)
                        .map((lo) => (
                          <li key={lo.learningObjective} className="flex items-center gap-2">
                            <span className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}>⚠</span>
                            <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                              {lo.learningObjective}: <strong>{lo.correctAnswers}/{lo.totalQuestions}</strong> ({lo.percentage.toFixed(0)}%)
                            </span>
                          </li>
                        ))}
                      {result.learningObjectiveAnalysis.filter((lo) => lo.percentage < 70).length === 0 && (
                        <li className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                          ¡Excelente! No se identificaron áreas débiles significativas.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning-objectives' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-2xl">📊</span>
                    Análisis por Learning Objective
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Desempeño en cada objetivo de aprendizaje del syllabus ISTQB CTFL v4.0
                  </p>
                </div>
                {result.learningObjectiveAnalysis.map((lo) => (
                  <div key={lo.learningObjective} className={`p-4 rounded-xl border-2 shadow-sm space-y-2 ${
                    lo.percentage >= 70
                      ? isDarkMode ? 'border-green-700 bg-green-900/10' : 'border-green-200 bg-green-50/30'
                      : lo.percentage >= 50
                      ? isDarkMode ? 'border-amber-700 bg-amber-900/10' : 'border-amber-200 bg-amber-50/30'
                      : isDarkMode ? 'border-red-700 bg-red-900/10' : 'border-red-200 bg-red-50/30'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {lo.learningObjective}
                      </span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        lo.percentage >= 70
                          ? isDarkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'
                          : lo.percentage >= 50
                          ? isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-800'
                          : isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-800'
                      }`}>
                        {lo.correctAnswers} / {lo.totalQuestions} ({lo.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 shadow-inner ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-3 rounded-full transition-all shadow-sm ${
                          lo.percentage >= 70
                            ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
                            : lo.percentage >= 50
                            ? isDarkMode ? 'bg-amber-500' : 'bg-amber-600'
                            : isDarkMode ? 'bg-red-500' : 'bg-red-600'
                        }`}
                        style={{ width: `${lo.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-4">
                {result.answers.map((answer, index) => (
                  <div
                    key={answer.questionId}
                    className={`rounded-xl border-2 shadow-sm ${
                      answer.isCorrect
                        ? isDarkMode
                          ? 'border-green-700 bg-green-900/10'
                          : 'border-green-300 bg-green-50/30'
                        : isDarkMode
                        ? 'border-red-700 bg-red-900/10'
                        : 'border-red-300 bg-red-50/30'
                    }`}
                  >
                    <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start gap-3">
                        <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Pregunta {index + 1}
                          {answer.isCorrect ? (
                            <span className={`text-2xl ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                          ) : (
                            <span className={`text-2xl ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>✗</span>
                          )}
                        </h3>
                        <div className="flex gap-2 text-sm flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full font-medium border ${
                            isDarkMode
                              ? 'bg-blue-900/40 text-blue-300 border-blue-700'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>
                            {answer.learningObjective}
                          </span>
                          <span className={`px-3 py-1 rounded-full font-semibold border ${
                            isDarkMode
                              ? 'bg-amber-900/40 text-amber-300 border-amber-700'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {answer.kLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{answer.questionText}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {answer.isCorrect ? (
                              <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>✓</span>
                            ) : (
                              <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>✗</span>
                            )}
                            Tu Respuesta:
                          </h4>
                          <p
                            className={`p-3 rounded-lg font-medium border-2 ${
                              answer.isCorrect
                                ? isDarkMode
                                  ? 'bg-green-900/30 text-green-300 border-green-700'
                                  : 'bg-green-100 text-green-900 border-green-300'
                                : isDarkMode
                                ? 'bg-red-900/30 text-red-300 border-red-700'
                                : 'bg-red-100 text-red-900 border-red-300'
                            }`}
                          >
                            {answer.userAnswer.join(', ') || 'Sin responder'}
                          </p>
                        </div>

                        {!answer.isCorrect && (
                          <div>
                            <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>✓</span>
                              Respuesta Correcta:
                            </h4>
                            <p className={`p-3 rounded-lg font-medium border-2 ${
                              isDarkMode
                                ? 'bg-green-900/30 text-green-300 border-green-700'
                                : 'bg-green-100 text-green-900 border-green-300'
                            }`}>
                              {answer.correctAnswer.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {!answer.isCorrect && (
                        <div className="mt-4">
                          <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <span className="text-xl">💡</span>
                            Explicación:
                          </h4>
                          <div className="space-y-2 text-sm">
                            {Object.entries(answer.explanations).map(([label, exp]) => (
                              <div
                                key={label}
                                className={`p-3 rounded-lg border-l-4 ${
                                  exp.correct
                                    ? isDarkMode
                                      ? 'bg-green-900/20 border-green-500'
                                      : 'bg-green-50 border-green-500'
                                    : isDarkMode
                                    ? 'bg-slate-700/50 border-slate-600'
                                    : 'bg-gray-50 border-gray-300'
                                }`}
                              >
                                <span className={`font-semibold ${
                                  exp.correct
                                    ? isDarkMode ? 'text-green-300' : 'text-green-900'
                                    : isDarkMode ? 'text-slate-200' : 'text-gray-900'
                                }`}>
                                  Opción {label}: {exp.correct ? '✓ (Correcta)' : '✗ (Incorrecta)'}
                                </span>
                                <p className={`mt-1 ${
                                  exp.correct
                                    ? isDarkMode ? 'text-green-200' : 'text-green-800'
                                    : isDarkMode ? 'text-slate-300' : 'text-gray-700'
                                }`}>{exp.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
