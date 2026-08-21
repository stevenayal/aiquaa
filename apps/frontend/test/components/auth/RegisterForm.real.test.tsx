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
    onPasswordChange,
    onRoleChange,
    passwordRef,
    confirmPasswordRef,
    showAlert,
    alertMessage,
  }: any) => (
    <form onSubmit={onSubmit}>
      <button type="button" onClick={() => onRoleChange?.('estudiante')}>
        Estudiante
      </button>
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
        ref={passwordRef}
        defaultValue=""
        onChange={onPasswordChange ?? onFieldChange}
      />
      <input
        aria-label="Confirmar contraseña"
        name="confirmPassword"
        placeholder="Confirmar contraseña"
        ref={confirmPasswordRef}
        defaultValue=""
        onChange={onPasswordChange ?? onFieldChange}
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
    await user.type(screen.getByPlaceholderText('Contraseña'), 'Password123');
    await user.type(
      screen.getByPlaceholderText('Confirmar contraseña'),
      'Password456'
    );
    await user.click(getSubmitButton());

    expect(
      await screen.findByText('Las contraseñas no coinciden')
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('mapea el error de email duplicado del backend', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      success: false,
      message: 'email already exists',
    });

    render(<RegisterForm />);

    await user.type(
      screen.getByPlaceholderText('Nombre completo'),
      'QA Aiquaa'
    );
    await user.type(screen.getByPlaceholderText('Email'), 'qa@aiquaa.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'Password123');
    await user.type(
      screen.getByPlaceholderText('Confirmar contraseña'),
      'Password123'
    );
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'qa@aiquaa.com',
        name: 'QA Aiquaa',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    });

    expect(
      await screen.findByText(
        'Este email ya está registrado. Intenta iniciar sesión o usa otro email.'
      )
    ).toBeInTheDocument();
  });

  it('muestra éxito y programa la redirección al login tras registrarse', async () => {
    const setTimeoutSpy = vi
      .spyOn(globalThis, 'setTimeout')
      .mockImplementation(() => 0 as ReturnType<typeof setTimeout>);
    mockRegister.mockResolvedValue({
      success: true,
    });

    render(<RegisterForm />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Nombre completo'), {
        target: { value: 'QA Aiquaa' },
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'qa@aiquaa.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
        target: { value: 'Password123' },
      });
      fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), {
        target: { value: 'Password123' },
      });
      fireEvent.click(getSubmitButton());
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'qa@aiquaa.com',
      name: 'QA Aiquaa',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(
      screen.getByText(
        'Registro exitoso. Revisa tu email para verificar tu cuenta.'
      )
    ).toBeInTheDocument();
    expect(setTimeoutSpy).toHaveBeenCalledOnce();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
  });
});
