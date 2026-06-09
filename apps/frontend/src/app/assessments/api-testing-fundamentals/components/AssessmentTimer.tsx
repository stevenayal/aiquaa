'use client';

import { useEffect, useRef, useState } from 'react';

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function AssessmentTimer({
  startedAt,
  durationMinutes,
  onExpire,
}: {
  startedAt: string;
  durationMinutes: number;
  onExpire?: () => void;
}) {
  const expireRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    );
    return Math.max(durationMinutes * 60 - elapsed, 0);
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          if (!expireRef.current) {
            expireRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onExpire]);

  return (
    <div
      className={`rounded-3xl border px-5 py-4 ${
        secondsLeft <= 300
          ? 'border-red-500/30 bg-red-500/10 text-red-100'
          : 'border-slate-800 bg-slate-900/80 text-slate-100'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Tiempo restante
      </p>
      <p className="mt-2 text-3xl font-bold">{formatSeconds(secondsLeft)}</p>
      <p className="mt-1 text-xs text-slate-400">
        El assessment se envía automáticamente cuando el contador llega a cero.
      </p>
    </div>
  );
}
