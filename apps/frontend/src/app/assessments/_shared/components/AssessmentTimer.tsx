'use client';

import { useEffect, useState } from 'react';

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function AssessmentTimer({
  suggestedMinutes = 10,
}: {
  suggestedMinutes?: number;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const overSuggested = elapsed > suggestedMinutes * 60;

  return (
    <div
      className={`rounded-3xl border px-5 py-4 ${
        overSuggested
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-100'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        Tiempo en esta sección
      </p>
      <p className="mt-2 text-3xl font-bold">{formatSeconds(elapsed)}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Sugerido: ~{suggestedMinutes} min
      </p>
    </div>
  );
}
