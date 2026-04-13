'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, LoadingButton } from '@/components/common';
import OAuthDebug from './OAuthDebug';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordInput from './PasswordInput';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
  showResend?: boolean;
  onResend?: () => void;
  isResending?: boolean;
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
  showResend = false,
  onResend,
  isResending = false,
}: AuthFormProps) {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");

  const isLogin = mode === 'login';
  const title = isLogin ? t('auth.login.title') : t('auth.register.title');
  const submitText = isLogin ? t('auth.login.submit') : t('auth.register.submit');
  const loadingText = isLogin ? t('auth.login.loading') : t('auth.register.loading');
  const linkText = isLogin ? t('auth.login.linkText') : t('auth.register.linkText');
  const linkHref = isLogin ? '/register' : '/login';

  const inputClass = (hasError: boolean, extra = '') =>
    `appearance-none rounded-none relative block w-full px-3 py-2 border text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent focus:z-10 ${extra} ${
      isDarkMode
        ? `bg-slate-700 text-slate-100 placeholder-slate-400 ${hasError ? 'border-red-500' : 'border-slate-600'}`
        : `bg-white text-gray-900 placeholder-gray-500 ${hasError ? 'border-red-300' : 'border-gray-300'}`
    }`;

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <p className={`mt-2 text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            O{' '}
            <Link href={linkHref} className="font-medium text-brand-accent hover:text-brand-primary">
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

          {/* Reenviar confirmación */}
          {showResend && onResend && (
            <button
              type="button"
              onClick={onResend}
              disabled={isResending}
              className={`w-full flex justify-center items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDarkMode
                  ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50'
                  : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {isResending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {t('auth.resend.loading')}
                </>
              ) : (
                t('auth.resend.button')
              )}
            </button>
          )}

          {/* Alertas de errores de URL */}
          {error === "OAuthAccountNotLinked" && (
            <Alert
              type="error"
              message={t('auth.error.oauth')}
              onClose={onClearErrors}
            />
          )}
          {error === "registration_disabled" && (
            <Alert
              type="error"
              message={t('auth.error.registrationDisabled')}
              onClose={onClearErrors}
            />
          )}

          {/* Mensajes de éxito */}
          {message === "registration_success" && (
            <Alert
              type="success"
              message={t('auth.success.registration')}
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

          <div className={`rounded-md shadow-sm -space-y-px ${isDarkMode ? 'shadow-slate-700' : ''}`}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">{t('auth.field.name')}</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={inputClass(!!errors.name, 'rounded-t-md')}
                  placeholder={t('auth.field.name')}
                  value={formData.name || ''}
                  onChange={onFieldChange}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">{t('auth.field.email')}</label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                className={inputClass(!!errors.email, isLogin ? 'rounded-t-md' : '')}
                placeholder={t('auth.field.email')}
                value={formData.email || ''}
                onChange={onFieldChange}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">{t('auth.field.password')}</label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password || ''}
                placeholder={t('auth.field.password')}
                autoComplete={isLogin ? "current-password" : "new-password"}
                onChange={onFieldChange}
                className={inputClass(!!errors.password, isLogin ? 'rounded-b-md' : '')}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              {!isLogin && (
                <div className={`px-3 pb-2 border-l border-r ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
                  <PasswordStrengthIndicator password={formData.password || ''} />
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">{t('auth.field.confirmPassword')}</label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword || ''}
                  placeholder={t('auth.field.confirmPassword')}
                  autoComplete="new-password"
                  onChange={onFieldChange}
                  className={inputClass(!!errors.confirmPassword, 'rounded-b-md')}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
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
              <Link href="/register" className="font-medium text-brand-accent hover:text-brand-primary">
                {t('auth.register.link')}
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
