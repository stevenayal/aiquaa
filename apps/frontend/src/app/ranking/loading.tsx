import Skeleton, { SkeletonScreen } from '@/components/ui/Skeleton';

export default function RankingLoading() {
  return (
    <SkeletonScreen label="Cargando el ranking…">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-3 h-5 w-80 max-w-full" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}
