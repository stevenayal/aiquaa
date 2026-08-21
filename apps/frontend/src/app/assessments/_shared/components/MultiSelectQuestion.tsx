'use client';

import type { AssessmentQuestion } from '../types';

export default function MultiSelectQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-300">
        Marcá todas las opciones correctas
      </p>
      {question.options?.map((option) => {
        const checked = value.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
              checked
                ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-50'
                : 'border-slate-800 bg-slate-950/70 text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                checked
                  ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                  : 'border-slate-700'
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
