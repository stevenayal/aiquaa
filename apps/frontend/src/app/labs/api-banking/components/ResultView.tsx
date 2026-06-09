'use client';

import { useTheme } from '@/contexts/ThemeContext';
import type { AssessmentScore } from '@/services/assessmentsService';

interface Props {
  score: AssessmentScore;
  candidateName: string;
  onRestart: () => void;
}

interface ScoreRow {
  label: string;
  value: number;
  max: number;
  icon: string;
}

export default function ResultView({ score, candidateName, onRestart }: Props) {
  const { isDarkMode } = useTheme();

  const rows: ScoreRow[] = [
    {
      label: 'Diseño de pruebas',
      value: score.testDesignScore,
      max: 25,
      icon: '🧪',
    },
    {
      label: 'Validación de API',
      value: score.apiValidationScore,
      max: 25,
      icon: '🔍',
    },
    { label: 'Seguridad', value: score.securityScore, max: 20, icon: '🔒' },
    {
      label: 'Calidad de reportes',
      value: score.bugReportingScore,
      max: 20,
      icon: '📝',
    },
    {
      label: 'Resumen ejecutivo',
      value: score.executiveSummaryScore,
      max: 10,
      icon: '📋',
    },
  ];

  const pct = Math.round((score.totalScore / 100) * 100);

  return (
    <div
      className={`min-h-screen flex items-start justify-center py-12 px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* Header card */}
        <div
          className={`rounded-2xl p-8 text-center shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="text-5xl mb-3">{score.passed ? '🎉' : '💪'}</div>
          <h1 className="text-2xl font-bold mb-1">
            {score.passed ? '¡Challenge aprobado!' : 'Challenge completado'}
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {candidateName}
          </p>

          <div className="mt-6">
            <div
              className={`text-6xl font-bold ${score.passed ? 'text-green-500' : 'text-orange-400'}`}
            >
              {score.totalScore.toFixed(1)}
            </div>
            <div
              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              de 100 puntos
            </div>
          </div>

          {/* Progress bar */}
          <div
            className={`mt-4 rounded-full h-3 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            <div
              className={`h-full rounded-full transition-all ${score.passed ? 'bg-green-500' : 'bg-orange-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              🐛 Bugs encontrados:{' '}
              <strong>
                {score.bugsFound}/{score.totalBugs}
              </strong>
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                score.passed
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
              }`}
            >
              {score.passed ? 'APROBADO' : 'NO APROBADO'} (mín. 70)
            </span>
          </div>
        </div>

        {/* Score breakdown */}
        <div
          className={`rounded-2xl p-6 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h3 className="font-semibold mb-4">Desglose de puntuación</h3>
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">
                    {row.icon} {row.label}
                  </span>
                  <span className="text-sm font-medium">
                    {row.value.toFixed(1)} / {row.max}
                  </span>
                </div>
                <div
                  className={`rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(row.value / row.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div
          className={`rounded-2xl p-6 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h3 className="font-semibold mb-3">Retroalimentación</h3>
          <p
            className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {score.feedback}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Nueva sesión
          </button>
          <button
            onClick={() => (window.location.href = '/labs')}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
          >
            Volver a Labs
          </button>
        </div>
      </div>
    </div>
  );
}
