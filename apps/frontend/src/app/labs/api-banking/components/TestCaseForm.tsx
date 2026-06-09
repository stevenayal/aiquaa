'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { TestCase } from '@/services/assessmentsService';

interface Props {
  onSave: (tc: TestCase) => void;
  onCancel: () => void;
  initial?: Partial<TestCase>;
}

const TC_TYPES: TestCase['type'][] = [
  'positive',
  'negative',
  'boundary',
  'security',
  'contract',
];
const PRIORITIES: TestCase['priority'][] = [
  'low',
  'medium',
  'high',
  'critical',
];

export default function TestCaseForm({ onSave, onCancel, initial }: Props) {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState<Partial<TestCase>>({
    type: 'positive',
    priority: 'medium',
    ...initial,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof TestCase, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title?.trim()) errs.title = 'Requerido';
    if (!form.steps?.trim()) errs.steps = 'Requerido';
    if (!form.expectedResult?.trim()) errs.expectedResult = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form as TestCase);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const labelClass = `block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div
      className={`rounded-lg border p-4 space-y-3 ${isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
    >
      <div>
        <label className={labelClass}>Título *</label>
        <input
          className={inputClass}
          value={form.title ?? ''}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Ej: Transferencia con monto válido"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo</label>
          <select
            className={inputClass}
            value={form.type ?? 'positive'}
            onChange={(e) => set('type', e.target.value)}
          >
            {TC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Prioridad</label>
          <select
            className={inputClass}
            value={form.priority ?? 'medium'}
            onChange={(e) => set('priority', e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Precondiciones</label>
        <input
          className={inputClass}
          value={form.preconditions ?? ''}
          onChange={(e) => set('preconditions', e.target.value)}
          placeholder="Ej: Usuario autenticado con cuenta activa"
        />
      </div>

      <div>
        <label className={labelClass}>Pasos *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={form.steps ?? ''}
          onChange={(e) => set('steps', e.target.value)}
          placeholder="1. Autenticarse&#10;2. Enviar POST /transfers con amount: 100&#10;3. Verificar respuesta"
        />
        {errors.steps && (
          <p className="text-xs text-red-500 mt-1">{errors.steps}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Resultado esperado *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          value={form.expectedResult ?? ''}
          onChange={(e) => set('expectedResult', e.target.value)}
          placeholder="HTTP 201 con transferencia creada y saldo actualizado"
        />
        {errors.expectedResult && (
          <p className="text-xs text-red-500 mt-1">{errors.expectedResult}</p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
