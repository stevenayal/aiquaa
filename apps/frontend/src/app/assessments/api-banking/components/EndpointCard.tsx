'use client';

import { useState } from 'react';

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  POST: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PATCH: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

interface Param {
  name: string;
  in: 'path' | 'query' | 'body';
  required?: boolean;
  description?: string;
  example?: string;
}

interface ResponseDef {
  code: number;
  description: string;
}

interface EndpointCardProps {
  method: string;
  path: string;
  summary: string;
  description?: string;
  params?: Param[];
  responses?: ResponseDef[];
  authRequired?: boolean;
}

export function EndpointCard({
  method,
  path,
  summary,
  description,
  params = [],
  responses = [],
  authRequired = true,
}: EndpointCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <span
          className={`text-[11px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
            METHOD_COLORS[method] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {method}
        </span>
        <code className="text-sm font-mono text-slate-800 dark:text-slate-200 flex-1">
          {path}
        </code>
        {authRequired && (
          <span className="text-[10px] text-slate-400 shrink-0">🔒</span>
        )}
        <span className="text-slate-400 text-xs shrink-0">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-3 text-sm">
          <p className="text-slate-600 dark:text-slate-300">{summary}</p>
          {description && (
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {description}
            </p>
          )}

          {params.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Parámetros
              </p>
              <div className="space-y-1">
                {params.map((p) => (
                  <div key={p.name} className="flex gap-2 text-xs">
                    <code className="text-slate-700 dark:text-slate-300 font-mono">
                      {p.name}
                    </code>
                    <span className="text-slate-400">({p.in})</span>
                    {p.required && <span className="text-red-400">*</span>}
                    {p.description && (
                      <span className="text-slate-500">{p.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {responses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Respuestas
              </p>
              <div className="space-y-1">
                {responses.map((r) => (
                  <div key={r.code} className="flex gap-2 text-xs">
                    <span
                      className={`font-mono font-semibold ${
                        r.code < 300
                          ? 'text-green-600 dark:text-green-400'
                          : r.code < 500
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {r.code}
                    </span>
                    <span className="text-slate-500">{r.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
