function getApiBaseUrl(): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl && apiUrl.length > 0) {
    return apiUrl;
  }
  if (backendUrl && backendUrl.length > 0) {
    return `${backendUrl}/api/v1`;
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3001/api/v1';
  }
  // En producción, usar un valor por defecto en lugar de lanzar un error
  return 'https://api.aiquaa.com/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Health check
  async health(): Promise<ApiResponse<{ status: string; time: string }>> {
    return this.request<{ status: string; time: string }>('/health');
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refresh(token: string): Promise<ApiResponse> {
    return this.request('/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Forum endpoints
  async getCategories(): Promise<ApiResponse> {
    return this.request('/forum/categories');
  }

  async getThreads(categoryId?: string): Promise<ApiResponse> {
    const endpoint = categoryId ? `/forum/categories/${categoryId}/threads` : '/forum/threads';
    return this.request(endpoint);
  }

  async getPosts(threadId: string): Promise<ApiResponse> {
    return this.request(`/forum/threads/${threadId}/posts`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
