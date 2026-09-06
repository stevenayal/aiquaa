'use client';

import type { PlaywrightCodeScenario } from '../types';

export default function PlaywrightCodeBlock({
  scenario,
}: {
  scenario: PlaywrightCodeScenario;
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
          {scenario.title ??
            `Código Playwright (${scenario.language ?? 'typescript'})`}
        </p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 text-xs text-cyan-100">
          {scenario.code}
        </pre>
      </div>

      {scenario.expectedOutput ? (
        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Salida del CLI
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 text-xs text-emerald-100">
            {scenario.expectedOutput}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
