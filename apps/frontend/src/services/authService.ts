import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Recuperar tokens del localStorage al inicializar
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  // Permite configurar tokens desde flujos externos (p.ej., OAuth callback)
  applyTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.refreshToken) {
        // Token expirado, intentar refresh
        const refreshResult = await this.refreshAccessToken();
        if (refreshResult.success) {
          // Reintentar la petición original
          headers.Authorization = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return await retryResponse.json();
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error en petición:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<ApiResponse<{ accessToken: string }>> {
    if (!this.refreshToken) {
      return { success: false, error: 'No hay refresh token' };
    }

    const response = await this.makeRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (response.success && response.data) {
      this.accessToken = response.data.accessToken;
      localStorage.setItem('accessToken', this.accessToken);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/me');
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  isAuthenticated(): boolean {
    if (!this.accessToken) return false;
    
    try {
      const decoded = jwtDecode(this.accessToken);
      const currentTime = Date.now() / 1000;
      
      if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
        return (decoded.exp as number) > currentTime;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserFromToken(): User | null {
    if (!this.accessToken) return null;
    
    try {
      const decoded = jwtDecode(this.accessToken);
      if (decoded && typeof decoded === 'object' && 'user' in decoded) {
        return (decoded as any).user;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
