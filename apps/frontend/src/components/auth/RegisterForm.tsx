'use client';

import React, { useState, useTransition } from 'react';
import { registerAction, resendConfirmationAction } from '@/actions/auth';
import AuthForm from './AuthForm';

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
    password: '',
    confirmPassword: '',
    role: '',
  });

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Nombre obligatorio';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = 'El nombre debe tener entre 2 y 50 caracteres';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Correo obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Contraseña obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Debe contener mayúscula, minúscula y número';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmar contraseña obligatorio';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!formData.role) {
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
    data.set('email', formData.email);
    data.set('password', formData.password);
    data.set('name', formData.name);
    data.set('role', formData.role);

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
        setAlertMessage('¡Registro exitoso! Revisá tu email para confirmar tu cuenta.');
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
    if (showAlert) setShowAlert(false);
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => { const n = { ...prev }; delete n.role; return n; });
    }
  };

  return (
    <AuthForm
      mode="register"
      onSubmit={handleSubmit}
      isLoading={isPending}
      errors={errors}
      formData={formData}
      onFieldChange={handleChange}
      onRoleChange={handleRoleChange}
      onClearErrors={() => { setErrors({}); setShowAlert(false); }}
      socialLoginError={socialLoginError}
      onSocialError={() => {}}
      showAlert={showAlert}
      alertMessage={alertMessage}
      alertType={alertType}
      showResend={showResend}
      onResend={handleResend}
      isResending={isResending}
    />
  );
}
