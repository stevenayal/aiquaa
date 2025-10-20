/**
 * DEV.to API Client
 * Fetches articles from DEV.to public API for user stevenayal
 */

const DEV_API_BASE = 'https://dev.to/api';
const USERNAME = 'stevenayal';

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
  tag_list: string[];
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
 * Fetch list of published articles
 * @param perPage Number of articles to fetch (default: 20, max: 1000)
 * @returns Array of article previews
 */
export async function listPosts(perPage = 20): Promise<DevPostPreview[]> {
  try {
    const response = await fetch(
      `${DEV_API_BASE}/articles?username=${USERNAME}&per_page=${perPage}`,
      {
        next: { revalidate: 1800 }, // ISR: revalidate every 30 minutes
        headers: {
          'Accept': 'application/json',
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
    return Array.isArray(data) ? data : [];
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
    const response = await fetch(
      `${DEV_API_BASE}/articles/${USERNAME}/${slug}`,
      {
        next: { revalidate: 1800 }, // ISR: revalidate every 30 minutes
        headers: {
          'Accept': 'application/json',
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
    return data;
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
