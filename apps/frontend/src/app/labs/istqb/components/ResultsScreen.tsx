'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ExamResult } from '../types';
import { exportToCSV, downloadCSV, formatTime } from '../utils';

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
              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                <span className="text-3xl block mb-2">🏆</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Puntaje</p>
                <p className="text-2xl font-bold">{result.score}</p>
              </div>

              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <span className="text-3xl block mb-2">✓</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correctas</p>
                <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
              </div>

              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <span className="text-3xl block mb-2">✗</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Incorrectas</p>
                <p className="text-2xl font-bold text-red-600">{result.incorrectAnswers}</p>
              </div>

              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <span className="text-3xl block mb-2">⏱️</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo</p>
                <p className="text-2xl font-bold">{formatTime(result.timeSpent)}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className={`flex justify-between mb-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                <span className="font-medium">Porcentaje de Acierto</span>
                <span className="font-bold">{result.percentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    result.passed ? 'bg-green-600' : 'bg-red-600'
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
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Fortalezas Identificadas:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {result.learningObjectiveAnalysis
                        .filter((lo) => lo.percentage >= 70)
                        .slice(0, 5)
                        .map((lo) => (
                          <li key={lo.learningObjective} className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                              {lo.learningObjective}: {lo.correctAnswers}/{lo.totalQuestions} ({lo.percentage.toFixed(0)}%)
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

                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Áreas de Mejora:</h4>
                    <ul className="space-y-1 text-sm">
                      {result.learningObjectiveAnalysis
                        .filter((lo) => lo.percentage < 70)
                        .slice(0, 5)
                        .map((lo) => (
                          <li key={lo.learningObjective} className="flex items-center gap-2">
                            <span className="text-red-600">✗</span>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                              {lo.learningObjective}: {lo.correctAnswers}/{lo.totalQuestions} ({lo.percentage.toFixed(0)}%)
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
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Análisis por Learning Objective
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Desempeño en cada objetivo de aprendizaje del syllabus ISTQB CTFL v4.0
                  </p>
                </div>
                {result.learningObjectiveAnalysis.map((lo) => (
                  <div key={lo.learningObjective} className="space-y-2">
                    <div className={`flex justify-between items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="font-medium">{lo.learningObjective}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lo.correctAnswers} / {lo.totalQuestions} ({lo.percentage.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          lo.percentage >= 70 ? 'bg-green-600' : lo.percentage >= 50 ? 'bg-amber-600' : 'bg-red-600'
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
                    className={`rounded-lg border-2 ${
                      answer.isCorrect
                        ? isDarkMode
                          ? 'border-green-700 bg-slate-700/50'
                          : 'border-green-300 bg-white'
                        : isDarkMode
                        ? 'border-red-700 bg-slate-700/50'
                        : 'border-red-300 bg-white'
                    }`}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Pregunta {index + 1}
                          {answer.isCorrect ? (
                            <span className="ml-2 text-green-600">✓</span>
                          ) : (
                            <span className="ml-2 text-red-600">✗</span>
                          )}
                        </h3>
                        <div className="flex gap-2 text-sm">
                          <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                            {answer.learningObjective}
                          </span>
                          <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                            {answer.kLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{answer.questionText}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Tu Respuesta:
                          </h4>
                          <p
                            className={`p-2 rounded ${
                              answer.isCorrect
                                ? isDarkMode
                                  ? 'bg-green-900/30 text-green-300'
                                  : 'bg-green-100 text-green-900'
                                : isDarkMode
                                ? 'bg-red-900/30 text-red-300'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {answer.userAnswer.join(', ') || 'Sin responder'}
                          </p>
                        </div>

                        {!answer.isCorrect && (
                          <div>
                            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Respuesta Correcta:
                            </h4>
                            <p className={`p-2 rounded ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-900'}`}>
                              {answer.correctAnswer.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {!answer.isCorrect && (
                        <div className="mt-4">
                          <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Explicación:</h4>
                          <div className="space-y-2 text-sm">
                            {Object.entries(answer.explanations).map(([label, exp]) => (
                              <div
                                key={label}
                                className={`p-3 rounded border-l-4 ${
                                  exp.correct
                                    ? isDarkMode
                                      ? 'bg-green-900/20 border-green-500'
                                      : 'bg-green-50 border-green-500'
                                    : isDarkMode
                                    ? 'bg-slate-700/50'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Opción {label}: {exp.correct ? '(Correcta)' : '(Incorrecta)'}
                                </span>
                                <p className={`mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{exp.explanation}</p>
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
