'use client';

import type { AssessmentQuestion } from '../types';

// Espejo de MultipleChoiceQuestion pero con selección múltiple: el valor es un
// array de `option.value` y cada click alterna una opción.
export default function MultipleSelectQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(optionValue: string) {
    const next = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        Marcá todas las opciones correctas
      </p>

      {question.options?.map((option) => {
        const checked = value.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={checked}
            onClick={() => toggle(option.value)}
            className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
              checked
                ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-50'
                : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 text-slate-700 dark:text-slate-200 hover:bg-white dark:bg-slate-900'
            }`}
          >
            <span
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                checked
                  ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              {checked ? '✓' : ''}
            </span>
            <span className="text-sm">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
