'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useNextAuth } from '../../contexts/NextAuthContext';
import AuthForm from './AuthForm';

export default function RegisterForm() {
  const { register } = useNextAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'Nombre obligatorio';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = 'El nombre debe tener entre 2 y 50 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Correo obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }

    // Validar contraseña
    if (!formData.password.trim()) {
      newErrors.password = 'Contraseña obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmar contraseña obligatorio';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      const result = await register({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      
      if (result.success) {
        setAlertMessage('Registro exitoso. Iniciando sesión...');
        setAlertType('success');
        setShowAlert(true);
        
        // Intentar login automático después del registro exitoso
        try {
          const loginResult = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });
          
          if (loginResult?.ok) {
            setAlertMessage('Registro y login exitosos. Redirigiendo...');
            setTimeout(() => {
              window.location.href = '/forum';
            }, 1500);
          } else {
            setAlertMessage('Registro exitoso. Por favor, inicia sesión manualmente.');
            setTimeout(() => {
              window.location.href = '/login?message=registration_success';
            }, 2000);
          }
        } catch (loginError) {
          console.error('Error en login automático:', loginError);
          setAlertMessage('Registro exitoso. Por favor, inicia sesión manualmente.');
          setTimeout(() => {
            window.location.href = '/login?message=registration_success';
          }, 2000);
        }
      } else {
        // Mostrar el mensaje de error específico del backend
        let errorMessage = result.message || 'Error en el registro';
        
        // Mapear errores específicos del backend a mensajes más claros
        if (errorMessage.includes('email') && errorMessage.includes('already')) {
          errorMessage = 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.';
        } else if (errorMessage.includes('username') && errorMessage.includes('already')) {
          errorMessage = 'Este nombre de usuario ya está en uso. Elige otro.';
        } else if (errorMessage.includes('password') && errorMessage.includes('weak')) {
          errorMessage = 'La contraseña es muy débil. Debe tener al menos 8 caracteres con mayúscula, minúscula y número.';
        } else if (errorMessage.includes('validation')) {
          errorMessage = 'Los datos proporcionados no son válidos. Verifica la información.';
        }
        
        setAlertMessage(errorMessage);
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error inesperado en el registro';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet o contacta al administrador.';
      } else if (error instanceof Error) {
        // Mapear errores específicos de red
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión o contacta al administrador.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Error de red. Verifica tu conexión a internet.';
        } else {
          errorMessage = error.message;
        }
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
      mode="register"
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
