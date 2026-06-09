'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { BugReport } from '@/services/assessmentsService';

interface Props {
  onSave: (br: BugReport) => void;
  onCancel: () => void;
  initial?: Partial<BugReport>;
}

const PRIORITIES: BugReport['severity'][] = [
  'low',
  'medium',
  'high',
  'critical',
];

const ENDPOINTS = [
  'POST /auth/login',
  'GET /users/me',
  'GET /accounts',
  'GET /accounts/{accountId}',
  'GET /accounts/{accountId}/movements',
  'POST /transfers',
  'GET /transfers/{transferId}',
  'Otro',
];

export default function BugReportForm({ onSave, onCancel, initial }: Props) {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState<Partial<BugReport>>({
    severity: 'medium',
    priority: 'medium',
    ...initial,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof BugReport, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title?.trim()) errs.title = 'Requerido';
    if (!form.stepsToReproduce?.trim()) errs.stepsToReproduce = 'Requerido';
    if (!form.actualResult?.trim()) errs.actualResult = 'Requerido';
    if (!form.expectedResult?.trim()) errs.expectedResult = 'Requerido';
    if (!form.endpoint?.trim()) errs.endpoint = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form as BugReport);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-red-500`;

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
          placeholder="Ej: GET /accounts/{id} no verifica propiedad de la cuenta"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Endpoint *</label>
          <select
            className={inputClass}
            value={form.endpoint ?? ''}
            onChange={(e) => set('endpoint', e.target.value)}
          >
            <option value="">Seleccionar</option>
            {ENDPOINTS.map((ep) => (
              <option key={ep} value={ep}>
                {ep}
              </option>
            ))}
          </select>
          {errors.endpoint && (
            <p className="text-xs text-red-500 mt-1">{errors.endpoint}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Severidad</label>
          <select
            className={inputClass}
            value={form.severity ?? 'medium'}
            onChange={(e) => set('severity', e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
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
        <label className={labelClass}>Descripción</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Descripción breve del problema encontrado"
        />
      </div>

      <div>
        <label className={labelClass}>Pasos para reproducir *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={form.stepsToReproduce ?? ''}
          onChange={(e) => set('stepsToReproduce', e.target.value)}
          placeholder="1. Autenticarse como user.a@aiquaa.test&#10;2. Hacer GET /accounts/acc_002&#10;3. Observar respuesta"
        />
        {errors.stepsToReproduce && (
          <p className="text-xs text-red-500 mt-1">{errors.stepsToReproduce}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Resultado actual *</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={form.actualResult ?? ''}
            onChange={(e) => set('actualResult', e.target.value)}
            placeholder="HTTP 200 con datos de la cuenta de otro usuario"
          />
          {errors.actualResult && (
            <p className="text-xs text-red-500 mt-1">{errors.actualResult}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Resultado esperado *</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={form.expectedResult ?? ''}
            onChange={(e) => set('expectedResult', e.target.value)}
            placeholder="HTTP 403 Forbidden — acceso denegado a cuenta ajena"
          />
          {errors.expectedResult && (
            <p className="text-xs text-red-500 mt-1">{errors.expectedResult}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Evidencia (request/response, screenshot)
        </label>
        <textarea
          className={`${inputClass} resize-none font-mono text-xs`}
          rows={3}
          value={form.evidence ?? ''}
          onChange={(e) => set('evidence', e.target.value)}
          placeholder={
            'GET /api/challenge/accounts/acc_002\nAuthorization: Bearer <token_user_a>\n→ 200 OK { "id": "acc_002", "ownerId": "usr_002", ... }'
          }
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Guardar Bug
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
