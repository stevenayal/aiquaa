'use client';

import type { ApiDocScenario } from '../types';

export default function ApiDocCard({ scenario }: { scenario: ApiDocScenario }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
        Documentación API
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {scenario.method} {scenario.endpoint}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {scenario.description}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Headers
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {scenario.headers.map((header) => (
                <li key={header}>{header}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Path params
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {scenario.pathParams.map((param) => (
                <li key={param.name}>
                  {param.name}: {param.type} ·{' '}
                  {param.required ? 'obligatorio' : 'opcional'}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Response 200
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 text-xs text-emerald-200">
            {JSON.stringify(scenario.successResponse, null, 2)}
          </pre>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Errores esperados
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            {scenario.expectedErrors.map((error) => (
              <li key={`${error.status}-${error.message}`}>
                {error.status}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
