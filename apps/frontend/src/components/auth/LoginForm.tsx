'use client';

import React, { useState, useTransition } from 'react';
import { loginAction, resendConfirmationAction } from '@/actions/auth';
import AuthForm from './AuthForm';

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [socialLoginError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showResend, setShowResend] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Correo obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Contraseña obligatoria';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setShowAlert(false);
    setShowResend(false);

    if (!validateForm()) return;

    const data = new FormData();
    data.set('email', formData.email);
    data.set('password', formData.password);

    startTransition(async () => {
      const result = await loginAction(data);
      if (result?.error) {
        let msg = result.error;
        if (result.error.includes('Invalid login')) {
          msg = 'Credenciales inválidas. Verificá tu email y contraseña.';
        } else if (result.error.includes('Email not confirmed')) {
          msg = 'Tu email aún no fue confirmado. Revisá tu bandeja de entrada o reenviá el correo.';
          setShowResend(true);
        }
        setAlertMessage(msg);
        setAlertType('error');
        setShowAlert(true);
      }
    });
  };

  const handleResend = async () => {
    if (!formData.email) {
      setAlertMessage('Ingresá tu email primero.');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
    setIsResending(true);
    const result = await resendConfirmationAction(formData.email);
    setIsResending(false);
    if (result.error) {
      setAlertMessage('Error al reenviar: ' + result.error);
      setAlertType('error');
    } else {
      setAlertMessage('Correo de confirmación reenviado. Revisá tu bandeja de entrada.');
      setAlertType('success');
      setShowResend(false);
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

  return (
    <AuthForm
      mode="login"
      onSubmit={handleSubmit}
      isLoading={isPending}
      errors={errors}
      formData={formData}
      onFieldChange={handleChange}
      onClearErrors={() => { setErrors({}); setShowAlert(false); setShowResend(false); }}
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
