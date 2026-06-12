'use client';

import React, { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resendConfirmationAction } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import AuthForm from './AuthForm';
import EmailVerificationModal from './EmailVerificationModal';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [socialLoginError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);

  const getSafeRedirect = () => {
    const redirect = searchParams?.get('redirect');
    if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
      return null;
    }
    return redirect;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Correo obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    const password = passwordRef.current?.value ?? '';
    if (!password.trim()) {
      newErrors.password = 'Contraseña obligatoria';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setShowAlert(false);

    if (!validateForm()) return;

    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: passwordRef.current?.value ?? '',
    });
    setIsLoading(false);

    if (error) {
      let msg = error.message;
      if (error.message.includes('Invalid login')) {
        msg = 'Credenciales inválidas. Verificá tu email y contraseña.';
      } else if (error.message.includes('Email not confirmed')) {
        setShowVerifyModal(true);
        return;
      } else if (
        error.message.toLowerCase().includes('fetch') ||
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('failed')
      ) {
        msg = 'Error de conexión. Verificá tu internet e intentá de nuevo.';
      }
      setAlertMessage(msg);
      setAlertType('error');
      setShowAlert(true);
    } else {
      const audience = data.user?.user_metadata?.audience;
      router.push(
        getSafeRedirect() ??
          (audience === 'empresa' ? '/empresa' : '/ranking?welcome=1')
      );
      router.refresh();
    }
  };

  const handleResend = async () => {
    const result = await resendConfirmationAction(formData.email);
    if (result.error) throw new Error(result.error);
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

  return (
    <>
      {showVerifyModal && (
        <EmailVerificationModal
          email={formData.email}
          context="login-blocked"
          onClose={() => setShowVerifyModal(false)}
          onResend={handleResend}
        />
      )}
      <AuthForm
        mode="login"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        errors={errors}
        formData={formData}
        onFieldChange={handleChange}
        onPasswordChange={handlePasswordChange}
        onClearErrors={() => {
          setErrors({});
          setShowAlert(false);
        }}
        socialLoginError={socialLoginError}
        onSocialError={() => {}}
        showAlert={showAlert}
        alertMessage={alertMessage}
        alertType={alertType}
        showResend={false}
        passwordRef={passwordRef}
      />
    </>
  );
}
