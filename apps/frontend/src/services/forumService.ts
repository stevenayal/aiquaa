import authService from './authService';

function getApiBaseUrl(): string {
  const urlFromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (urlFromEnv && urlFromEnv.length > 0) {
    return urlFromEnv;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3001';
  }

  throw new Error('NEXT_PUBLIC_API_URL no está configurada en producción');
}

const API_BASE_URL = getApiBaseUrl();

export interface Thread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
  category: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
  threadId: string;
  isSolution: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface CreatePostData {
  content: string;
  threadId: string;
}

export interface UpdateThreadData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface UpdatePostData {
  content: string;
}

export interface ForumFilters {
  category?: string;
  tags?: string[];
  search?: string;
  author?: string;
  sortBy?: 'newest' | 'oldest' | 'mostViewed' | 'mostReplied';
  page?: number;
  limit?: number;
}

export interface ForumResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ForumService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ForumResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar headers adicionales si existen
    if (options.headers) {
      if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      }
    }

    // Agregar token de acceso si existe
    const token = authService.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error en petición del foro:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Threads
  async getThreads(filters: ForumFilters = {}): Promise<ForumResponse<Thread[]>> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters.search) params.append('search', filters.search);
    if (filters.author) params.append('author', filters.author);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/forum/threads${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<Thread[]>(endpoint);
  }

  async getThread(id: string): Promise<ForumResponse<Thread>> {
    return this.makeRequest<Thread>(`/forum/threads/${id}`);
  }

  async createThread(threadData: CreateThreadData): Promise<ForumResponse<Thread>> {
    return this.makeRequest<Thread>('/forum/threads', {
      method: 'POST',
      body: JSON.stringify(threadData),
    });
  }

  async updateThread(id: string, threadData: UpdateThreadData): Promise<ForumResponse<Thread>> {
    return this.makeRequest<Thread>(`/forum/threads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(threadData),
    });
  }

  async deleteThread(id: string): Promise<ForumResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/forum/threads/${id}`, {
      method: 'DELETE',
    });
  }

  async pinThread(id: string): Promise<ForumResponse<Thread>> {
    return this.makeRequest<Thread>(`/forum/threads/${id}/pin`, {
      method: 'PATCH',
    });
  }

  async lockThread(id: string): Promise<ForumResponse<Thread>> {
    return this.makeRequest<Thread>(`/forum/threads/${id}/lock`, {
      method: 'PATCH',
    });
  }

  // Posts
  async getPosts(threadId: string, page: number = 1, limit: number = 20): Promise<ForumResponse<Post[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return this.makeRequest<Post[]>(`/forum/threads/${threadId}/posts?${params}`);
  }

  async createPost(postData: CreatePostData): Promise<ForumResponse<Post>> {
    return this.makeRequest<Post>('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: string, postData: UpdatePostData): Promise<ForumResponse<Post>> {
    return this.makeRequest<Post>(`/forum/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: string): Promise<ForumResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/forum/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async markPostAsSolution(postId: string): Promise<ForumResponse<Post>> {
    return this.makeRequest<Post>(`/forum/posts/${postId}/solution`, {
      method: 'PATCH',
    });
  }

  // Categorías
  async getCategories(): Promise<ForumResponse<string[]>> {
    return this.makeRequest<string[]>('/forum/categories');
  }

  async getTags(): Promise<ForumResponse<string[]>> {
    return this.makeRequest<string[]>('/forum/tags');
  }

  // Estadísticas
  async getForumStats(): Promise<ForumResponse<{
    totalThreads: number;
    totalPosts: number;
    totalUsers: number;
    activeUsers: number;
  }>> {
    return this.makeRequest('/forum/stats');
  }

  // Búsqueda avanzada
  async search(query: string, filters: Omit<ForumFilters, 'search'> = {}): Promise<ForumResponse<{
    threads: Thread[];
    posts: Post[];
  }>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters.category) params.append('category', filters.category);
    if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters.author) params.append('author', filters.author);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return this.makeRequest(`/forum/search?${params}`);
  }

  // Subscripciones (para usuarios autenticados)
  async subscribeToThread(threadId: string): Promise<ForumResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/forum/threads/${threadId}/subscribe`, {
      method: 'POST',
    });
  }

  async unsubscribeFromThread(threadId: string): Promise<ForumResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/forum/threads/${threadId}/unsubscribe`, {
      method: 'DELETE',
    });
  }

  async getSubscribedThreads(): Promise<ForumResponse<Thread[]>> {
    return this.makeRequest<Thread[]>('/forum/subscriptions');
  }

  // Reportes
  async reportThread(threadId: string, reason: string): Promise<ForumResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/forum/threads/${threadId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async reportPost(postId: string, reason: string): Promise<ForumResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/forum/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

export const forumService = new ForumService();
export default forumService;
