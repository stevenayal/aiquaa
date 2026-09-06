'use client';

import type { SqlQueryScenario } from '../types';

export default function SqlScenarioBlock({
  scenario,
}: {
  scenario: SqlQueryScenario;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-5">
      {scenario.note ? (
        <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {scenario.note}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Query SQL
        </p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 text-xs text-cyan-100">
          {scenario.query}
        </pre>
      </div>

      {scenario.result ? (
        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Resultado obtenido
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  {scenario.result.columns.map((column) => (
                    <th key={column} className="px-2 py-1.5 font-mono">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-emerald-100">
                {scenario.result.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={scenario.result.columns.length}
                      className="px-2 py-2 italic text-slate-500"
                    >
                      (0 filas)
                    </td>
                  </tr>
                ) : (
                  scenario.result.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-slate-200/60 dark:border-slate-800/60 last:border-0"
                    >
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-2 py-1.5 font-mono">
                          {cell === null ? (
                            <span className="italic text-slate-500">NULL</span>
                          ) : (
                            String(cell)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {scenario.errorMessage ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
            Error devuelto
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 text-xs text-red-200">
            {scenario.errorMessage}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
