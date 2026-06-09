'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  startedAt: Date;
}

export default function Timer({ startedAt }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  const fmt = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="font-mono text-sm tabular-nums">
      {h > 0 && `${fmt(h)}:`}
      {fmt(m)}:{fmt(s)}
    </span>
  );
}
