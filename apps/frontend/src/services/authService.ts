import { jwtDecode } from 'jwt-decode';
import { getGoogleAuthUrl, getGitHubAuthUrl } from '../config/oauth';

function getApiBaseUrl(): string {
  const urlFromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (urlFromEnv && urlFromEnv.length > 0) {
    return urlFromEnv;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3001';
  }

  // En producción, usar un valor por defecto en lugar de lanzar un error
  return 'https://api.aiquaa.com';
}

const API_BASE_URL = getApiBaseUrl();

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
        localStorage.setItem('refreshToken', accessToken);
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
        // Agregar opciones para manejar CORS y certificados
        mode: 'cors',
        credentials: 'include',
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
            mode: 'cors',
            credentials: 'include',
          });
          return await retryResponse.json();
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        // Manejar diferentes códigos de error HTTP
        let errorMessage = data.message || `Error ${response.status}`;
        
        switch (response.status) {
          case 400:
            errorMessage = 'Datos de entrada inválidos. Verifica la información proporcionada.';
            break;
          case 401:
            errorMessage = 'Credenciales inválidas o sesión expirada.';
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'El recurso solicitado no fue encontrado.';
            break;
          case 422:
            errorMessage = 'Los datos proporcionados no son válidos.';
            break;
          case 429:
            errorMessage = 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Contacta al administrador.';
            break;
          case 502:
            errorMessage = 'El servidor no está disponible temporalmente. Intenta más tarde.';
            break;
          case 503:
            errorMessage = 'El servicio no está disponible temporalmente. Intenta más tarde.';
            break;
          default:
            if (response.status >= 500) {
              errorMessage = 'Error del servidor. Contacta al administrador.';
            } else if (response.status >= 400) {
              errorMessage = 'Error en la solicitud. Verifica los datos proporcionados.';
            }
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Error en petición:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error desconocido';
      
      if (error instanceof TypeError) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión o contacta al administrador.';
        } else {
          errorMessage = `Error de red: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        mode: 'cors',
        credentials: 'include',
      });

      const data = await response.json();

      // Manejo específico de errores por status code
      if (!response.ok) {
        let errorMessage: string;
        
        switch (response.status) {
          case 401:
            errorMessage = 'Credenciales inválidas';
            break;
          case 404:
            errorMessage = 'Usuario no registrado';
            break;
          case 400:
            errorMessage = data.message || 'Datos de entrada inválidos';
            break;
          case 422:
            errorMessage = data.message || 'Datos de entrada inválidos';
            break;
          case 429:
            errorMessage = 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Contacta al administrador.';
            break;
          default:
            errorMessage = 'Error de conexión';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      if (data.success && data.data) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error de conexión';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    // Feature flag opcional para deshabilitar registro sin tocar el build
    const disabled = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION === 'true';
    if (disabled) {
      return { success: false, error: 'Registro temporalmente deshabilitado' };
    }

    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  }

  // Método para login con GitHub
  loginWithGitHub(): void {
    try {
      const githubAuthUrl = getGitHubAuthUrl();
      console.log('🔗 Redirigiendo a GitHub OAuth:', githubAuthUrl);
      
      if (typeof window !== 'undefined') {
        window.location.href = githubAuthUrl;
      }
    } catch (error) {
      console.error('Error al generar URL de GitHub OAuth:', error);
      throw error;
    }
  }

  // Método para login con Google
  loginWithGoogle(): void {
    try {
      const googleAuthUrl = getGoogleAuthUrl();
      console.log('🔗 Redirigiendo a Google OAuth:', googleAuthUrl);
      
      if (typeof window !== 'undefined') {
        window.location.href = googleAuthUrl;
      }
    } catch (error) {
      console.error('Error al generar URL de Google OAuth:', error);
      throw error;
    }
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

  // Método para verificar la conectividad con la API
  async checkApiConnectivity(): Promise<{ isConnected: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      });
      
      if (response.ok) {
        return { isConnected: true, message: 'API conectada correctamente' };
      } else {
        return { isConnected: false, message: `API respondió con estado ${response.status}` };
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { isConnected: false, message: 'No se pudo conectar con la API. Verifica tu conexión a internet.' };
      }
      return { isConnected: false, message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` };
    }
  }
}

export const authService = new AuthService();
export default authService;
