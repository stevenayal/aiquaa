'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getIstqbLatamComparisonAction } from '@/actions/exams';
import type { ExamResult } from '../types';
import { exportToCSV, downloadCSV, formatTime } from '../utils';
import { generateExamPDF } from '../utils/pdfExport';
import { useSubmitResults } from '../hooks/useSubmitResults';

interface ResultsScreenProps {
  result: ExamResult;
  onReset: () => void;
  mode: 'exam' | 'training';
  language: 'es' | 'en';
}

interface LatamComparison {
  learningObjective: string;
  averagePercentage: number;
  sampleSize: number;
}

export default function ResultsScreen({
  result,
  onReset,
  mode,
  language,
}: ResultsScreenProps) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<
    'summary' | 'learning-objectives' | 'details'
  >('summary');
  const [expandedExplanations, setExpandedExplanations] = useState<Set<number>>(
    new Set()
  );
  const [latamComparison, setLatamComparison] = useState<LatamComparison[]>([]);
  const [latamLoading, setLatamLoading] = useState(true);
  const toggleExplanation = (questionId: number) => {
    setExpandedExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };
  const { saveError } = useSubmitResults(result, mode);

  useEffect(() => {
    let active = true;

    getIstqbLatamComparisonAction()
      .then((res) => {
        if (!active) return;
        setLatamComparison((res.data as LatamComparison[] | null) ?? []);
      })
      .catch(() => {
        if (active) setLatamComparison([]);
      })
      .finally(() => {
        if (active) setLatamLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const t = {
    es: {
      title: 'AIQUAA | Simulacro CTFL v4.0',
      subtitle: 'Resultados del Examen',
      modeExam: 'Examen',
      modeTraining: 'Entrenamiento',
      modeLabel: 'Modo',
      exportCSV: '📥 Exportar CSV',
      exportPDF: '📄 Exportar PDF',
      newAttempt: '🔄 Nuevo Intento',
      passed: '¡APROBADO!',
      failed: 'NO APROBADO',
      score: 'Puntaje',
      correct: 'Correctas',
      incorrect: 'Incorrectas',
      time: 'Tiempo',
      accuracy: 'Porcentaje de Acierto',
      tabSummary: '🎯 Resumen',
      tabLO: '📊 Por LO',
      tabDetails: '✓ Detalles',
      resultLabel: 'Resultado:',
      passMessage: (score: number, total: number, percentage: string) =>
        `¡Felicitaciones! Has aprobado el simulacro con un puntaje de <strong>${score}</strong> sobre ${total}, logrando un <strong>${percentage}%</strong> de aciertos. El puntaje mínimo requerido es 26 puntos (65%).`,
      failMessage: (score: number, total: number, percentage: string) =>
        `No has alcanzado el puntaje mínimo de aprobación. Obtuviste <strong>${score}</strong> puntos sobre ${total}, equivalente a un <strong>${percentage}%</strong>. Se requieren al menos 26 puntos (65%) para aprobar. Te recomendamos revisar las áreas de mejora identificadas y volver a intentarlo.`,
      strengths: 'Fortalezas Identificadas:',
      noStrengths: 'Ninguna área con desempeño sobresaliente identificada.',
      improvements: 'Áreas de Mejora:',
      noImprovements:
        '¡Excelente! No se identificaron áreas débiles significativas.',
      loAnalysis: 'Análisis por Learning Objective',
      loDescription:
        'Desempeño en cada objetivo de aprendizaje del syllabus ISTQB CTFL v4.0',
      communityComparison: 'Comparativa LATAM',
      communityLoading: 'Cargando comparativa...',
      communityNoData:
        'Aún no hay datos comunitarios suficientes para comparar este resultado.',
      yourResult: 'Tu resultado',
      latamAverage: 'Promedio LATAM',
      sample: 'muestra',
      saveErrorTitle: 'No pudimos guardar tu resultado',
      question: 'Pregunta',
      yourAnswer: 'Tu Respuesta:',
      correctAnswer: 'Respuesta Correcta:',
      noAnswer: 'Sin responder',
      explanation: 'Explicación:',
      option: 'Opción',
      correctOption: '✓ (Correcta)',
      incorrectOption: '✗ (Incorrecta)',
    },
    en: {
      title: 'AIQUAA | CTFL v4.0 Simulator',
      subtitle: 'Exam Results',
      modeExam: 'Exam',
      modeTraining: 'Training',
      modeLabel: 'Mode',
      exportCSV: '📥 Export CSV',
      exportPDF: '📄 Export PDF',
      newAttempt: '🔄 New Attempt',
      passed: 'PASSED!',
      failed: 'FAILED',
      score: 'Score',
      correct: 'Correct',
      incorrect: 'Incorrect',
      time: 'Time',
      accuracy: 'Accuracy Percentage',
      tabSummary: '🎯 Summary',
      tabLO: '📊 By LO',
      tabDetails: '✓ Details',
      resultLabel: 'Result:',
      passMessage: (score: number, total: number, percentage: string) =>
        `Congratulations! You passed the mock exam with a score of <strong>${score}</strong> out of ${total}, achieving <strong>${percentage}%</strong> accuracy. The minimum passing score is 26 points (65%).`,
      failMessage: (score: number, total: number, percentage: string) =>
        `You did not reach the minimum passing score. You obtained <strong>${score}</strong> points out of ${total}, equivalent to <strong>${percentage}%</strong>. At least 26 points (65%) are required to pass. We recommend reviewing the identified areas for improvement and trying again.`,
      strengths: 'Identified Strengths:',
      noStrengths: 'No outstanding performance areas identified.',
      improvements: 'Areas for Improvement:',
      noImprovements: 'Excellent! No significant weak areas identified.',
      loAnalysis: 'Analysis by Learning Objective',
      loDescription:
        'Performance in each learning objective of the ISTQB CTFL v4.0 syllabus',
      communityComparison: 'LATAM comparison',
      communityLoading: 'Loading comparison...',
      communityNoData:
        'There is not enough community data yet to compare this result.',
      yourResult: 'Your result',
      latamAverage: 'LATAM average',
      sample: 'sample',
      saveErrorTitle: 'We could not save your result',
      question: 'Question',
      yourAnswer: 'Your Answer:',
      correctAnswer: 'Correct Answer:',
      noAnswer: 'Unanswered',
      explanation: 'Explanation:',
      option: 'Option',
      correctOption: '✓ (Correct)',
      incorrectOption: '✗ (Incorrect)',
    },
  };

  const text = t[language as keyof typeof t];

  const handleExportCSV = () => {
    const csv = exportToCSV(result);
    const filename = `istqb-resultado-${result.participantName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };
  const handleExportPDF = () => {
    generateExamPDF(result, mode);
  };
  const latamByLearningObjective = new Map(
    latamComparison.map((item) => [item.learningObjective, item])
  );
  const hasLatamComparison = result.learningObjectiveAnalysis.some((lo) =>
    latamByLearningObjective.has(lo.learningObjective)
  );

  return (
    <div
      className={`min-h-screen py-8 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1
            className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {text.title}
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            {text.subtitle}
          </p>
        </div>

        <div
          className={`rounded-lg shadow-lg mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {result.participantName}
                </h2>
                <p
                  className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
                >
                  {text.modeLabel}:{' '}
                  {mode === 'exam' ? text.modeExam : text.modeTraining}
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
                  {text.exportCSV}
                </button>
                <button
                  onClick={handleExportPDF}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 md:flex-none ${
                    isDarkMode
                      ? 'bg-red-700 hover:bg-red-600 text-white border border-red-600'
                      : 'bg-red-600 hover:bg-red-700 text-white border border-red-700'
                  }`}
                >
                  {text.exportPDF}
                </button>
                <button
                  onClick={onReset}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex-1 md:flex-none"
                >
                  {text.newAttempt}
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div
              className={`mb-6 p-4 rounded-lg border-2 ${
                result.passed
                  ? isDarkMode
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-green-50 border-green-300'
                  : isDarkMode
                    ? 'bg-red-900/20 border-red-700'
                    : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{result.passed ? '🏆' : '✗'}</span>
                  <span
                    className={`text-lg font-semibold ${
                      result.passed
                        ? isDarkMode
                          ? 'text-green-300'
                          : 'text-green-900'
                        : isDarkMode
                          ? 'text-red-300'
                          : 'text-red-900'
                    }`}
                  >
                    {result.passed ? text.passed : text.failed}
                  </span>
                </div>
                <span
                  className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {result.score} / {result.totalQuestions}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`text-center p-5 rounded-xl border-2 shadow-sm ${
                  isDarkMode
                    ? 'bg-amber-900/30 border-amber-700'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <span className="text-4xl block mb-2">🏆</span>
                <p
                  className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}
                >
                  {text.score}
                </p>
                <p
                  className={`text-3xl font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}
                >
                  {result.score}
                </p>
              </div>

              <div
                className={`text-center p-5 rounded-xl border-2 shadow-sm ${
                  isDarkMode
                    ? 'bg-green-900/30 border-green-700'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <span className="text-4xl block mb-2">✓</span>
                <p
                  className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}
                >
                  {text.correct}
                </p>
                <p
                  className={`text-3xl font-bold ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}
                >
                  {result.correctAnswers}
                </p>
              </div>

              <div
                className={`text-center p-5 rounded-xl border-2 shadow-sm ${
                  isDarkMode
                    ? 'bg-red-900/30 border-red-700'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <span className="text-4xl block mb-2">✗</span>
                <p
                  className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}
                >
                  {text.incorrect}
                </p>
                <p
                  className={`text-3xl font-bold ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}
                >
                  {result.incorrectAnswers}
                </p>
              </div>

              <div
                className={`text-center p-5 rounded-xl border-2 shadow-sm ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-4xl block mb-2">⏱️</span>
                <p
                  className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  {text.time}
                </p>
                <p
                  className={`text-3xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}
                >
                  {formatTime(result.timeSpent)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div
                className={`flex justify-between mb-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                <span className="font-semibold">{text.accuracy}</span>
                <span className="font-bold text-base">
                  {result.percentage.toFixed(2)}%
                </span>
              </div>
              <div
                className={`w-full rounded-full h-3 shadow-inner ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
              >
                <div
                  className={`h-3 rounded-full transition-all shadow-sm ${
                    result.passed
                      ? isDarkMode
                        ? 'bg-green-500'
                        : 'bg-green-600'
                      : isDarkMode
                        ? 'bg-red-500'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {saveError && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 ${
              isDarkMode
                ? 'border-amber-700 bg-amber-900/20 text-amber-200'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
            role="alert"
          >
            <p className="font-semibold">{text.saveErrorTitle}</p>
            <p className="mt-1 text-sm opacity-90">{saveError}</p>
          </div>
        )}

        <div
          className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
        >
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
                {text.tabSummary}
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
                {text.tabLO}
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
                {text.tabDetails}
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div>
                  <h3
                    className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {text.resultLabel}
                  </h3>
                  <p
                    className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}
                    dangerouslySetInnerHTML={{
                      __html: result.passed
                        ? text.passMessage(
                            result.score,
                            result.totalQuestions,
                            result.percentage.toFixed(2)
                          )
                        : text.failMessage(
                            result.score,
                            result.totalQuestions,
                            result.percentage.toFixed(2)
                          ),
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div
                    className={`p-5 rounded-xl border-2 shadow-sm ${
                      isDarkMode
                        ? 'border-green-700 bg-green-900/20'
                        : 'border-green-200 bg-green-50/50'
                    }`}
                  >
                    <h4
                      className={`font-semibold mb-3 flex items-center gap-2 ${
                        isDarkMode ? 'text-green-300' : 'text-green-900'
                      }`}
                    >
                      <span className="text-xl">💪</span>
                      {text.strengths}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {result.learningObjectiveAnalysis
                        .filter((lo) => lo.percentage >= 70)
                        .slice(0, 5)
                        .map((lo) => (
                          <li
                            key={lo.learningObjective}
                            className="flex items-center gap-2"
                          >
                            <span
                              className={
                                isDarkMode ? 'text-green-400' : 'text-green-600'
                              }
                            >
                              ✓
                            </span>
                            <span
                              className={
                                isDarkMode ? 'text-slate-300' : 'text-gray-700'
                              }
                            >
                              {lo.learningObjective}:{' '}
                              <strong>
                                {lo.correctAnswers}/{lo.totalQuestions}
                              </strong>{' '}
                              ({lo.percentage.toFixed(0)}%)
                            </span>
                          </li>
                        ))}
                      {result.learningObjectiveAnalysis.filter(
                        (lo) => lo.percentage >= 70
                      ).length === 0 && (
                        <li
                          className={
                            isDarkMode ? 'text-slate-400' : 'text-gray-600'
                          }
                        >
                          {text.noStrengths}
                        </li>
                      )}
                    </ul>
                  </div>

                  <div
                    className={`p-5 rounded-xl border-2 shadow-sm ${
                      isDarkMode
                        ? 'border-amber-700 bg-amber-900/20'
                        : 'border-amber-200 bg-amber-50/50'
                    }`}
                  >
                    <h4
                      className={`font-semibold mb-3 flex items-center gap-2 ${
                        isDarkMode ? 'text-amber-300' : 'text-amber-900'
                      }`}
                    >
                      <span className="text-xl">📚</span>
                      {text.improvements}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {result.learningObjectiveAnalysis
                        .filter((lo) => lo.percentage < 70)
                        .slice(0, 5)
                        .map((lo) => (
                          <li
                            key={lo.learningObjective}
                            className="flex items-center gap-2"
                          >
                            <span
                              className={
                                isDarkMode ? 'text-amber-400' : 'text-amber-600'
                              }
                            >
                              ⚠
                            </span>
                            <span
                              className={
                                isDarkMode ? 'text-slate-300' : 'text-gray-700'
                              }
                            >
                              {lo.learningObjective}:{' '}
                              <strong>
                                {lo.correctAnswers}/{lo.totalQuestions}
                              </strong>{' '}
                              ({lo.percentage.toFixed(0)}%)
                            </span>
                          </li>
                        ))}
                      {result.learningObjectiveAnalysis.filter(
                        (lo) => lo.percentage < 70
                      ).length === 0 && (
                        <li
                          className={
                            isDarkMode ? 'text-slate-400' : 'text-gray-600'
                          }
                        >
                          {text.noImprovements}
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
                  <h3
                    className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    <span className="text-2xl">📊</span>
                    {text.loAnalysis}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
                  >
                    {text.loDescription}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 shadow-sm ${
                    isDarkMode
                      ? 'border-blue-700 bg-blue-900/10'
                      : 'border-blue-200 bg-blue-50/30'
                  }`}
                >
                  <h4
                    className={`font-semibold mb-3 flex items-center gap-2 ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-900'
                    }`}
                  >
                    <span className="text-xl">🌎</span>
                    {text.communityComparison}
                  </h4>
                  {latamLoading ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      <span
                        className={
                          isDarkMode ? 'text-slate-300' : 'text-gray-600'
                        }
                      >
                        {text.communityLoading}
                      </span>
                    </div>
                  ) : hasLatamComparison ? (
                    <div className="space-y-3">
                      {result.learningObjectiveAnalysis.map((lo) => {
                        const comparison = latamByLearningObjective.get(
                          lo.learningObjective
                        );
                        if (!comparison) return null;
                        const delta =
                          lo.percentage - comparison.averagePercentage;

                        return (
                          <div key={lo.learningObjective} className="space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                              <span
                                className={`font-semibold ${
                                  isDarkMode
                                    ? 'text-slate-100'
                                    : 'text-gray-900'
                                }`}
                              >
                                {lo.learningObjective}
                              </span>
                              <span
                                className={`font-bold ${
                                  delta >= 0
                                    ? isDarkMode
                                      ? 'text-emerald-300'
                                      : 'text-emerald-700'
                                    : isDarkMode
                                      ? 'text-amber-300'
                                      : 'text-amber-700'
                                }`}
                              >
                                {delta >= 0 ? '+' : ''}
                                {Math.round(delta)} pts
                              </span>
                            </div>
                            <p
                              className={`text-xs ${
                                isDarkMode ? 'text-slate-400' : 'text-gray-600'
                              }`}
                            >
                              {text.yourResult}: {lo.percentage.toFixed(0)}% ·{' '}
                              {text.latamAverage}:{' '}
                              {comparison.averagePercentage}% (
                              {comparison.sampleSize} {text.sample})
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}
                    >
                      {text.communityNoData}
                    </p>
                  )}
                </div>
                {result.learningObjectiveAnalysis.map((lo) => (
                  <div
                    key={lo.learningObjective}
                    className={`p-4 rounded-xl border-2 shadow-sm space-y-2 ${
                      lo.percentage >= 70
                        ? isDarkMode
                          ? 'border-green-700 bg-green-900/10'
                          : 'border-green-200 bg-green-50/30'
                        : lo.percentage >= 50
                          ? isDarkMode
                            ? 'border-amber-700 bg-amber-900/10'
                            : 'border-amber-200 bg-amber-50/30'
                          : isDarkMode
                            ? 'border-red-700 bg-red-900/10'
                            : 'border-red-200 bg-red-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}
                      >
                        {lo.learningObjective}
                      </span>
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-full ${
                          lo.percentage >= 70
                            ? isDarkMode
                              ? 'bg-green-900/40 text-green-300'
                              : 'bg-green-100 text-green-800'
                            : lo.percentage >= 50
                              ? isDarkMode
                                ? 'bg-amber-900/40 text-amber-300'
                                : 'bg-amber-100 text-amber-800'
                              : isDarkMode
                                ? 'bg-red-900/40 text-red-300'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {lo.correctAnswers} / {lo.totalQuestions} (
                        {lo.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div
                      className={`w-full rounded-full h-3 shadow-inner ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                    >
                      <div
                        className={`h-3 rounded-full transition-all shadow-sm ${
                          lo.percentage >= 70
                            ? isDarkMode
                              ? 'bg-green-500'
                              : 'bg-green-600'
                            : lo.percentage >= 50
                              ? isDarkMode
                                ? 'bg-amber-500'
                                : 'bg-amber-600'
                              : isDarkMode
                                ? 'bg-red-500'
                                : 'bg-red-600'
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
                    <div
                      className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <h3
                          className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          {text.question} {index + 1}
                          {answer.isCorrect ? (
                            <span
                              className={`text-2xl ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                            >
                              ✓
                            </span>
                          ) : (
                            <span
                              className={`text-2xl ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
                            >
                              ✗
                            </span>
                          )}
                        </h3>
                        <div className="flex gap-2 text-sm flex-shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full font-medium border ${
                              isDarkMode
                                ? 'bg-blue-900/40 text-blue-300 border-blue-700'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}
                          >
                            {answer.learningObjective}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full font-semibold border ${
                              isDarkMode
                                ? 'bg-amber-900/40 text-amber-300 border-amber-700'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {answer.kLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <p
                        className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {answer.questionText}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4
                            className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {answer.isCorrect ? (
                              <span
                                className={
                                  isDarkMode
                                    ? 'text-green-400'
                                    : 'text-green-600'
                                }
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                className={
                                  isDarkMode ? 'text-red-400' : 'text-red-600'
                                }
                              >
                                ✗
                              </span>
                            )}
                            {text.yourAnswer}
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
                            {answer.userAnswer.join(', ') || text.noAnswer}
                          </p>
                        </div>

                        {!answer.isCorrect && (
                          <div>
                            <h4
                              className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                              <span
                                className={
                                  isDarkMode
                                    ? 'text-green-400'
                                    : 'text-green-600'
                                }
                              >
                                ✓
                              </span>
                              {text.correctAnswer}
                            </h4>
                            <p
                              className={`p-3 rounded-lg font-medium border-2 ${
                                isDarkMode
                                  ? 'bg-green-900/30 text-green-300 border-green-700'
                                  : 'bg-green-100 text-green-900 border-green-300'
                              }`}
                            >
                              {answer.correctAnswer.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {(answer.isCorrect
                        ? expandedExplanations.has(answer.questionId)
                        : true) && (
                        <div className="mt-4">
                          <h4
                            className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            <span className="text-xl">💡</span>
                            {text.explanation}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {Object.entries(answer.explanations).map(
                              ([label, exp]) => (
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
                                  <span
                                    className={`font-semibold ${
                                      exp.correct
                                        ? isDarkMode
                                          ? 'text-green-300'
                                          : 'text-green-900'
                                        : isDarkMode
                                          ? 'text-slate-200'
                                          : 'text-gray-900'
                                    }`}
                                  >
                                    {text.option} {label}:{' '}
                                    {exp.correct
                                      ? text.correctOption
                                      : text.incorrectOption}
                                  </span>
                                  <p
                                    className={`mt-1 ${
                                      exp.correct
                                        ? isDarkMode
                                          ? 'text-green-200'
                                          : 'text-green-800'
                                        : isDarkMode
                                          ? 'text-slate-300'
                                          : 'text-gray-700'
                                    }`}
                                  >
                                    {exp.explanation}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {answer.isCorrect && (
                        <button
                          onClick={() => toggleExplanation(answer.questionId)}
                          className={`mt-3 text-xs font-medium flex items-center gap-1 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <span>💡</span>
                          {expandedExplanations.has(answer.questionId)
                            ? 'Ocultar explicación'
                            : 'Ver explicación'}
                        </button>
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
