'use client';

import { useState } from 'react';
import type { BugReportInput, PriorityLevel } from '../../types';

interface Props {
  onSubmit: (data: BugReportInput) => Promise<{ error: string | null }>;
  onCancel: () => void;
}

const PRIORITIES: PriorityLevel[] = ['low', 'medium', 'high', 'critical'];

const ENDPOINTS = [
  'POST /api/challenge/auth/login',
  'GET /api/challenge/users/me',
  'GET /api/challenge/accounts',
  'GET /api/challenge/accounts/{accountId}',
  'POST /api/challenge/transfers',
  'GET /api/challenge/transfers/{transferId}',
  'GET /api/challenge/accounts/{accountId}/movements',
  'Multiple endpoints',
  'Otro',
];

const empty: BugReportInput = {
  title: '',
  description: '',
  stepsToReproduce: '',
  actualResult: '',
  expectedResult: '',
  severity: 'medium',
  priority: 'medium',
  endpoint: '',
  evidence: '',
};

export function BugReportForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<BugReportInput>(empty);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BugReportInput, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e: Partial<Record<keyof BugReportInput, string>> = {};
    if (!form.title.trim()) e.title = 'Requerido';
    if (!form.endpoint.trim()) e.endpoint = 'Requerido';
    if (!form.stepsToReproduce.trim()) e.stepsToReproduce = 'Requerido';
    if (!form.actualResult.trim()) e.actualResult = 'Requerido';
    if (!form.expectedResult.trim()) e.expectedResult = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const result = await onSubmit(form);
    setSubmitting(false);
    if (!result.error) {
      setForm(empty);
      setErrors({});
    } else {
      setErrors({ title: result.error });
    }
  }

  function textarea(
    label: string,
    name: keyof BugReportInput,
    required?: boolean,
    rows = 2
  ) {
    return (
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <textarea
          className={`w-full rounded border px-2 py-1.5 text-sm bg-white dark:bg-slate-800 resize-none ${
            errors[name]
              ? 'border-red-400'
              : 'border-slate-300 dark:border-slate-600'
          } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          rows={rows}
          value={form[name] as string}
          onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
        />
        {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
    >
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Nuevo bug report
      </h3>

      {textarea('Título del bug', 'title', true, 1)}

      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Endpoint afectado <span className="text-red-400">*</span>
        </label>
        <select
          className={`w-full rounded border px-2 py-1.5 text-sm bg-white dark:bg-slate-800 ${
            errors.endpoint
              ? 'border-red-400'
              : 'border-slate-300 dark:border-slate-600'
          }`}
          value={form.endpoint}
          onChange={(e) => setForm((p) => ({ ...p, endpoint: e.target.value }))}
        >
          <option value="">Seleccioná un endpoint...</option>
          {ENDPOINTS.map((ep) => (
            <option key={ep} value={ep}>
              {ep}
            </option>
          ))}
        </select>
        {errors.endpoint && (
          <p className="text-xs text-red-500">{errors.endpoint}</p>
        )}
      </div>

      {textarea('Descripción', 'description', false)}
      {textarea('Pasos para reproducir', 'stepsToReproduce', true, 3)}
      {textarea('Resultado actual', 'actualResult', true, 2)}
      {textarea('Resultado esperado', 'expectedResult', true, 2)}
      {textarea('Evidencia (captura, curl, etc.)', 'evidence', false)}

      <div className="grid grid-cols-2 gap-3">
        {(['severity', 'priority'] as const).map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">
              {field} <span className="text-red-400">*</span>
            </label>
            <select
              className="w-full rounded border border-slate-300 dark:border-slate-600 px-2 py-1.5 text-sm bg-white dark:bg-slate-800"
              value={form[field]}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  [field]: e.target.value as PriorityLevel,
                }))
              }
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Reportar bug'}
        </button>
      </div>
    </form>
  );
}
