export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Skeleton */}
        <header className="mb-12">
          <div className="h-12 w-48 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse mb-4" />
          <div className="h-6 w-96 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
        </header>

        {/* Posts List Skeleton */}
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <article
              key={i}
              className="border-b border-gray-200 dark:border-dark-secondary pb-8"
            >
              {/* Cover Image Skeleton */}
              <div className="mb-4 h-48 bg-gray-200 dark:bg-dark-secondary rounded-lg animate-pulse" />

              {/* Metadata Skeleton */}
              <div className="flex items-center gap-4 mb-3">
                <div className="h-4 w-32 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
              </div>

              {/* Title Skeleton */}
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse mb-3" />

              {/* Description Skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
              </div>

              {/* Tags Skeleton */}
              <div className="flex gap-2 mb-3">
                <div className="h-6 w-16 bg-gray-200 dark:bg-dark-secondary rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-dark-secondary rounded-full animate-pulse" />
                <div className="h-6 w-18 bg-gray-200 dark:bg-dark-secondary rounded-full animate-pulse" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
