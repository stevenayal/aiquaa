'use client';

import { API_CHALLENGE_MIN_SUMMARY_CHARS } from '../../data/apiChallengeTargets';

interface Props {
  summary: string;
  onChange(_value: string): void;
}

export function SummaryTab({ summary, onChange }: Props) {
  const charCount = summary.length;
  const isGood = charCount >= API_CHALLENGE_MIN_SUMMARY_CHARS;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Resumen ejecutivo
        </h2>
        <p className="text-xs text-slate-500">
          Sintetiza alcance, cobertura, hallazgos, riesgos y recomendacion
          final. Minimo {API_CHALLENGE_MIN_SUMMARY_CHARS} caracteres.
        </p>
      </div>

      <textarea
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={12}
        placeholder={`Ejemplo:

Durante la evaluacion de la API seleccionada cubri escenarios positivos, negativos, de borde y contrato sobre los endpoints principales.

Hallazgos principales:
1. [Bug/riesgo/inconsistencia] ...
2. [Limitacion o mejora testable] ...

Riesgos:
- ...

Recomendacion final:
- ...`}
        value={summary}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="flex justify-between text-xs">
        <span
          className={
            charCount > 0
              ? isGood
                ? 'text-green-600'
                : 'text-amber-500'
              : 'text-slate-400'
          }
        >
          {charCount} caracteres{' '}
          {isGood ? 'OK' : `(min. ${API_CHALLENGE_MIN_SUMMARY_CHARS})`}
        </span>
        <span className="text-slate-400">
          {charCount >= 300
            ? 'Excelente extension'
            : charCount >= API_CHALLENGE_MIN_SUMMARY_CHARS
              ? 'Buena extension'
              : ''}
        </span>
      </div>
    </div>
  );
}
