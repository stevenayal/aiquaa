'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, LoadingButton } from '@/components/common';
import OAuthDebug from './OAuthDebug';
import PasswordInput from './PasswordInput';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ROLES = [
  { value: 'estudiante',  label: 'Estudiante',      emoji: '🎓' },
  { value: 'qa_junior',   label: 'Tester QA Junior', emoji: '🌱' },
  { value: 'qa_senior',   label: 'Tester QA Senior', emoji: '⭐' },
  { value: 'qa_engineer', label: 'QA Engineer',      emoji: '⚙️' },
  { value: 'analista_qa', label: 'Analista QA',      emoji: '🔍' },
  { value: 'developer',   label: 'Developer',        emoji: '💻' },
  { value: 'otro',        label: 'Otro rol',         emoji: '🙋' },
];

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: { [key: string]: string };
  formData: any;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange?: (role: string) => void;
  onPhoneChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearErrors: () => void;
  socialLoginError: string | null;
  onSocialError: (error: string | null) => void;
  showAlert?: boolean;
  alertMessage?: string;
  alertType?: 'success' | 'error';
  showResend?: boolean;
  onResend?: () => void;
  isResending?: boolean;
  passwordRef?: React.RefObject<HTMLInputElement>;
  confirmPasswordRef?: React.RefObject<HTMLInputElement>;
}

export default function AuthForm({
  mode,
  onSubmit,
  isLoading,
  errors,
  formData,
  onFieldChange,
  onPasswordChange,
  onClearErrors,
  socialLoginError,
  onSocialError,
  onRoleChange,
  onPhoneChange,
  showAlert = false,
  alertMessage = '',
  alertType = 'error',
  showResend = false,
  onResend,
  isResending = false,
  passwordRef,
  confirmPasswordRef,
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

            {!isLogin && (
              <div>
                <label htmlFor="phone" className="sr-only">Teléfono</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={inputClass(!!errors.phone, '')}
                  placeholder="Teléfono (opcional)"
                  value={formData.phone || ''}
                  onChange={onPhoneChange ?? onFieldChange}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
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
                ref={passwordRef}
                id="password"
                name="password"
                placeholder={t('auth.field.password')}
                autoComplete={isLogin ? "current-password" : "new-password"}
                onChange={onPasswordChange ?? onFieldChange}
                className={inputClass(!!errors.password, isLogin ? 'rounded-b-md' : '')}
                showStrength={!isLogin}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">{t('auth.field.confirmPassword')}</label>
                <PasswordInput
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder={t('auth.field.confirmPassword')}
                  autoComplete="new-password"
                  onChange={onPasswordChange ?? onFieldChange}
                  className={inputClass(!!errors.confirmPassword, 'rounded-b-md')}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            )}
          </div>

          {/* Role selector — solo en registro */}
          {!isLogin && (
            <div>
              <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                ¿Cuál es tu rol en QA?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(role => {
                  const selected = formData.role === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => onRoleChange?.(role.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        selected
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                          : isDarkMode
                            ? 'border-slate-600 bg-slate-700 text-slate-300 hover:border-indigo-400 hover:bg-slate-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      <span>{role.emoji}</span>
                      <span className="truncate">{role.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
            </div>
          )}

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
            <div className="flex items-center justify-between text-sm">
              <Link href="/auth/forgot-password" className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}>
                ¿Olvidaste tu contraseña?
              </Link>
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
