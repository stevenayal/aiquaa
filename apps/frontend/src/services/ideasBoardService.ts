import { getAuthToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================
// INTERFACES Y TIPOS
// ============================================================

export interface IdeaCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  _count?: {
    ideas: number;
  };
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  slug: string;
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  categoryId: number;
  category: IdeaCategory;
  author: {
    id: number;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
  voteScore: number;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  tags: string[];
  userVote?: number | null; // +1, -1, o null
  createdAt: string;
  updatedAt: string;
  _count?: {
    votes: number;
    comments: number;
  };
  comments?: IdeaComment[];
}

export interface IdeaComment {
  id: number;
  content: string;
  ideaId: number;
  author: {
    id: number;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IdeaFilters {
  categoryId?: number;
  status?: string;
  search?: string;
  tags?: string[];
  authorId?: number;
  orderBy?: 'newest' | 'oldest' | 'topVoted' | 'trending';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateIdeaData {
  title: string;
  description: string;
  categoryId: number;
  tags?: string[];
}

export interface UpdateIdeaData {
  title?: string;
  description?: string;
  categoryId?: number;
  tags?: string[];
}

// ============================================================
// SERVICE CLASS
// ============================================================

class IdeasBoardService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // ============================================================
  // CATEGORÍAS
  // ============================================================

  async getCategories(): Promise<IdeaCategory[]> {
    return this.makeRequest<IdeaCategory[]>('/api/v1/ideas-board/categories');
  }

  // ============================================================
  // IDEAS - CRUD
  // ============================================================

  async getIdeas(
    filters?: IdeaFilters,
  ): Promise<PaginatedResponse<Idea>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
      if (filters.authorId) params.append('authorId', filters.authorId.toString());
      if (filters.orderBy) params.append('orderBy', filters.orderBy);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/v1/ideas-board?${queryString}`
      : '/api/v1/ideas-board';

    return this.makeRequest<PaginatedResponse<Idea>>(endpoint);
  }

  async getIdea(id: number): Promise<Idea> {
    return this.makeRequest<Idea>(`/api/v1/ideas-board/${id}`);
  }

  async createIdea(data: CreateIdeaData): Promise<Idea> {
    return this.makeRequest<Idea>('/api/v1/ideas-board', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIdea(id: number, data: UpdateIdeaData): Promise<Idea> {
    return this.makeRequest<Idea>(`/api/v1/ideas-board/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIdea(id: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/api/v1/ideas-board/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================
  // TOP IDEAS
  // ============================================================

  async getTopIdeas(limit: number = 10): Promise<Idea[]> {
    return this.makeRequest<Idea[]>(`/api/v1/ideas-board/top?limit=${limit}`);
  }

  // ============================================================
  // VOTACIÓN
  // ============================================================

  async voteIdea(ideaId: number, value: 1 | -1): Promise<void> {
    await this.makeRequest(`/api/v1/ideas-board/${ideaId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  async removeVote(ideaId: number): Promise<void> {
    await this.makeRequest(`/api/v1/ideas-board/${ideaId}/vote`, {
      method: 'DELETE',
    });
  }

  // ============================================================
  // COMENTARIOS
  // ============================================================

  async getComments(ideaId: number): Promise<IdeaComment[]> {
    return this.makeRequest<IdeaComment[]>(
      `/api/v1/ideas-board/${ideaId}/comments`,
    );
  }

  async addComment(ideaId: number, content: string): Promise<IdeaComment> {
    return this.makeRequest<IdeaComment>(
      `/api/v1/ideas-board/${ideaId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      },
    );
  }

  // ============================================================
  // USUARIO
  // ============================================================

  async getUserVotedIdeas(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<Idea>> {
    return this.makeRequest<PaginatedResponse<Idea>>(
      `/api/v1/ideas-board/my-votes?page=${page}&limit=${limit}`,
    );
  }

  // ============================================================
  // ADMIN
  // ============================================================

  async updateIdeaStatus(
    ideaId: number,
    status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED',
  ): Promise<Idea> {
    return this.makeRequest<Idea>(`/api/v1/ideas-board/${ideaId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

// Exportar instancia única
export const ideasBoardService = new IdeasBoardService();
