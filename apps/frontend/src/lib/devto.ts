/**
 * DEV.to API Client
 * Fetches articles from DEV.to public API for user stevenayal
 */

const DEV_API_BASE = 'https://dev.to/api';
const USERNAME = 'stevenayal';

/**
 * Posts to exclude from the blog list
 * Add post titles or slugs here to hide them from the site
 */
const EXCLUDED_POSTS = [
  'Diseño Modular en QA: el camino hacia equipos escalables, mantenibles y sostenibles',
  '🧩 Diseño Modular en QA: el camino hacia equipos escalables, mantenibles y sostenibles',
];

export type DevPost = {
  id: number;
  title: string;
  description: string;
  slug: string;
  published_at: string;
  cover_image: string | null;
  canonical_url: string;
  url: string;
  body_html: string;
  tag_list: string[]; // Always normalized to array
  reading_time_minutes: number;
  public_reactions_count: number;
  comments_count: number;
  user: {
    name: string;
    username: string;
    profile_image: string;
  };
};

export type DevPostPreview = Omit<DevPost, 'body_html'>;

/**
 * Normalize tag_list to always be an array
 * DEV.to API sometimes returns string, sometimes array
 */
function normalizeTags(tags: string[] | string): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Normalize a post from DEV.to API
 */
function normalizePost(post: any): DevPost {
  return {
    ...post,
    tag_list: normalizeTags(post.tag_list || []),
  };
}

/**
 * Normalize a preview post from DEV.to API
 */
function normalizePreviewPost(post: any): DevPostPreview {
  return {
    ...post,
    tag_list: normalizeTags(post.tag_list || []),
  };
}

/**
 * Fetch list of published articles
 * @param perPage Number of articles to fetch (default: 20, max: 1000)
 * @returns Array of article previews
 */
export async function listPosts(perPage = 20): Promise<DevPostPreview[]> {
  try {
    // Note: Using Accept: */* to avoid CDN cache issues with specific Accept headers
    // Add cache-busting timestamp to ensure we get fresh data
    // Changes every 10 minutes to bypass stale CDN cache
    const cacheBuster = Math.floor(Date.now() / (10 * 60 * 1000));
    const response = await fetch(
      `${DEV_API_BASE}/articles?username=${USERNAME}&per_page=${perPage}&_=${cacheBuster}`,
      {
        next: { revalidate: 600 }, // ISR: revalidate every 10 minutes
        headers: {
          'Accept': '*/*', // Using */* to avoid stale CDN cache
          'Connection': 'close', // Force fresh connection
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.error('DEV.to API rate limit exceeded');
        return [];
      }
      throw new Error(`DEV.to API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const posts = Array.isArray(data) ? data : [];

    // Filter out excluded posts
    const filteredPosts = posts.filter(post => {
      return !EXCLUDED_POSTS.some(excludedTitle =>
        post.title === excludedTitle ||
        post.title.includes(excludedTitle) ||
        excludedTitle.includes(post.title)
      );
    });

    return filteredPosts.map(post => normalizePreviewPost(post));
  } catch (error) {
    console.error('Error fetching posts from DEV.to:', error);
    return [];
  }
}

/**
 * Fetch a single article by slug
 * @param slug Article slug (e.g., "my-article-title-abc123")
 * @returns Full article with body_html, or null if not found
 */
export async function getPost(slug: string): Promise<DevPost | null> {
  try {
    // Note: Using Accept: */* to avoid CDN cache issues with specific Accept headers
    // Add cache-busting timestamp to ensure we get fresh data
    // Changes every 10 minutes to bypass stale CDN cache
    const cacheBuster = Math.floor(Date.now() / (10 * 60 * 1000));
    const response = await fetch(
      `${DEV_API_BASE}/articles/${USERNAME}/${slug}?_=${cacheBuster}`,
      {
        next: { revalidate: 600 }, // ISR: revalidate every 10 minutes
        headers: {
          'Accept': '*/*', // Using */* to avoid stale CDN cache
          'Connection': 'close', // Force fresh connection
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 429) {
        console.error('DEV.to API rate limit exceeded');
        return null;
      }
      throw new Error(`DEV.to API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const post = normalizePost(data);

    // Check if post is excluded
    const isExcluded = EXCLUDED_POSTS.some(excludedTitle =>
      post.title === excludedTitle ||
      post.title.includes(excludedTitle) ||
      excludedTitle.includes(post.title)
    );

    // Return null if post is excluded (same as 404)
    if (isExcluded) {
      return null;
    }

    return post;
  } catch (error) {
    console.error(`Error fetching post ${slug} from DEV.to:`, error);
    return null;
  }
}

/**
 * Format published date in es-PY locale
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-PY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
