'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, LoadingButton } from '@/components/common';
import OAuthDebug from './OAuthDebug';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordInput from './PasswordInput';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: { [key: string]: string };
  formData: any;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearErrors: () => void;
  socialLoginError: string | null;
  onSocialError: (error: string | null) => void;
  showAlert?: boolean;
  alertMessage?: string;
  alertType?: 'success' | 'error';
}

export default function AuthForm({
  mode,
  onSubmit,
  isLoading,
  errors,
  formData,
  onFieldChange,
  onClearErrors,
  socialLoginError,
  onSocialError,
  showAlert = false,
  alertMessage = '',
  alertType = 'error',
}: AuthFormProps) {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");

  const isLogin = mode === 'login';
  const title = isLogin ? 'Iniciar sesión en tu cuenta' : 'Crear tu cuenta';
  const submitText = isLogin ? 'Iniciar sesión' : 'Crear cuenta';
  const loadingText = isLogin ? 'Iniciando sesión...' : 'Creando cuenta...';
  const linkText = isLogin ? 'crea una nueva cuenta' : 'inicia sesión si ya tienes una cuenta';
  const linkHref = isLogin ? '/register' : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{' '}
            <Link href={linkHref} className="font-medium text-indigo-600 hover:text-indigo-500">
              {linkText}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {/* Alertas generales */}
          {showAlert && (
            <Alert
              type={alertType}
              message={alertMessage}
              onClose={onClearErrors}
            />
          )}

          {/* Alertas de errores de URL */}
          {error === "OAuthAccountNotLinked" && (
            <Alert
              type="error"
              message="Tu email ya está vinculado con otro proveedor."
              onClose={onClearErrors}
            />
          )}
          {error === "registration_disabled" && (
            <Alert
              type="error"
              message="Registro deshabilitado. Contacta al administrador."
              onClose={onClearErrors}
            />
          )}

          {/* Mensajes de éxito */}
          {message === "registration_success" && (
            <Alert
              type="success"
              message="Registro exitoso. Ahora puedes iniciar sesión con tus credenciales."
              onClose={onClearErrors}
            />
          )}
          
          {/* Error de OAuth */}
          {socialLoginError && (
            <Alert
              type="error"
              message={socialLoginError}
              onClose={() => onSocialError(null)}
            />
          )}
          
          {/* Debug OAuth en desarrollo */}
          {process.env.NODE_ENV === 'development' && <OAuthDebug />}
          
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="sr-only">
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                      errors.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Nombre completo"
                    value={formData.name || ''}
                    onChange={onFieldChange}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete={isLogin ? "email" : "email"}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 ${!isLogin ? '' : 'rounded-t-md'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Email"
                value={formData.email || ''}
                onChange={onFieldChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password || ''}
                placeholder="Contraseña"
                autoComplete={isLogin ? "current-password" : "new-password"}
                onChange={onFieldChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-b-md' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {!isLogin && (
                <div className="px-3 pb-2 bg-gray-50 border-l border-r border-gray-300">
                  <PasswordStrengthIndicator password={formData.password || ''} />
                </div>
              )}
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirmar contraseña
                </label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword || ''}
                  placeholder="Confirmar contraseña"
                  autoComplete="new-password"
                  onChange={onFieldChange}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <LoadingButton
              isLoading={isLoading}
              loadingText={loadingText}
              type="submit"
            >
              {submitText}
            </LoadingButton>
          </div>

          {isLogin && (
            <div className="text-sm text-right">
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
