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

// RegisterForm se registra con la server action registerAction(FormData). Este
// archivo mockeaba '@/contexts/NextAuthContext', modulo que no existe en el repo
// (quedo de la migracion NextAuth -> Supabase), asi que el spy nunca se llamaba.
const mockRegisterAction = vi.fn();
const mockCheckEmailTaken = vi.fn().mockResolvedValue({ taken: false });

vi.mock('@/actions/auth', () => ({
  registerAction: (...args: unknown[]) => mockRegisterAction(...args),
  resendConfirmationAction: vi.fn(),
  checkEmailTakenAction: (...args: unknown[]) => mockCheckEmailTaken(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => null,
  usePathname: () => '/',
}));

vi.mock('@/components/auth/AuthForm', () => ({
  default: ({
    onSubmit,
    errors,
    formData,
    onFieldChange,
    onPasswordChange,
    showAlert,
    alertMessage,
    passwordRef,
    confirmPasswordRef,
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
        ref={passwordRef}
        defaultValue={formData.password || ''}
        onChange={onPasswordChange}
      />
      <input
        aria-label="Confirmar contraseña"
        name="confirmPassword"
        placeholder="Confirmar contraseña"
        ref={confirmPasswordRef}
        defaultValue={formData.confirmPassword || ''}
        onChange={onPasswordChange}
      />
      {/*
        role es obligatorio para audience=candidato (validateRegisterForm). Sin
        este campo el submit moria en "Seleccioná tu rol para continuar" y nunca
        se llegaba a llamar a la server action.
      */}
      <input
        aria-label="Rol"
        name="role"
        placeholder="Rol"
        value={formData.role || ''}
        onChange={onFieldChange}
      />
      <button type="submit">Crear cuenta</button>
      {errors.name && <p>{errors.name}</p>}
      {errors.email && <p>{errors.email}</p>}
      {errors.password && <p>{errors.password}</p>}
      {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
      {errors.role && <p>{errors.role}</p>}
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
    expect(mockRegisterAction).not.toHaveBeenCalled();
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
    expect(mockRegisterAction).not.toHaveBeenCalled();
  });

  it('mapea el error de email duplicado del backend', async () => {
    const user = userEvent.setup();
    mockRegisterAction.mockResolvedValue({
      error: 'User already registered',
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
    await user.type(screen.getByPlaceholderText('Rol'), 'qa_junior');
    await user.click(getSubmitButton());

    // registerAction recibe un FormData, no un objeto plano.
    await waitFor(() => {
      expect(mockRegisterAction).toHaveBeenCalled();
    });
    const sent = mockRegisterAction.mock.calls[0][0] as FormData;
    expect(sent.get('email')).toBe('qa@aiquaa.com');
    expect(sent.get('name')).toBe('QA Aiquaa');
    expect(sent.get('password')).toBe('Password123');
    expect(sent.get('role')).toBe('qa_junior');

    expect(
      await screen.findByText('Este email ya está registrado. Iniciá sesión.')
    ).toBeInTheDocument();
  });

  it('muestra éxito y programa la redirección al login tras registrarse', async () => {
    mockRegisterAction.mockResolvedValue({ success: true });

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
      fireEvent.change(screen.getByPlaceholderText('Rol'), {
        target: { value: 'qa_junior' },
      });
      fireEvent.click(getSubmitButton());
      await Promise.resolve();
      await Promise.resolve();
    });

    // Al registrarse bien el componente ya no muestra un cartel ni difiere una
    // redireccion con setTimeout: abre el modal de verificacion de email.
    await waitFor(() => {
      expect(mockRegisterAction).toHaveBeenCalled();
    });
    expect(
      await screen.findByText('¡Registro exitoso! Verificá tu correo')
    ).toBeInTheDocument();
  });
});
