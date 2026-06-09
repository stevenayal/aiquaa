'use client';

export default function RequestResponseBlock({
  scenario,
}: {
  scenario: {
    title: string;
    request: {
      method: string;
      endpoint: string;
      headers?: string[];
      body?: Record<string, unknown>;
    };
    response: {
      status: number;
      body?: Record<string, unknown>;
    };
    documentationNote?: string;
  };
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-sm font-semibold text-slate-100">{scenario.title}</p>
      {scenario.documentationNote ? (
        <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {scenario.documentationNote}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Request
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-cyan-100">
            {`${scenario.request.method} ${scenario.request.endpoint}
${(scenario.request.headers ?? []).join('\n')}${
              scenario.request.body
                ? `\n\n${JSON.stringify(scenario.request.body, null, 2)}`
                : ''
            }`}
          </pre>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Response
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-emerald-100">
            {`Status ${scenario.response.status}${
              scenario.response.body
                ? `\n\n${JSON.stringify(scenario.response.body, null, 2)}`
                : ''
            }`}
          </pre>
        </div>
      </div>
    </div>
  );
}
