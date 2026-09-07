'use client';

import type { SqlSchemaScenario } from '../types';

export default function SqlSchemaCard({
  scenario,
}: {
  scenario: SqlSchemaScenario;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
        Esquema de base de datos
      </p>
      {scenario.note ? (
        <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {scenario.note}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {scenario.tables.map((table) => (
          <div
            key={table.name}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4"
          >
            <p className="font-mono text-sm font-semibold text-slate-100">
              {table.name}
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {table.columns.map((column) => (
                <li
                  key={column.name}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="font-mono text-slate-100">
                    {column.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {column.type}
                  </span>
                  {column.pk ? (
                    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                      PK
                    </span>
                  ) : null}
                  {column.fk ? (
                    <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                      FK → {column.fk}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>

            {table.sampleRows && table.sampleRows.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Datos de ejemplo
                </p>
                <table className="mt-2 w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      {Object.keys(table.sampleRows[0]).map((key) => (
                        <th key={key} className="px-2 py-1.5 font-mono">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 dark:text-slate-200">
                    {table.sampleRows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-slate-200/60 dark:border-slate-800/60 last:border-0"
                      >
                        {Object.keys(table.sampleRows![0]).map((key) => (
                          <td key={key} className="px-2 py-1.5 font-mono">
                            {row[key] === null ? (
                              <span className="italic text-slate-500">
                                NULL
                              </span>
                            ) : (
                              String(row[key])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
