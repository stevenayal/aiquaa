'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
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
  const [oauthLoading, setOauthLoading] = React.useState<'google' | 'github' | null>(null);

  const handleGoogleAuth = async () => {
    try {
      onSocialError(null);
      setOauthLoading('google');
      await signIn('google', { callbackUrl: '/forum' });
    } catch (_error) {
      console.error(`Error en ${mode} con Google:`, _error);
      onSocialError(`No se pudo ${mode === 'login' ? 'iniciar sesión' : 'registrarse'} con Google. Inténtalo más tarde o contacta al soporte.`);
      setOauthLoading(null);
    }
  };

  const handleGitHubAuth = async () => {
    try {
      onSocialError(null);
      setOauthLoading('github');
      await signIn('github', { callbackUrl: '/forum' });
    } catch (_error) {
      console.error(`Error en ${mode} con GitHub:`, _error);
      onSocialError(`No se pudo ${mode === 'login' ? 'iniciar sesión' : 'registrarse'} con GitHub. Inténtalo más tarde o contacta al soporte.`);
      setOauthLoading(null);
    }
  };

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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">O continuar con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading || oauthLoading !== null}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative"
                title={`${isLogin ? 'Iniciar sesión' : 'Registrarse'} con Google`}
              >
                <span className="sr-only">{isLogin ? 'Iniciar sesión' : 'Registrarse'} con Google</span>
                {oauthLoading === 'google' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-[#4285F4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-[#4285F4] font-medium">Redirigiendo...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-[#4285F4] group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2 text-[#4285F4] font-medium">Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGitHubAuth}
                disabled={isLoading || oauthLoading !== null}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-800 rounded-lg shadow-sm bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative"
                title={`${isLogin ? 'Iniciar sesión' : 'Registrarse'} con GitHub`}
              >
                <span className="sr-only">{isLogin ? 'Iniciar sesión' : 'Registrarse'} con GitHub</span>
                {oauthLoading === 'github' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-white font-medium">Redirigiendo...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"/>
                    </svg>
                    <span className="ml-2 text-white font-medium">GitHub</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
