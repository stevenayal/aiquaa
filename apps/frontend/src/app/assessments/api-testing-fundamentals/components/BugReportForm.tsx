'use client';

import type {
  AssessmentQuestion,
  BugPriority,
  BugReportDraft,
  BugSeverity,
} from '../types';

const SEVERITIES: BugSeverity[] = ['Crítica', 'Alta', 'Media', 'Baja'];
const PRIORITIES: BugPriority[] = ['Alta', 'Media', 'Baja'];

export default function BugReportForm({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: BugReportDraft;
  onChange: (value: BugReportDraft) => void;
}) {
  function update<K extends keyof BugReportDraft>(
    field: K,
    nextValue: BugReportDraft[K]
  ) {
    onChange({ ...value, [field]: nextValue });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
        Completá todos los campos del bug report. Buscamos claridad,
        reproducibilidad y una buena clasificación del impacto.
        {question.metadata?.bugReference
          ? ` Referencia: ${String(question.metadata.bugReference)}.`
          : ''}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={value.title}
          onChange={(event) => update('title', event.target.value)}
          placeholder="Título"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
        />
        <input
          value={value.endpoint}
          onChange={(event) => update('endpoint', event.target.value)}
          placeholder="Endpoint"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
        />
        <input
          value={value.method}
          onChange={(event) => update('method', event.target.value)}
          placeholder="Método HTTP"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
        />
        <input
          value={value.environment}
          onChange={(event) => update('environment', event.target.value)}
          placeholder="Ambiente"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
        />
        <select
          value={value.severity}
          onChange={(event) =>
            update('severity', event.target.value as BugSeverity)
          }
          className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
        >
          {SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
        <select
          value={value.priority}
          onChange={(event) =>
            update('priority', event.target.value as BugPriority)
          }
          className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
        >
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={value.description}
        onChange={(event) => update('description', event.target.value)}
        rows={3}
        placeholder="Descripción del bug"
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
      />
      <textarea
        value={value.stepsToReproduce}
        onChange={(event) => update('stepsToReproduce', event.target.value)}
        rows={4}
        placeholder="Pasos para reproducir"
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
      />
      <textarea
        value={value.actualResult}
        onChange={(event) => update('actualResult', event.target.value)}
        rows={3}
        placeholder="Resultado actual"
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
      />
      <textarea
        value={value.expectedResult}
        onChange={(event) => update('expectedResult', event.target.value)}
        rows={3}
        placeholder="Resultado esperado"
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
      />
      <textarea
        value={value.evidence}
        onChange={(event) => update('evidence', event.target.value)}
        rows={2}
        placeholder="Evidencia (logs, body, screenshots, curl, etc.)"
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
      />
    </div>
  );
}
