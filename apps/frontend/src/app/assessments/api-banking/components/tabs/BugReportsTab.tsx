'use client';

import { useState } from 'react';
import type { BugReport, BugReportInput } from '../../types';
import { BugReportForm } from '../forms/BugReportForm';

interface Props {
  bugReports: BugReport[];
  onAdd: (data: BugReportInput) => Promise<{ error: string | null }>;
  onRemove: (id: number) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

export function BugReportsTab({ bugReports, onAdd, onRemove }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Bug Reports{' '}
          <span className="text-slate-400">({bugReports.length})</span>
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs px-2.5 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            + Reportar bug
          </button>
        )}
      </div>

      {showForm && (
        <BugReportForm
          onSubmit={async (data) => {
            const result = await onAdd(data);
            if (!result.error) setShowForm(false);
            return result;
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {bugReports.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          No hay bugs reportados aún. Encontrá y documentá al menos 2.
        </p>
      ) : (
        <div className="space-y-2">
          {bugReports.map((bug) => (
            <div
              key={bug.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${SEVERITY_COLOR[bug.severity] ?? ''}`}
                  >
                    {bug.severity}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {bug.title}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(bug.id)}
                  className="text-slate-400 hover:text-red-500 text-xs shrink-0"
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {bug.endpoint}
              </p>
              {bug.description && (
                <p className="text-xs text-slate-500">{bug.description}</p>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line">
                <strong>Actual:</strong> {bug.actualResult}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong>Esperado:</strong> {bug.expectedResult}
              </p>
              {bug.evidence && (
                <p className="text-xs text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                  {bug.evidence}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
