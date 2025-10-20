import { Metadata } from 'next';
import Link from 'next/link';
import { listPosts, formatDate } from '@/lib/devto';

export const revalidate = 1800; // ISR: revalidate every 30 minutes

export const metadata: Metadata = {
  title: 'Blog | AIQUAA',
  description: 'Artículos sobre QA, testing, automatización y tecnología en Paraguay por Steven Ayal.',
  openGraph: {
    title: 'Blog | AIQUAA',
    description: 'Artículos sobre QA, testing, automatización y tecnología en Paraguay.',
    url: 'https://aiquaa.com/blog',
    siteName: 'AIQUAA',
    type: 'website',
    images: [
      {
        url: 'https://aiquaa.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AIQUAA Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | AIQUAA',
    description: 'Artículos sobre QA, testing, automatización y tecnología en Paraguay.',
  },
  alternates: {
    canonical: 'https://aiquaa.com/blog',
  },
};

export default async function BlogPage() {
  const posts = await listPosts(20);

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-dark-text">
            Blog
          </h1>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              No se pudieron cargar los artículos en este momento. Intentá más tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-dark-text">
            Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-muted">
            Artículos sobre QA, testing, automatización y tecnología en Paraguay.
          </p>
        </header>

        {/* Posts List */}
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group border-b border-gray-200 dark:border-dark-secondary pb-8 last:border-b-0"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block hover:opacity-80 transition-opacity"
              >
                {/* Cover Image */}
                {post.cover_image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Post Metadata */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-dark-muted">
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                  {post.reading_time_minutes && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span>{post.reading_time_minutes} min de lectura</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-dark-accent transition-colors">
                  {post.title}
                </h2>

                {/* Description */}
                {post.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.description}
                  </p>
                )}

                {/* Tags */}
                {post.tag_list && post.tag_list.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tag_list.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-dark-secondary text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-muted">
                  {post.public_reactions_count > 0 && (
                    <span>❤️ {post.public_reactions_count}</span>
                  )}
                  {post.comments_count > 0 && (
                    <span>💬 {post.comments_count}</span>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Footer Note */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-secondary">
          <p className="text-sm text-gray-600 dark:text-dark-muted text-center">
            Los artículos se actualizan automáticamente desde{' '}
            <a
              href={`https://dev.to/stevenayal`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-dark-accent hover:underline"
            >
              DEV.to
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
