import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, listPosts, formatDate } from '@/lib/devto';
import Comments from '@/components/Comments';

export const revalidate = 1800; // ISR: revalidate every 30 minutes

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Artículo no encontrado | AIQUAA',
    };
  }

  const canonicalUrl = `https://aiquaa.com/blog/${post.slug}`;
  const ogImage = post.cover_image || 'https://aiquaa.com/og-image.png';

  return {
    title: `${post.title} | AIQUAA Blog`,
    description: post.description || post.title,
    authors: [{ name: post.user.name, url: `https://dev.to/${post.user.username}` }],
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      url: canonicalUrl,
      siteName: 'AIQUAA',
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.user.name],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || post.title,
      images: [ogImage],
      creator: '@stevenayal',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export async function generateStaticParams() {
  const posts = await listPosts(100); // Generate static paths for first 100 posts
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back to Blog */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-dark-accent hover:underline mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Volver al Blog
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-dark-text">
            {post.title}
          </h1>

          {/* Author and Date */}
          <div className="flex items-center gap-4 mb-6">
            {post.user.profile_image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={post.user.profile_image}
                alt={post.user.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-dark-text">
                {post.user.name}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-muted">
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
            </div>
          </div>

          {/* Tags */}
          {post.tag_list && post.tag_list.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
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

          {/* Cover Image */}
          {post.cover_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}
        </header>

        {/* Article Body */}
        <article
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-dark-text
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-primary-600 dark:prose-a:text-dark-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-dark-text
            prose-code:text-gray-900 dark:prose-code:text-gray-200
            prose-code:bg-gray-100 dark:prose-code:bg-dark-secondary
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
            prose-pre:text-gray-100
            prose-blockquote:border-l-primary-600 dark:prose-blockquote:border-l-dark-accent
            prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
            prose-img:rounded-lg
            prose-hr:border-gray-200 dark:prose-hr:border-dark-secondary"
          dangerouslySetInnerHTML={{ __html: post.body_html }}
        />

        {/* Engagement Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-secondary">
          <div className="flex items-center gap-6 text-gray-600 dark:text-dark-muted">
            {post.public_reactions_count > 0 && (
              <span className="flex items-center gap-2">
                <span className="text-xl">❤️</span>
                <span>{post.public_reactions_count} reacciones</span>
              </span>
            )}
            {post.comments_count > 0 && (
              <span className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <span>{post.comments_count} comentarios</span>
              </span>
            )}
          </div>
        </div>

        {/* Original Article Link */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Este artículo fue publicado originalmente en{' '}
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:no-underline"
            >
              DEV.to
            </a>
            . Para interactuar con la comunidad de DEV, visitá el artículo original.
          </p>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-dark-text">
            Comentarios
          </h2>
          <Comments />
        </div>
      </div>
    </div>
  );
}
