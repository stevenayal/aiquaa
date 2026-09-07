'use client';

export default function SectionSummaryCard({
  title,
  score,
  maxScore,
  feedback,
}: {
  title: string;
  score: number;
  maxScore: number;
  feedback: string;
}) {
  return (
    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
        Última corrección guardada
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emerald-50">{title}</h3>
          <p className="mt-2 text-sm text-emerald-100/80">{feedback}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-white/40 dark:bg-slate-950/40 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
            Score
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-50">
            {score}/{maxScore}
          </p>
        </div>
      </div>
    </div>
  );
}
