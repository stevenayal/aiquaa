import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authService } from '../src/services/authService';

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthService.register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
    mockFetch.mockClear();
    
    // Resetear el estado del servicio
    (authService as any).accessToken = null;
    (authService as any).refreshToken = null;
  });

  afterEach(() => {
    vi.resetModules();
  });

  const mockUserData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    confirmPassword: 'password123',
  };

  const mockAuthResponse = {
    success: true,
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        isEmailVerified: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
    },
  };

  describe('Feature flag disabled', () => {
    it('should return error when NEXT_PUBLIC_DISABLE_REGISTRATION is true', async () => {
      // Configurar la variable de entorno
      const originalEnv = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION;
      process.env.NEXT_PUBLIC_DISABLE_REGISTRATION = 'true';

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Registro temporalmente deshabilitado');

      // Restaurar la variable de entorno
      process.env.NEXT_PUBLIC_DISABLE_REGISTRATION = originalEnv;
    });

    it('should proceed with registration when NEXT_PUBLIC_DISABLE_REGISTRATION is false', async () => {
      // Configurar la variable de entorno
      const originalEnv = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION;
      process.env.NEXT_PUBLIC_DISABLE_REGISTRATION = 'false';

      // Mock de fetch exitoso
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockAuthResponse,
      });

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse.data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');

      // Restaurar la variable de entorno
      process.env.NEXT_PUBLIC_DISABLE_REGISTRATION = originalEnv;
    });

    it('should proceed with registration when NEXT_PUBLIC_DISABLE_REGISTRATION is undefined', async () => {
      // Asegurar que la variable no esté definida
      const originalEnv = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION;
      delete process.env.NEXT_PUBLIC_DISABLE_REGISTRATION;

      // Mock de fetch exitoso
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockAuthResponse,
      });

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse.data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');

      // Restaurar la variable de entorno
      if (originalEnv !== undefined) {
        process.env.NEXT_PUBLIC_DISABLE_REGISTRATION = originalEnv;
      }
    });
  });

  describe('Successful registration', () => {
    it('should store tokens and return success response', async () => {
      // Mock de fetch exitoso
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockAuthResponse,
      });

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse.data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
    });

    it('should call the correct API endpoint', async () => {
      // Mock de fetch exitoso
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockAuthResponse,
      });

      await authService.register(mockUserData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockUserData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('Registration errors', () => {
    it('should handle 400 validation error', async () => {
      const errorResponse = {
        success: false,
        error: 'Email ya está registrado',
        message: 'Email ya está registrado',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Datos de entrada inválidos. Verifica la información proporcionada.');
    });

    it('should handle 409 conflict error', async () => {
      const errorResponse = {
        success: false,
        error: 'Username ya existe',
        message: 'Username ya existe',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => errorResponse,
      });

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error en la solicitud. Verifica los datos proporcionados.');
    });

    it('should handle 422 validation error', async () => {
      const errorResponse = {
        success: false,
        error: 'Contraseña demasiado débil',
        message: 'Contraseña demasiado débil',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => errorResponse,
      });

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Los datos proporcionados no son válidos.');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No se pudo conectar con el servidor. Verifica tu conexión o contacta al administrador.');
    });

    it('should not store tokens on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, error: 'Bad Request' }),
      });

      await authService.register(mockUserData);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Token storage', () => {
    it('should store both access and refresh tokens on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockAuthResponse,
      });

      await authService.register(mockUserData);

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
    });

    it('should not store tokens when response is not successful', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: 'Internal Server Error' }),
      });

      await authService.register(mockUserData);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });
});
