export interface RegisterFormInput {
  name: string;
  email: string;
  audience: 'candidato' | 'empresa';
  companyName?: string;
  ruc?: string;
  role?: string;
  password: string;
  confirmPassword: string;
}

export function validateRegisterForm(input: RegisterFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const {
    name,
    email,
    audience,
    companyName = '',
    ruc = '',
    role = '',
    password,
    confirmPassword,
  } = input;
  const isEmpresa = audience === 'empresa';

  const trimmedName = name.trim();
  if (!trimmedName) {
    errors.name = isEmpresa ? 'Nombre de contacto obligatorio' : 'Nombre obligatorio';
  } else if (trimmedName.length < 2 || trimmedName.length > 50) {
    errors.name = 'El nombre debe tener entre 2 y 50 caracteres';
  } else if (!/^[a-zA-ZÀ-ÿñÑ\s'\-]+$/.test(trimmedName)) {
    errors.name = 'El nombre solo puede contener letras';
  }

  if (isEmpresa) {
    const company = companyName.trim();
    if (!company) errors.companyName = 'Nombre de la empresa obligatorio';
    else if (company.length < 2) errors.companyName = 'Nombre demasiado corto';

    const rucTrimmed = ruc.trim();
    if (!rucTrimmed) {
      errors.ruc = 'RUC obligatorio';
    } else if (!/^\d{6,8}-\d$/.test(rucTrimmed)) {
      errors.ruc = 'Formato inválido. Ej: 80000001-1';
    }
  }

  if (!email.trim()) {
    errors.email = 'Correo obligatorio';
  } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) {
    errors.email = 'Correo inválido';
  } else if (/\.(con|cmo|gmal|gamil|yaho|homail|outlok)$/i.test(email)) {
    errors.email = 'Parece un error tipográfico en el email';
  }

  if (!password) {
    errors.password = 'Contraseña obligatoria';
  } else if (password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = 'Debe contener mayúscula, minúscula y número';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirmar contraseña obligatorio';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  if (!isEmpresa && !role) {
    errors.role = 'Seleccioná tu rol para continuar';
  }

  return errors;
}
