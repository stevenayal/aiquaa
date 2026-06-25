'use client';

import { useState } from 'react';
import type { TestCase, TestCaseInput } from '../../types';
import { API_CHALLENGE_MIN_TEST_CASES } from '../../data/apiChallengeTargets';
import { TestCaseForm } from '../forms/TestCaseForm';

interface Props {
  testCases: TestCase[];
  onAdd(_data: TestCaseInput): Promise<{ error: string | null }>;
  onRemove(_id: number): void;
}

const TYPE_COLOR: Record<string, string> = {
  positive:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  negative: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  boundary:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  security:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  contract: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function TestCasesTab({ testCases, onAdd, onRemove }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Casos de prueba{' '}
          <span className="text-slate-400">({testCases.length})</span>
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            + Agregar caso
          </button>
        )}
      </div>

      {showForm && (
        <TestCaseForm
          onSubmit={async (data) => {
            const result = await onAdd(data);
            if (!result.error) setShowForm(false);
            return result;
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {testCases.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          No hay casos de prueba todavia. Agrega al menos{' '}
          {API_CHALLENGE_MIN_TEST_CASES}.
        </p>
      ) : (
        <div className="space-y-2">
          {testCases.map((tc) => (
            <div
              key={tc.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TYPE_COLOR[tc.type] ?? ''}`}
                  >
                    {tc.type}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {tc.title}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(tc.id)}
                  className="text-slate-400 hover:text-red-500 text-xs shrink-0"
                  title="Eliminar"
                >
                  x
                </button>
              </div>
              {tc.preconditions && (
                <p className="text-xs text-slate-500">
                  <strong>Precond:</strong> {tc.preconditions}
                </p>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line">
                <strong>Pasos:</strong> {tc.steps}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong>Esperado:</strong> {tc.expectedResult}
              </p>
              <p className="text-xs text-slate-400">Prioridad: {tc.priority}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
