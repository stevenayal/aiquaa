export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back Link Skeleton */}
        <div className="h-6 w-32 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse mb-8" />

        {/* Header Skeleton */}
        <header className="mb-8">
          {/* Title Skeleton */}
          <div className="h-12 w-3/4 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse mb-4" />
          <div className="h-12 w-1/2 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse mb-6" />

          {/* Author Info Skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-200 dark:bg-dark-secondary rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
            </div>
          </div>

          {/* Tags Skeleton */}
          <div className="flex gap-2 mb-6">
            <div className="h-6 w-16 bg-gray-200 dark:bg-dark-secondary rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 dark:bg-dark-secondary rounded-full animate-pulse" />
            <div className="h-6 w-18 bg-gray-200 dark:bg-dark-secondary rounded-full animate-pulse" />
          </div>

          {/* Cover Image Skeleton */}
          <div className="h-96 bg-gray-200 dark:bg-dark-secondary rounded-lg animate-pulse mb-8" />
        </header>

        {/* Article Body Skeleton */}
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="space-y-2"
            >
              <div className="h-4 w-full bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Comments Section Skeleton */}
        <div className="mt-12">
          <div className="h-8 w-40 bg-gray-200 dark:bg-dark-secondary rounded animate-pulse mb-6" />
          <div className="h-64 bg-gray-200 dark:bg-dark-secondary rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
