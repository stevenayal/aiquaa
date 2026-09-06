'use client';

import type { AssessmentQuestion } from '../types';

export default function TrueFalseQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { label: 'Verdadero', nextValue: true },
        { label: 'Falso', nextValue: false },
      ].map((option) => {
        const checked = value === option.nextValue;

        return (
          <button
            key={`${question.id}-${option.label}`}
            type="button"
            onClick={() => onChange(option.nextValue)}
            className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
              checked
                ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-50'
                : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 text-slate-700 dark:text-slate-200 hover:bg-white dark:bg-slate-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
