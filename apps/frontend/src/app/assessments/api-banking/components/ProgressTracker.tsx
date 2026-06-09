'use client';

interface ProgressTrackerProps {
  testCasesCount: number;
  bugReportsCount: number;
  hasSummary: boolean;
}

const MIN_TEST_CASES = 3;
const MIN_BUG_REPORTS = 2;

export function ProgressTracker({
  testCasesCount,
  bugReportsCount,
  hasSummary,
}: ProgressTrackerProps) {
  const items = [
    {
      label: `Casos de prueba (mín. ${MIN_TEST_CASES})`,
      done: testCasesCount >= MIN_TEST_CASES,
      count: testCasesCount,
    },
    {
      label: `Bug reports (mín. ${MIN_BUG_REPORTS})`,
      done: bugReportsCount >= MIN_BUG_REPORTS,
      count: bugReportsCount,
    },
    {
      label: 'Resumen ejecutivo',
      done: hasSummary,
      count: null,
    },
  ];

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Progreso entregables</span>
        <span>
          {doneCount}/{items.length}
        </span>
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm">
          <span
            className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              item.done
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
            }`}
          >
            {item.done ? '✓' : '·'}
          </span>
          <span
            className={
              item.done
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-slate-400'
            }
          >
            {item.label}
            {item.count !== null && (
              <span className="ml-1 text-slate-400 dark:text-slate-500">
                ({item.count})
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
