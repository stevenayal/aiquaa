import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock de fetch global
const mockFetch = vi.fn();

// Configurar mocks antes de importar el servicio
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

global.fetch = mockFetch;

// Mock de process.env
const originalEnv = process.env;

describe('AuthService.register - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
    mockFetch.mockClear();
    
    // Resetear variables de entorno
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should return error when NEXT_PUBLIC_DISABLE_REGISTRATION is true', async () => {
    // Configurar la variable de entorno
    process.env.NEXT_PUBLIC_DISABLE_REGISTRATION = 'true';

    // Importar el servicio después de configurar el mock
    const { authService } = await import('../src/services/authService');

    const mockUserData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = await authService.register(mockUserData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Registro temporalmente deshabilitado');
  });

  it('should proceed with registration when NEXT_PUBLIC_DISABLE_REGISTRATION is false', async () => {
    // Configurar la variable de entorno
    process.env.NEXT_PUBLIC_DISABLE_REGISTRATION = 'false';

    // Mock de fetch exitoso
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockAuthResponse,
    });

    // Importar el servicio después de configurar el mock
    const { authService } = await import('../src/services/authService');

    const mockUserData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = await authService.register(mockUserData);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockAuthResponse.data);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
  });

  it('should handle validation error (422)', async () => {
    // Asegurar que la variable no esté definida
    delete process.env.NEXT_PUBLIC_DISABLE_REGISTRATION;

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

    // Importar el servicio después de configurar el mock
    const { authService } = await import('../src/services/authService');

    const mockUserData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'weak',
      confirmPassword: 'weak',
    };

    const result = await authService.register(mockUserData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Los datos proporcionados no son válidos.');
  });
});
