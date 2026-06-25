'use client';

import { useState } from 'react';
import type { TestCaseInput, TestCaseType, PriorityLevel } from '../../types';

interface Props {
  onSubmit(_data: TestCaseInput): Promise<{ error: string | null }>;
  onCancel(): void;
}

const TYPES: TestCaseType[] = [
  'positive',
  'negative',
  'boundary',
  'security',
  'contract',
];
const PRIORITIES: PriorityLevel[] = ['low', 'medium', 'high', 'critical'];

const empty: TestCaseInput = {
  title: '',
  preconditions: '',
  steps: '',
  expectedResult: '',
  type: 'positive',
  priority: 'medium',
};

export function TestCaseForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<TestCaseInput>(empty);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TestCaseInput, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e: Partial<Record<keyof TestCaseInput, string>> = {};
    if (!form.title.trim()) e.title = 'Requerido';
    if (!form.steps.trim()) e.steps = 'Requerido';
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

  function field(
    label: string,
    name: keyof TestCaseInput,
    required?: boolean,
    placeholder?: string
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
          rows={name === 'steps' || name === 'expectedResult' ? 3 : 2}
          placeholder={placeholder}
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
        Nuevo caso de prueba
      </h3>

      {field(
        'Titulo',
        'title',
        true,
        'Ej: Buscar personajes con filtro valido y paginacion'
      )}
      {field(
        'Precondiciones',
        'preconditions',
        false,
        'API elegida, base URL, datos o parametros necesarios.'
      )}
      {field(
        'Pasos',
        'steps',
        true,
        'Inclui metodo, URL completa, parametros y datos usados.'
      )}
      {field(
        'Resultado esperado',
        'expectedResult',
        true,
        'Status code, estructura esperada y campos clave a validar.'
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Tipo <span className="text-red-400">*</span>
          </label>
          <select
            className="w-full rounded border border-slate-300 dark:border-slate-600 px-2 py-1.5 text-sm bg-white dark:bg-slate-800"
            value={form.type}
            onChange={(e) =>
              setForm((p) => ({ ...p, type: e.target.value as TestCaseType }))
            }
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Prioridad
          </label>
          <select
            className="w-full rounded border border-slate-300 dark:border-slate-600 px-2 py-1.5 text-sm bg-white dark:bg-slate-800"
            value={form.priority}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                priority: e.target.value as PriorityLevel,
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
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Agregar caso'}
        </button>
      </div>
    </form>
  );
}
