import { NextResponse } from 'next/server';
import { listPosts } from '@/lib/devto';

export const revalidate = 1800; // ISR: revalidate every 30 minutes

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await listPosts(50);
  const baseUrl = 'https://aiquaa.com';

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>AIQUAA Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Artículos sobre QA, testing, automatización y tecnología en Paraguay por Steven Ayal.</description>
    <language>es-PY</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>AIQUAA Blog</title>
      <link>${baseUrl}/blog</link>
    </image>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.description || post.title)}</description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(post.user.name)}</dc:creator>
      ${
        post.cover_image
          ? `<enclosure url="${escapeXml(post.cover_image)}" type="image/jpeg" />`
          : ''
      }
      ${post.tag_list.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
