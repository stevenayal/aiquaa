import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordInput from '@/components/auth/PasswordInput';

describe('PasswordInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renderiza input de contraseña correctamente', () => {
      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Ingrese contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Ingrese contraseña');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('aplica className correctamente', () => {
      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
          className="custom-class border-red-500"
        />
      );

      const input = screen.getByPlaceholderText('Contraseña');
      expect(input).toHaveClass('custom-class', 'border-red-500');
    });

    it('muestra el valor proporcionado', () => {
      render(
        <PasswordInput
          id="password"
          name="password"
          value="test123"
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Contraseña') as HTMLInputElement;
      expect(input.value).toBe('test123');
    });
  });

  describe('Toggle Visibility', () => {
    it('muestra botón de toggle cuando showToggle es true', () => {
      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
          showToggle={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('oculta botón de toggle cuando showToggle es false', () => {
      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
          showToggle={false}
        />
      );

      const toggleButton = screen.queryByRole('button', { name: /mostrar contraseña/i });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('cambia tipo de input a text al hacer click en toggle', async () => {
      const user = userEvent.setup();

      render(
        <PasswordInput
          id="password"
          name="password"
          value="secreto"
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Contraseña') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });

      expect(input.type).toBe('password');

      await user.click(toggleButton);

      expect(input.type).toBe('text');
      expect(screen.getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();
    });

    it('cambia tipo de input de text a password al hacer segundo click', async () => {
      const user = userEvent.setup();

      render(
        <PasswordInput
          id="password"
          name="password"
          value="secreto"
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Contraseña') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });

      // Primer click - mostrar
      await user.click(toggleButton);
      expect(input.type).toBe('text');

      // Segundo click - ocultar
      const hideButton = screen.getByRole('button', { name: /ocultar contraseña/i });
      await user.click(hideButton);

      expect(input.type).toBe('password');
      expect(screen.getByRole('button', { name: /mostrar contraseña/i })).toBeInTheDocument();
    });

    it('alterna entre iconos de ojo abierto y cerrado', async () => {
      const user = userEvent.setup();

      render(
        <PasswordInput
          id="password"
          name="password"
          value="test"
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });

      // Inicialmente muestra icono de ojo abierto (para mostrar)
      await user.click(toggleButton);

      // Después de click muestra icono de ojo cerrado (para ocultar)
      expect(screen.getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('llama onChange cuando el usuario escribe', async () => {
      const user = userEvent.setup();

      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Contraseña');

      await user.type(input, 'test123');

      expect(mockOnChange).toHaveBeenCalledTimes(7); // Una vez por cada carácter
    });

    it('pasa el evento correcto a onChange', async () => {
      const user = userEvent.setup();

      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Contraseña');

      await user.type(input, 'a');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'password',
            value: 'a',
          }),
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('tiene aria-label apropiado en botón de toggle', () => {
      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const toggleButton = screen.getByLabelText(/mostrar contraseña/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('actualiza aria-label cuando cambia el estado', async () => {
      const user = userEvent.setup();

      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const toggleButton = screen.getByLabelText(/mostrar contraseña/i);

      await user.click(toggleButton);

      expect(screen.getByLabelText(/ocultar contraseña/i)).toBeInTheDocument();
    });

    it('tiene id y name correctos', () => {
      render(
        <PasswordInput
          id="test-password"
          name="testPassword"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Contraseña');
      expect(input).toHaveAttribute('id', 'test-password');
      expect(input).toHaveAttribute('name', 'testPassword');
    });

    it('soporta autocomplete attribute', () => {
      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
          autoComplete="new-password"
        />
      );

      const input = screen.getByPlaceholderText('Contraseña');
      expect(input).toHaveAttribute('autocomplete', 'new-password');
    });
  });

  describe('Edge Cases', () => {
    it('maneja valores vacíos correctamente', () => {
      render(
        <PasswordInput
          id="password"
          name="password"
          value=""
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Contraseña') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('maneja contraseñas muy largas', () => {
      const longPassword = 'a'.repeat(1000);

      render(
        <PasswordInput
          id="password"
          name="password"
          value={longPassword}
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Contraseña') as HTMLInputElement;
      expect(input.value).toBe(longPassword);
    });

    it('mantiene estado de visibilidad al cambiar valor', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <PasswordInput
          id="password"
          name="password"
          value="test"
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
      await user.click(toggleButton);

      const input = screen.getByPlaceholderText('Contraseña') as HTMLInputElement;
      expect(input.type).toBe('text');

      // Simular cambio de valor desde el padre
      rerender(
        <PasswordInput
          id="password"
          name="password"
          value="newtest"
          placeholder="Contraseña"
          onChange={mockOnChange}
        />
      );

      // El tipo debe permanecer como 'text'
      expect(input.type).toBe('text');
    });
  });
});
