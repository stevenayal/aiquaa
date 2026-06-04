'use client';

import React, { useRef, useState, useTransition } from 'react';
import { registerAction, resendConfirmationAction } from '@/actions/auth';
import AuthForm from './AuthForm';
import EmailVerificationModal from './EmailVerificationModal';
import { Audience } from './AudienceToggle';
import { validateRegisterForm } from '@/lib/auth/validateRegisterForm';

interface RegisterFormProps {
  lockedAudience?: Audience;
}

export default function RegisterForm({ lockedAudience }: RegisterFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [socialLoginError] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    audience: (lockedAudience ?? 'candidato') as Audience,
    companyName: '',
    ruc: '',
  });

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors = validateRegisterForm({
      name: formData.name,
      email: formData.email,
      audience: formData.audience,
      companyName: formData.companyName,
      ruc: formData.ruc,
      role: formData.role,
      password: passwordRef.current?.value ?? '',
      confirmPassword: confirmPasswordRef.current?.value ?? '',
    });
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
        setShowVerifyModal(true);
      }
    });
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
    <>
    {showVerifyModal && (
      <EmailVerificationModal
        email={formData.email}
        context="post-register"
        onClose={() => setShowVerifyModal(false)}
        onResend={handleResend}
      />
    )}
    <AuthForm
      mode="register"
      onSubmit={handleSubmit}
      isLoading={isPending}
      errors={errors}
      formData={formData}
      onFieldChange={handleChange}
      onPasswordChange={handlePasswordChange}
      onRoleChange={handleRoleChange}
      onAudienceChange={lockedAudience ? undefined : handleAudienceChange}
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
      confirmPasswordRef={confirmPasswordRef}
    />
    </>
  );
}
