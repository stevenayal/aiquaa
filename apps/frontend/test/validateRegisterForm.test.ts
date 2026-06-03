import { describe, it, expect } from 'vitest';
import { validateRegisterForm } from '../src/lib/auth/validateRegisterForm';

const VALID_CANDIDATO = {
  name: 'Juan Pérez',
  email: 'juan@example.com',
  audience: 'candidato' as const,
  role: 'qa_junior',
  companyName: '',
  ruc: '',
  password: 'Password1',
  confirmPassword: 'Password1',
};

const VALID_EMPRESA = {
  name: 'María López',
  email: 'maria@empresa.com',
  audience: 'empresa' as const,
  companyName: 'Acme SA',
  ruc: '80000001-1',
  role: '',
  password: 'Password1',
  confirmPassword: 'Password1',
};

describe('validateRegisterForm', () => {
  // ── Happy paths ─────────────────────────────────────────────────────────────

  describe('candidato válido', () => {
    it('sin errores cuando todos los campos son correctos', () => {
      expect(validateRegisterForm(VALID_CANDIDATO)).toEqual({});
    });
  });

  describe('empresa válida', () => {
    it('sin errores cuando todos los campos son correctos', () => {
      expect(validateRegisterForm(VALID_EMPRESA)).toEqual({});
    });
  });

  // ── Nombre ──────────────────────────────────────────────────────────────────

  describe('validación de nombre', () => {
    it('vacío → "Nombre obligatorio" para candidato', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: '' }).name).toBe('Nombre obligatorio');
    });

    it('vacío → "Nombre de contacto obligatorio" para empresa', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, name: '' }).name).toBe('Nombre de contacto obligatorio');
    });

    it('solo espacios → error obligatorio', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: '   ' }).name).toBe('Nombre obligatorio');
    });

    it('1 carácter → error de longitud', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: 'A' }).name).toBe('El nombre debe tener entre 2 y 50 caracteres');
    });

    it('51 caracteres → error de longitud', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: 'A'.repeat(51) }).name).toBe('El nombre debe tener entre 2 y 50 caracteres');
    });

    it('con números → error de caracteres', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: 'Juan123' }).name).toBe('El nombre solo puede contener letras');
    });

    it('con @ → error de caracteres', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: 'Juan@Pérez' }).name).toBe('El nombre solo puede contener letras');
    });

    it('con tildes y ñ → sin error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: 'Álvaro Núñez' }).name).toBeUndefined();
    });

    it('con apóstrofe → sin error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: "O'Brien" }).name).toBeUndefined();
    });

    it('con guion → sin error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, name: 'Ana-Lucía' }).name).toBeUndefined();
    });
  });

  // ── Empresa / companyName ────────────────────────────────────────────────────

  describe('validación de companyName', () => {
    it('vacío para empresa → error obligatorio', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, companyName: '' }).companyName).toBe('Nombre de la empresa obligatorio');
    });

    it('1 carácter para empresa → demasiado corto', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, companyName: 'A' }).companyName).toBe('Nombre demasiado corto');
    });

    it('2 caracteres para empresa → sin error', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, companyName: 'AB' }).companyName).toBeUndefined();
    });

    it('vacío para candidato → sin error (no aplica)', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, companyName: '' }).companyName).toBeUndefined();
    });
  });

  // ── RUC ─────────────────────────────────────────────────────────────────────

  describe('validación de RUC', () => {
    it('vacío para empresa → error obligatorio', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '' }).ruc).toBe('RUC obligatorio');
    });

    it('sin guion → formato inválido', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '800000011' }).ruc).toBe('Formato inválido. Ej: 80000001-1');
    });

    it('menos de 6 dígitos antes del guion → formato inválido', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '12345-1' }).ruc).toBe('Formato inválido. Ej: 80000001-1');
    });

    it('más de 8 dígitos antes del guion → formato inválido', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '123456789-1' }).ruc).toBe('Formato inválido. Ej: 80000001-1');
    });

    it('dígito verificador de 2 dígitos → formato inválido', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '80000001-12' }).ruc).toBe('Formato inválido. Ej: 80000001-1');
    });

    it('formato 6 dígitos válido → sin error', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '123456-7' }).ruc).toBeUndefined();
    });

    it('formato 7 dígitos válido → sin error', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '1234567-8' }).ruc).toBeUndefined();
    });

    it('formato 8 dígitos válido → sin error', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '80000001-1' }).ruc).toBeUndefined();
    });

    it('con espacios al rededor → trimea y valida', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, ruc: '  80000001-1  ' }).ruc).toBeUndefined();
    });

    it('RUC vacío para candidato → sin error (no aplica)', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, ruc: '' }).ruc).toBeUndefined();
    });
  });

  // ── Rol ─────────────────────────────────────────────────────────────────────

  describe('validación de rol', () => {
    it('vacío para candidato → error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, role: '' }).role).toBe('Seleccioná tu rol para continuar');
    });

    it('vacío para empresa → sin error (no aplica)', () => {
      expect(validateRegisterForm({ ...VALID_EMPRESA, role: '' }).role).toBeUndefined();
    });

    it('rol válido para candidato → sin error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, role: 'qa_senior' }).role).toBeUndefined();
    });
  });

  // ── Email ────────────────────────────────────────────────────────────────────

  describe('validación de email', () => {
    it('vacío → error obligatorio', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: '' }).email).toBe('Correo obligatorio');
    });

    it('solo espacios → error obligatorio', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: '   ' }).email).toBe('Correo obligatorio');
    });

    it('sin @ → correo inválido', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'invalido.com' }).email).toBe('Correo inválido');
    });

    it('sin dominio → correo inválido', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user@' }).email).toBe('Correo inválido');
    });

    it('TLD de 1 carácter → correo inválido', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user@a.b' }).email).toBe('Correo inválido');
    });

    it('.con → error tipográfico', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user@gmail.con' }).email).toBe('Parece un error tipográfico en el email');
    });

    it('.gmal → error tipográfico', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user@g.gmal' }).email).toBe('Parece un error tipográfico en el email');
    });

    it('.yaho → error tipográfico', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user@yahoo.yaho' }).email).toBe('Parece un error tipográfico en el email');
    });

    it('.homail como TLD → error tipográfico', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user@gmail.homail' }).email).toBe('Parece un error tipográfico en el email');
    });

    it('dominio homail.com (sin TLD tipográfico) → sin error de tipografía', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user@homail.com' }).email).toBeUndefined();
    });

    it('email válido con subdominio → sin error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user@mail.company.com' }).email).toBeUndefined();
    });

    it('email con + → sin error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, email: 'user+tag@example.org' }).email).toBeUndefined();
    });
  });

  // ── Contraseña ───────────────────────────────────────────────────────────────

  describe('validación de contraseña', () => {
    it('vacía → error obligatorio', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, password: '', confirmPassword: '' }).password).toBe('Contraseña obligatoria');
    });

    it('7 caracteres → muy corta', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, password: 'Pass1ab', confirmPassword: 'Pass1ab' }).password).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('sin mayúscula → error de complejidad', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, password: 'password1', confirmPassword: 'password1' }).password).toBe('Debe contener mayúscula, minúscula y número');
    });

    it('sin minúscula → error de complejidad', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, password: 'PASSWORD1', confirmPassword: 'PASSWORD1' }).password).toBe('Debe contener mayúscula, minúscula y número');
    });

    it('sin número → error de complejidad', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, password: 'PasswordABC', confirmPassword: 'PasswordABC' }).password).toBe('Debe contener mayúscula, minúscula y número');
    });

    it('confirmPassword vacía → error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, confirmPassword: '' }).confirmPassword).toBe('Confirmar contraseña obligatorio');
    });

    it('confirmPassword no coincide → error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, password: 'Password1', confirmPassword: 'Password2' }).confirmPassword).toBe('Las contraseñas no coinciden');
    });

    it('8 caracteres exactos con complejidad → sin error', () => {
      expect(validateRegisterForm({ ...VALID_CANDIDATO, password: 'Pass1234', confirmPassword: 'Pass1234' }).password).toBeUndefined();
    });
  });

  // ── Múltiples errores simultáneos ────────────────────────────────────────────

  describe('múltiples errores', () => {
    it('candidato completamente vacío → 5 errores (name, email, password, confirmPassword, role)', () => {
      const errors = validateRegisterForm({
        name: '',
        email: '',
        audience: 'candidato',
        companyName: '',
        ruc: '',
        role: '',
        password: '',
        confirmPassword: '',
      });
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.confirmPassword).toBeDefined();
      expect(errors.role).toBeDefined();
      expect(errors.companyName).toBeUndefined();
      expect(errors.ruc).toBeUndefined();
    });

    it('empresa completamente vacía → 6 errores (name, email, password, confirmPassword, companyName, ruc)', () => {
      const errors = validateRegisterForm({
        name: '',
        email: '',
        audience: 'empresa',
        companyName: '',
        ruc: '',
        role: '',
        password: '',
        confirmPassword: '',
      });
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.companyName).toBeDefined();
      expect(errors.ruc).toBeDefined();
      expect(errors.role).toBeUndefined();
    });

    it('no genera errores cruzados entre candidato y empresa', () => {
      const errors = validateRegisterForm(VALID_CANDIDATO);
      expect(errors.companyName).toBeUndefined();
      expect(errors.ruc).toBeUndefined();
    });
  });
});
