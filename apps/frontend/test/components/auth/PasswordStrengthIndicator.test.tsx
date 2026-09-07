import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  describe('Password Requirements Display', () => {
    it('muestra todos los requisitos como no cumplidos con contraseña vacía', () => {
      render(<PasswordStrengthIndicator password="" />);

      // Verificar que todos los requisitos están presentes
      expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Una letra mayúscula')).toBeInTheDocument();
      expect(screen.getByText('Una letra minúscula')).toBeInTheDocument();
      expect(screen.getByText('Un número')).toBeInTheDocument();
    });

    it('marca requisito de longitud como cumplido con 8+ caracteres', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="12345678" />
      );

      const lengthRequirement = screen
        .getByText('Mínimo 8 caracteres')
        .closest('li');
      expect(lengthRequirement).toHaveClass('text-green-600');
    });

    it('marca requisito de mayúscula como cumplido', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="Test" />
      );

      const upperRequirement = screen
        .getByText('Una letra mayúscula')
        .closest('li');
      expect(upperRequirement).toHaveClass('text-green-600');
    });

    it('marca requisito de minúscula como cumplido', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="test" />
      );

      const lowerRequirement = screen
        .getByText('Una letra minúscula')
        .closest('li');
      expect(lowerRequirement).toHaveClass('text-green-600');
    });

    it('marca requisito de número como cumplido', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="test1" />
      );

      const numberRequirement = screen.getByText('Un número').closest('li');
      expect(numberRequirement).toHaveClass('text-green-600');
    });

    it('marca todos los requisitos como cumplidos con contraseña válida', () => {
      render(<PasswordStrengthIndicator password="Test1234" />);

      const lengthReq = screen.getByText('Mínimo 8 caracteres').closest('li');
      const upperReq = screen.getByText('Una letra mayúscula').closest('li');
      const lowerReq = screen.getByText('Una letra minúscula').closest('li');
      const numberReq = screen.getByText('Un número').closest('li');

      expect(lengthReq).toHaveClass('text-green-600');
      expect(upperReq).toHaveClass('text-green-600');
      expect(lowerReq).toHaveClass('text-green-600');
      expect(numberReq).toHaveClass('text-green-600');
    });
  });

  describe('Strength Bar Display', () => {
    it('no muestra barra de fuerza con contraseña vacía', () => {
      render(
        <PasswordStrengthIndicator password="" showRequirements={false} />
      );

      expect(
        screen.queryByText(/Fuerza de contraseña:/)
      ).not.toBeInTheDocument();
    });

    it('muestra barra roja con contraseña débil (25% fuerza)', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="test" />
      );

      expect(screen.getByText('Débil')).toBeInTheDocument();
      const bar = container.querySelector('.bg-red-500');
      expect(bar).toBeInTheDocument();
    });

    // "Test1" cumple mayuscula, minuscula y numero = 3 de 4 requisitos = 75%,
    // o sea 'Buena' y barra azul, no 'Media'. El fixture no coincidia con el
    // caso que el test dice cubrir. "test1" cumple minuscula y numero = 2 de 4
    // = 50% exacto, que es la franja amarilla / 'Media'.
    it('muestra barra amarilla con contraseña media (50% fuerza)', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="test1" />
      );

      expect(screen.getByText('Media')).toBeInTheDocument();
      const bar = container.querySelector('.bg-yellow-500');
      expect(bar).toBeInTheDocument();
    });

    it('muestra barra azul con contraseña buena (75% fuerza)', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="Test123" />
      );

      expect(screen.getByText('Buena')).toBeInTheDocument();
      const bar = container.querySelector('.bg-blue-500');
      expect(bar).toBeInTheDocument();
    });

    it('muestra barra verde con contraseña fuerte (100% fuerza)', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="Test1234" />
      );

      expect(screen.getByText('Fuerte')).toBeInTheDocument();
      const bar = container.querySelector('.bg-green-500');
      expect(bar).toBeInTheDocument();
    });

    it('calcula ancho de barra correctamente según fuerza', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="Test1234" />
      );

      const bar = container.querySelector('.bg-green-500');
      expect(bar).toHaveStyle({ width: '100%' });
    });
  });

  describe('Visibility Control', () => {
    it('oculta requisitos cuando showRequirements es false', () => {
      render(
        <PasswordStrengthIndicator
          password="Test1234"
          showRequirements={false}
        />
      );

      expect(screen.queryByText('Requisitos:')).not.toBeInTheDocument();
    });

    it('muestra requisitos cuando showRequirements es true', () => {
      render(
        <PasswordStrengthIndicator
          password="Test1234"
          showRequirements={true}
        />
      );

      expect(screen.getByText('Requisitos:')).toBeInTheDocument();
    });

    it('retorna null cuando no hay contraseña y showRequirements es false', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="" showRequirements={false} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('maneja contraseñas con caracteres especiales', () => {
      render(<PasswordStrengthIndicator password="Test123!@#" />);

      expect(screen.getByText('Fuerte')).toBeInTheDocument();
    });

    it('maneja contraseñas muy largas', () => {
      const longPassword = 'Test1234'.repeat(10);
      render(<PasswordStrengthIndicator password={longPassword} />);

      expect(screen.getByText('Fuerte')).toBeInTheDocument();
    });

    it('maneja solo espacios como contraseña inválida', () => {
      render(<PasswordStrengthIndicator password="        " />);

      const lengthReq = screen.getByText('Mínimo 8 caracteres').closest('li');
      expect(lengthReq).toHaveClass('text-green-600'); // 8 espacios cumplen longitud

      const upperReq = screen.getByText('Una letra mayúscula').closest('li');
      expect(upperReq).toHaveClass('text-gray-500'); // No hay mayúscula
    });
  });
});
