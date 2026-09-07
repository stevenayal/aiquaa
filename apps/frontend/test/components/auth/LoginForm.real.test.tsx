import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/auth/LoginForm';

// LoginForm autentica contra Supabase (createClient().auth.signInWithPassword).
// Este archivo mockeaba '@/contexts/NextAuthContext', un modulo que no existe en
// el repo: quedo de la migracion NextAuth -> Supabase. El spy nunca se llamaba y
// los tests fallaban por eso, no por el comportamiento del componente.
const mockSignInWithPassword = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignInWithPassword },
  }),
}));

vi.mock('@/actions/auth', () => ({
  resendConfirmationAction: vi.fn(),
}));

// Este factory reemplaza por completo al mock global de test/setup.ts, asi que
// tiene que declarar TODOS los hooks que use el componente. Faltaba useRouter,
// que LoginForm llama en el primer render: el componente explotaba antes de
// montar y los tres tests del archivo fallaban por eso, no por su asercion.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: mockRefresh,
  }),
  useSearchParams: () => null,
  usePathname: () => '/',
  redirect: vi.fn(),
}));

vi.mock('@/components/auth/AuthForm', () => ({
  default: ({
    onSubmit,
    errors,
    formData,
    onFieldChange,
    showAlert,
    alertMessage,
    passwordRef,
  }: any) => (
    <form onSubmit={onSubmit}>
      <input
        aria-label="Email"
        name="email"
        placeholder="Email"
        value={formData.email || ''}
        onChange={onFieldChange}
      />
      {/*
        LoginForm lee la contraseña por ref, no por estado. Sin reenviar
        passwordRef el ref quedaba en null, la contraseña se leia siempre como ''
        y el submit moria en "Contraseña obligatoria".
      */}
      <input
        aria-label="Contraseña"
        name="password"
        placeholder="Contraseña"
        ref={passwordRef}
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
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('muestra mensaje de credenciales inválidas cuando Supabase rechaza el login', async () => {
    const user = userEvent.setup();
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText('Email'), 'qa@aiquaa.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'bad-password');
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'qa@aiquaa.com',
        password: 'bad-password',
      });
    });

    expect(
      await screen.findByText(
        'Credenciales inválidas. Verificá tu email y contraseña.'
      )
    ).toBeInTheDocument();
  });

  // Regresion de P0-6 (Ley de Postel). Pegar el email desde un gestor de
  // contraseñas arrastra espacios invisibles. Antes la regex de validacion,
  // anclada en ^ y $, los rechazaba con "Correo inválido" sin siquiera intentar
  // autenticar: un email valido rechazado por algo que el usuario no ve.
  it('acepta un email con espacios alrededor y lo envía recortado', async () => {
    const user = userEvent.setup();
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText('Email'), '  qa@aiquaa.com  ');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'Password123');
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'qa@aiquaa.com',
        password: 'Password123',
      });
    });

    expect(screen.queryByText('Correo inválido')).not.toBeInTheDocument();
  });

  // En el camino feliz LoginForm ya no muestra un cartel de "Redirigiendo..." ni
  // difiere nada con setTimeout: navega directo con router.push. El test seguia
  // esperando el cartel y un setTimeout de 1500 ms que el componente dejo de usar.
  it('redirige al ranking cuando el login responde correctamente', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { user_metadata: { audience: 'candidato' } } },
      error: null,
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

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'qa@aiquaa.com',
      password: 'Password123',
    });
    expect(mockPush).toHaveBeenCalledWith('/ranking?welcome=1');
    expect(mockRefresh).toHaveBeenCalled();
  });
});
