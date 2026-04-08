import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/auth/LoginForm';

const mockSignInWithCredentials = vi.fn();

vi.mock('@/contexts/NextAuthContext', () => ({
  useNextAuth: () => ({
    signInWithCredentials: mockSignInWithCredentials,
  }),
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => null,
}));

vi.mock('@/components/auth/AuthForm', () => ({
  default: ({
    onSubmit,
    errors,
    formData,
    onFieldChange,
    showAlert,
    alertMessage,
  }: any) => (
    <form onSubmit={onSubmit}>
      <input
        aria-label="Email"
        name="email"
        placeholder="Email"
        value={formData.email || ''}
        onChange={onFieldChange}
      />
      <input
        aria-label="Contraseña"
        name="password"
        placeholder="Contraseña"
        value={formData.password || ''}
        onChange={onFieldChange}
      />
      <button type="submit">Iniciar sesión</button>
      {errors.email && <p>{errors.email}</p>}
      {errors.password && <p>{errors.password}</p>}
      {showAlert && <p>{alertMessage}</p>}
    </form>
  ),
}));

describe('LoginForm real flow', () => {
  const getSubmitButton = () =>
    screen.getByRole('button', { name: /^Iniciar sesión$/i });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('muestra validaciones locales antes de intentar autenticar', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(getSubmitButton());

    expect(await screen.findByText('Correo obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Contraseña obligatoria')).toBeInTheDocument();
    expect(mockSignInWithCredentials).not.toHaveBeenCalled();
  });

  it('muestra mensaje de credenciales inválidas cuando NextAuth rechaza el login', async () => {
    const user = userEvent.setup();
    mockSignInWithCredentials.mockResolvedValue({
      success: false,
      error: 'CredentialsSignin',
    });

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText('Email'), 'qa@aiquaa.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'bad-password');
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(mockSignInWithCredentials).toHaveBeenCalledWith({
        email: 'qa@aiquaa.com',
        password: 'bad-password',
      });
    });

    expect(
      await screen.findByText('Credenciales inválidas. Verifica tu email y contraseña.')
    ).toBeInTheDocument();
  });

  it('muestra éxito cuando el login con credenciales responde correctamente', async () => {
    const setTimeoutSpy = vi
      .spyOn(globalThis, 'setTimeout')
      .mockImplementation(() => 0 as ReturnType<typeof setTimeout>);
    mockSignInWithCredentials.mockResolvedValue({
      success: true,
    });

    render(<LoginForm />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'qa@aiquaa.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'Password123' },
      });
      fireEvent.click(getSubmitButton());
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSignInWithCredentials).toHaveBeenCalledWith({
      email: 'qa@aiquaa.com',
      password: 'Password123',
    });
    expect(
      screen.getByText('Inicio de sesión exitoso. Redirigiendo...')
    ).toBeInTheDocument();
    expect(setTimeoutSpy).toHaveBeenCalledOnce();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1500);
  });
});
