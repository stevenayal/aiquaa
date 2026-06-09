'use client';

import type { ReactNode } from 'react';
import type { AssessmentQuestion } from '../types';

export default function ShortAnswerQuestion({
  question,
  value,
  label,
  onChange,
  extraControl,
}: {
  question: AssessmentQuestion;
  value: string;
  label: string;
  onChange: (value: string) => void;
  extraControl?: ReactNode;
}) {
  return (
    <div>
      {extraControl}
      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={question.question_type === 'short_text' ? 5 : 6}
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
        placeholder="Escribí tu respuesta con claridad y foco en la validación QA."
      />
    </div>
  );
}
