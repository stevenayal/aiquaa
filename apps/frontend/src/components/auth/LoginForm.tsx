'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import AuthForm from './AuthForm';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');
  const [socialLoginError, setSocialLoginError] = useState<string | null>(null);

  // Validaciones en JavaScript
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Correo obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }

    // Validar contraseña
    if (!formData.password.trim()) {
      newErrors.password = 'Contraseña obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setErrors({});
    setShowAlert(false);
    setSocialLoginError(null);

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        // Manejar errores específicos de NextAuth
        let errorMessage = 'Error en el inicio de sesión';
        
        switch (result.error) {
          case 'CredentialsSignin':
            errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
            break;
          case 'OAuthAccountNotLinked':
            errorMessage = 'Tu email ya está vinculado con otro proveedor.';
            break;
          case 'registration_disabled':
            errorMessage = 'Registro deshabilitado. Contacta al administrador.';
            break;
          default:
            errorMessage = result.error;
        }
        
        setAlertMessage(errorMessage);
        setAlertType('error');
        setShowAlert(true);
      } else if (result?.ok) {
        setAlertMessage('Inicio de sesión exitoso. Redirigiendo...');
        setAlertType('success');
        setShowAlert(true);
        
        // Redirigir al dashboard o página principal después de un breve delay
        setTimeout(() => {
          window.location.href = '/forum';
        }, 1500);
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error inesperado en el inicio de sesión';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet o contacta al administrador.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAlertMessage(errorMessage);
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores específicos del campo al modificarlo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Limpiar alerta si existe
    if (showAlert) {
      setShowAlert(false);
    }
    
    // Limpiar errores de OAuth
    if (socialLoginError) {
      setSocialLoginError(null);
    }
  };

  const clearError = () => {
    setErrors({});
    setShowAlert(false);
    setSocialLoginError(null);
  };

  return (
    <AuthForm
      mode="login"
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      errors={errors}
      formData={formData}
      onFieldChange={handleChange}
      onClearErrors={clearError}
      socialLoginError={socialLoginError}
      onSocialError={setSocialLoginError}
      showAlert={showAlert}
      alertMessage={alertMessage}
      alertType={alertType}
    />
  );
}
