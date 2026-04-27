import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/components/auth/RegisterForm';
import { NextAuthProvider } from '@/contexts/NextAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock Server Actions — MSW intercepts fetch, not Next.js server actions
vi.mock('@/actions/auth', () => ({
  registerAction: vi.fn(),
  resendConfirmationAction: vi.fn(),
}));

// Mock del SessionProvider de next-auth
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock del useRouter de Next.js
vi.mock('next/navigation', () => ({
  useSearchParams: () => null,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

import { registerAction } from '@/actions/auth';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <NextAuthProvider>
          {component}
        </NextAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(registerAction).mockResolvedValue({ success: true });
  });

  describe('Form Rendering', () => {
    it('renderiza todos los campos del formulario', () => {
      renderWithProviders(<RegisterForm />);

      expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    });

    it('renderiza botón de crear cuenta', () => {
      renderWithProviders(<RegisterForm />);

      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    it('renderiza indicador de fuerza de contraseña', () => {
      renderWithProviders(<RegisterForm />);

      expect(screen.getByText('Requisitos:')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('muestra error si el nombre está vacío', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Nombre obligatorio')).toBeInTheDocument();
      });
    });

    it('muestra error si el nombre es muy corto', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      await user.type(nameInput, 'A');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('El nombre debe tener entre 2 y 50 caracteres')).toBeInTheDocument();
      });
    });

    it('muestra error si el nombre contiene números (issue #24)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      await user.type(nameInput, '234234 43234324');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('El nombre solo puede contener letras')).toBeInTheDocument();
      });
    });

    it('muestra error si el nombre es solo espacios en blanco (issue #25)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      await user.type(nameInput, '   ');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Nombre obligatorio')).toBeInTheDocument();
      });
    });

    it('acepta nombre con caracteres especiales válidos (tildes, guion, apóstrofe)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      await user.type(nameInput, "María O'Brien-González");

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('El nombre solo puede contener letras')).not.toBeInTheDocument();
      });
    });

    it('muestra error si el email está vacío', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      await user.type(nameInput, 'John Doe');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Correo obligatorio')).toBeInTheDocument();
      });
    });

    it('muestra error si el email es inválido', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Correo inválido')).toBeInTheDocument();
      });
    });

    it('muestra error si la contraseña es muy corta', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Short1');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument();
      });
    });

    it('muestra error si la contraseña no cumple requisitos de complejidad', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'weakpassword');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Debe contener mayúscula, minúscula y número')
        ).toBeInTheDocument();
      });
    });

    it('muestra error si las contraseñas no coinciden', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password456');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
      });
    });

    it('limpia errores al modificar un campo', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Nombre obligatorio')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Nombre completo');
      await user.type(nameInput, 'John');

      await waitFor(() => {
        expect(screen.queryByText('Nombre obligatorio')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('envía formulario con datos válidos', async () => {
      const user = userEvent.setup();

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const roleButton = screen.getByRole('button', { name: /estudiante/i });
      await user.click(roleButton);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/registro exitoso/i)).toBeInTheDocument();
      });
    });

    it('muestra mensaje de éxito después de registro exitoso', async () => {
      const user = userEvent.setup();

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const roleButton = screen.getByRole('button', { name: /estudiante/i });
      await user.click(roleButton);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/registro exitoso/i)).toBeInTheDocument();
      });
    });

    it('muestra error cuando el email ya existe', async () => {
      vi.mocked(registerAction).mockResolvedValue({ error: 'Email already registered' });

      const user = userEvent.setup();

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const roleButton = screen.getByRole('button', { name: /estudiante/i });
      await user.click(roleButton);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/este email ya está registrado/i)).toBeInTheDocument();
      });
    });

    it('muestra error de validación', async () => {
      const user = userEvent.setup();

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');

      await user.type(nameInput, 'J'); // Nombre muy corto para disparar error
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Pass123');
      await user.type(confirmInput, 'Pass123');

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nombre debe tener entre 2 y 50 caracteres/i)).toBeInTheDocument();
      });
    });

    it('deshabilita botón durante el envío', async () => {
      const user = userEvent.setup();

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmInput, 'Password123');

      const roleButton = screen.getByRole('button', { name: /estudiante/i });
      await user.click(roleButton);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      // El botón debe estar deshabilitado inmediatamente después del click
      expect(submitButton).toBeDisabled();

      // Esperar a que termine el proceso
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });
  });

  describe('Password Strength Indicator Integration', () => {
    it('muestra indicador de fuerza mientras el usuario escribe', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const passwordInput = screen.getByLabelText('Contraseña');

      await user.type(passwordInput, 'weak');

      await waitFor(() => {
        expect(screen.getByText('Débil')).toBeInTheDocument();
      });

      await user.clear(passwordInput);
      await user.type(passwordInput, 'Strong123');

      await waitFor(() => {
        expect(screen.getByText('Fuerte')).toBeInTheDocument();
      });
    });
  });
});
