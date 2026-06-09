'use client';

import { useTimer } from '../hooks/useTimer';

interface TimerProps {
  startedAt?: string;
  warnAtMinutes?: number;
}

export function Timer({ startedAt, warnAtMinutes = 100 }: TimerProps) {
  const { formatted, elapsed } = useTimer(startedAt);
  const isWarning = elapsed >= warnAtMinutes * 60;

  return (
    <span
      className={`font-mono text-sm font-semibold tabular-nums ${
        isWarning ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'
      }`}
    >
      {formatted}
    </span>
  );
}
