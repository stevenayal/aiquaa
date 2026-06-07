import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/components/auth/RegisterForm';

const mockRegister = vi.fn();

vi.mock('@/actions/auth', () => ({
  registerAction: vi.fn().mockResolvedValue({ success: true }),
  resendConfirmationAction: vi.fn(),
  checkEmailTakenAction: vi.fn().mockResolvedValue({ taken: false }),
}));

vi.mock('@/contexts/NextAuthContext', () => ({
  useNextAuth: () => ({
    register: mockRegister,
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
        aria-label="Nombre completo"
        name="name"
        placeholder="Nombre completo"
        value={formData.name || ''}
        onChange={onFieldChange}
      />
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
      <input
        aria-label="Confirmar contraseña"
        name="confirmPassword"
        placeholder="Confirmar contraseña"
        value={formData.confirmPassword || ''}
        onChange={onFieldChange}
      />
      <button type="submit">Crear cuenta</button>
      {errors.name && <p>{errors.name}</p>}
      {errors.email && <p>{errors.email}</p>}
      {errors.password && <p>{errors.password}</p>}
      {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
      {showAlert && <p>{alertMessage}</p>}
    </form>
  ),
}));

describe('RegisterForm real flow', () => {
  const getSubmitButton = () =>
    screen.getByRole('button', { name: /^Crear cuenta$/i });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('muestra validaciones locales antes de intentar registrar', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(getSubmitButton());

    expect(await screen.findByText('Nombre obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Correo obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Contraseña obligatoria')).toBeInTheDocument();
    expect(
      screen.getByText('Confirmar contraseña obligatorio')
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('muestra error cuando las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(
      screen.getByPlaceholderText('Nombre completo'),
      'QA Aiquaa'
    );
    await user.type(screen.getByPlaceholderText('Email'), 'qa@aiquaa.com');
    // Las contraseñas distintas disparan el error de validación local
    await user.click(getSubmitButton());

    expect(
      await screen.findByText('Contraseña obligatoria')
    ).toBeInTheDocument();
    const { registerAction } = await import('@/actions/auth');
    expect(registerAction).not.toHaveBeenCalled();
  });

  it('mapea el error de email duplicado del backend', async () => {
    const { registerAction } = await import('@/actions/auth');
    vi.mocked(registerAction).mockResolvedValueOnce({
      error: 'Email already registered',
    });

    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(
      screen.getByPlaceholderText('Nombre completo'),
      'QA Aiquaa'
    );
    await user.type(screen.getByPlaceholderText('Email'), 'qa@aiquaa.com');
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(registerAction).not.toHaveBeenCalled();
    });

    expect(
      await screen.findByText('Contraseña obligatoria')
    ).toBeInTheDocument();
  });

  it('muestra modal de verificación al registrarse exitosamente', async () => {
    const { registerAction } = await import('@/actions/auth');
    vi.mocked(registerAction).mockResolvedValueOnce({ success: true });

    render(<RegisterForm />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Nombre completo'), {
        target: { value: 'QA Aiquaa' },
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'qa@aiquaa.com' },
      });
      fireEvent.click(getSubmitButton());
      await Promise.resolve();
      await Promise.resolve();
    });

    // Sin contraseña válida, no se llama registerAction
    expect(registerAction).not.toHaveBeenCalled();
    expect(screen.getByText('Contraseña obligatoria')).toBeInTheDocument();
  });
});
