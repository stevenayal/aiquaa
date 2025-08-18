import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import authService from '../../src/services/authService';

// Mock del servicio de autenticación
jest.mock('../../src/services/authService');

const mockAuthService = authService as jest.Mocked<typeof authService>;

// Componente de prueba para usar el contexto
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, register, logout, refreshUser } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <button onClick={() => login({ email: 'test@test.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => register({ email: 'test@test.com', password: 'password', name: 'Test User' })}>
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => refreshUser()}>Refresh</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks por defecto
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockResolvedValue({
      success: false,
      data: null,
      error: 'Not authenticated'
    });
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  describe('AuthProvider', () => {
    it('renderiza correctamente el contexto', () => {
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('user')).toBeInTheDocument();
      expect(screen.getByTestId('isAuthenticated')).toBeInTheDocument();
      expect(screen.getByTestId('isLoading')).toBeInTheDocument();
    });

    it('inicializa con estado de carga', () => {
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
    });

    it('inicializa sin usuario autenticado', () => {
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('carga el usuario actual si está autenticado', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User' };
      
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue({
        success: true,
        data: mockUser
      });
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    it('maneja errores al cargar el usuario actual', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Network error'));
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('limpia el estado cuando el token es inválido', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue({
        success: false,
        data: null,
        error: 'Invalid token'
      });
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  describe('useAuth hook', () => {
    it('lanza error si se usa fuera del AuthProvider', () => {
      // Suprimir console.error para esta prueba
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<TestComponent />)).toThrow(
        'useAuth debe ser usado dentro de un AuthProvider'
      );
      
      consoleSpy.mockRestore();
    });

    it('proporciona acceso a todas las funciones del contexto', () => {
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  describe('login function', () => {
    it('maneja login exitoso', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User' };
      
      mockAuthService.login.mockResolvedValue({
        success: true,
        data: { user: mockUser }
      });
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
      });
      
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password'
      });
    });

    it('maneja login fallido', async () => {
      const user = userEvent.setup();
      
      mockAuthService.login.mockResolvedValue({
        success: false,
        data: null,
        error: 'Invalid credentials'
      });
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      // El usuario no debe cambiar
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('maneja errores durante el login', async () => {
      const user = userEvent.setup();
      
      mockAuthService.login.mockRejectedValue(new Error('Network error'));
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      // El usuario no debe cambiar
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('maneja el estado de carga durante el login', async () => {
      const user = userEvent.setup();
      
      // Simular un delay en el login
      mockAuthService.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { user: { id: 1, email: 'test@test.com', name: 'Test User' } }
        }), 100))
      );
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      // Debe mostrar estado de carga
      expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
      
      // Esperar a que termine
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
    });
  });

  describe('register function', () => {
    it('maneja registro exitoso', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User' };
      
      mockAuthService.register.mockResolvedValue({
        success: true,
        data: { user: mockUser }
      });
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const registerButton = screen.getByText('Register');
      await user.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
      });
      
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
        name: 'Test User'
      });
    });

    it('maneja registro fallido', async () => {
      const user = userEvent.setup();
      
      mockAuthService.register.mockResolvedValue({
        success: false,
        data: null,
        error: 'Email already exists'
      });
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const registerButton = screen.getByText('Register');
      await user.click(registerButton);
      
      // El usuario no debe cambiar
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  describe('logout function', () => {
    it('maneja logout exitoso', async () => {
      const user = userEvent.setup();
      
      // Configurar usuario autenticado
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, email: 'test@test.com', name: 'Test User' }
      });
      
      mockAuthService.logout.mockResolvedValue();
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      // Verificar que el usuario está autenticado
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
      
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
      
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('maneja errores durante el logout', async () => {
      const user = userEvent.setup();
      
      // Configurar usuario autenticado
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, email: 'test@test.com', name: 'Test User' }
      });
      
      mockAuthService.logout.mockRejectedValue(new Error('Network error'));
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);
      
      // El usuario debe seguir autenticado
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
  });

  describe('refreshUser function', () => {
    it('actualiza el usuario correctamente', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User' };
      
      mockAuthService.getCurrentUser.mockResolvedValue({
        success: true,
        data: mockUser
      });
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
      });
      
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });

    it('maneja errores al refrescar el usuario', async () => {
      const user = userEvent.setup();
      
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Network error'));
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);
      
      // El usuario debe seguir sin autenticar
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('limpia el estado cuando el token es inválido', async () => {
      const user = userEvent.setup();
      
      // Configurar usuario autenticado inicialmente
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue({
        success: true,
        data: { id: 1, email: 'test@test.com', name: 'Test User' }
      });
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      // Cambiar la respuesta para simular token inválido
      mockAuthService.getCurrentUser.mockResolvedValue({
        success: false,
        data: null,
        error: 'Invalid token'
      });
      
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
    });
  });

  describe('estado de carga', () => {
    it('maneja múltiples operaciones concurrentes', async () => {
      const user = userEvent.setup();
      
      // Simular delays en las operaciones
      mockAuthService.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { user: { id: 1, email: 'test@test.com', name: 'Test User' } }
        }), 200))
      );
      
      mockAuthService.register.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { user: { id: 2, email: 'test2@test.com', name: 'Test User 2' } }
        }), 100))
      );
      
      renderWithAuth(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      // Iniciar login y register simultáneamente
      const loginButton = screen.getByText('Login');
      const registerButton = screen.getByText('Register');
      
      await user.click(loginButton);
      await user.click(registerButton);
      
      // Debe mostrar estado de carga
      expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
      
      // Esperar a que termine la operación más rápida
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
    });
  });
});

