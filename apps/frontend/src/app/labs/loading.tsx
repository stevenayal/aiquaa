import Skeleton, { SkeletonScreen } from '@/components/ui/Skeleton';

export default function LabsLoading() {
  return (
    <SkeletonScreen label="Cargando laboratorios…">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-4 h-7 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-6 h-10 w-32 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}
