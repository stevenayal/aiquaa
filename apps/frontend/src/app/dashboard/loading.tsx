import Skeleton, { SkeletonScreen } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <SkeletonScreen label="Cargando tu panel…">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="h-10 w-56" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-9 w-20" />
              <Skeleton className="mt-6 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <Skeleton className="h-6 w-48" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
