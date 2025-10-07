const API = process.env.NEXT_PUBLIC_API_URL!;

export async function postJson(path: string, body: unknown) {
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
      mode: 'cors',
      credentials: 'include'
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('API Error:', {
        url: `${API}${path}`,
        status: res.status,
        statusText: res.statusText,
        body: text,
        timestamp: new Date().toISOString()
      });
      throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
    }
    
    return res.json().catch(() => ({}));
  } catch (error) {
    // Detectar errores de red/CORS específicos
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network/CORS Error:', {
        url: `${API}${path}`,
        error: 'No se pudo contactar con el servidor. Verificá conexión/CORS.',
        timestamp: new Date().toISOString()
      });
      throw new Error('No se pudo contactar con el servidor. Verificá conexión/CORS.');
    }
    
    console.error('API Error:', {
      url: `${API}${path}`,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

export async function getJson(path: string) {
  const res = await fetch(`${API}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
  }
  
  return res.json().catch(() => ({}));
}

// Cliente API legacy para compatibilidad
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API) {
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
