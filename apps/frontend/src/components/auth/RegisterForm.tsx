'use client';

import React, { useRef, useState, useTransition } from 'react';
import { registerAction, resendConfirmationAction } from '@/actions/auth';
import AuthForm from './AuthForm';
import { Audience } from './AudienceToggle';

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [socialLoginError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    audience: 'candidato' as Audience,
    companyName: '',
    ruc: '',
  });

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const isEmpresa = formData.audience === 'empresa';

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = isEmpresa
        ? 'Nombre de contacto obligatorio'
        : 'Nombre obligatorio';
    } else if (trimmedName.length < 2 || trimmedName.length > 50) {
      newErrors.name = 'El nombre debe tener entre 2 y 50 caracteres';
    } else if (!/^[a-zA-ZÀ-ÿñÑ\s'\-]+$/.test(trimmedName)) {
      newErrors.name = 'El nombre solo puede contener letras';
    }

    if (isEmpresa) {
      const company = formData.companyName.trim();
      if (!company) newErrors.companyName = 'Nombre de la empresa obligatorio';
      else if (company.length < 2)
        newErrors.companyName = 'Nombre demasiado corto';

      const ruc = formData.ruc.trim();
      if (!ruc) {
        newErrors.ruc = 'RUC obligatorio';
      } else if (!/^\d{6,8}-\d$/.test(ruc)) {
        newErrors.ruc = 'Formato inválido. Ej: 80000001-1';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Correo obligatorio';
    } else if (
      !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = 'Correo inválido';
    } else if (
      /\.(con|cmo|gmal|gamil|yaho|homail|outlok)$/i.test(formData.email)
    ) {
      newErrors.email = 'Parece un error tipográfico en el email';
    }

    const password = passwordRef.current?.value ?? '';
    const confirmPassword = confirmPasswordRef.current?.value ?? '';

    if (!password) newErrors.password = 'Contraseña obligatoria';
    else if (password.length < 8)
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      newErrors.password = 'Debe contener mayúscula, minúscula y número';

    if (!confirmPassword)
      newErrors.confirmPassword = 'Confirmar contraseña obligatorio';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Las contraseñas no coinciden';

    if (!isEmpresa && !formData.role) {
      newErrors.role = 'Seleccioná tu rol para continuar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setShowAlert(false);

    if (!validateForm()) return;

    const data = new FormData();
    data.set('email', formData.email.trim());
    data.set('password', passwordRef.current?.value ?? '');
    data.set('name', formData.name.trim());
    data.set('audience', formData.audience);
    if (formData.audience === 'empresa') {
      data.set('companyName', formData.companyName.trim());
      data.set('ruc', formData.ruc.trim());
    } else {
      data.set('role', formData.role);
    }

    startTransition(async () => {
      const result = await registerAction(data);
      if (result?.error) {
        let msg = result.error;
        if (result.error.includes('already registered')) {
          msg = 'Este email ya está registrado. Intentá iniciar sesión.';
        }
        setAlertMessage(msg);
        setAlertType('error');
        setShowAlert(true);
      } else if (result?.success) {
        setAlertMessage(
          '¡Registro exitoso! Revisá tu email para confirmar tu cuenta.'
        );
        setAlertType('success');
        setShowAlert(true);
        setShowResend(true);
      }
    });
  };

  const handleResend = async () => {
    setIsResending(true);
    const result = await resendConfirmationAction(formData.email);
    setIsResending(false);
    if (result.error) {
      setAlertMessage('Error al reenviar: ' + result.error);
      setAlertType('error');
    } else {
      setAlertMessage('Correo reenviado. Revisá tu bandeja de entrada.');
      setAlertType('success');
    }
    setShowAlert(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
    if (showAlert) setShowAlert(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
    if (showAlert) setShowAlert(false);
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errors.role) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n.role;
        return n;
      });
    }
  };

  const handleAudienceChange = (audience: Audience) => {
    setFormData((prev) => ({ ...prev, audience }));
    setErrors({});
    if (showAlert) setShowAlert(false);
  };

  return (
    <AuthForm
      mode="register"
      onSubmit={handleSubmit}
      isLoading={isPending}
      errors={errors}
      formData={formData}
      onFieldChange={handleChange}
      onPasswordChange={handlePasswordChange}
      onRoleChange={handleRoleChange}
      onAudienceChange={handleAudienceChange}
      onClearErrors={() => {
        setErrors({});
        setShowAlert(false);
      }}
      socialLoginError={socialLoginError}
      onSocialError={() => {}}
      showAlert={showAlert}
      alertMessage={alertMessage}
      alertType={alertType}
      showResend={showResend}
      onResend={handleResend}
      isResending={isResending}
      passwordRef={passwordRef}
      confirmPasswordRef={confirmPasswordRef}
    />
  );
}
