import { MetadataRoute } from 'next';
import { listPosts } from '@/lib/devto';
import { toolCategories } from '@/lib/labsCatalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aiquaa.com';

  // Fetch blog posts for dynamic routes
  const posts = await listPosts(100);
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/labs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comunidad`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ranking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Individual lab routes
  const labRoutes: MetadataRoute.Sitemap = toolCategories.flatMap((category) =>
    category.tools.map((tool) => ({
      url: `${baseUrl}${tool.href}`,
      lastModified: new Date(),
      changeFrequency: (category.id === 'formacion'
        ? 'weekly'
        : 'monthly') as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: tool.featured ? 0.8 : 0.6,
    }))
  );

  return [...routes, ...labRoutes, ...blogPosts];
}
