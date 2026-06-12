'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, LoadingButton } from '@/components/common';
import OAuthButtons from './OAuthButtons';
import PasswordInput from './PasswordInput';
import AudienceToggle, { Audience } from './AudienceToggle';
import LogoMark from '@/components/LogoMark';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ROLES = [
  { value: 'estudiante', label: 'Estudiante', emoji: '🎓' },
  { value: 'qa_junior', label: 'Tester QA Junior', emoji: '🌱' },
  { value: 'qa_senior', label: 'Tester QA Senior', emoji: '⭐' },
  { value: 'qa_engineer', label: 'QA Engineer', emoji: '⚙️' },
  { value: 'analista_qa', label: 'Analista QA', emoji: '🔍' },
  { value: 'developer', label: 'Developer', emoji: '💻' },
  { value: 'otro', label: 'Otro rol', emoji: '🙋' },
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
  onAudienceChange?: (a: Audience) => void;
  onClearErrors: () => void;
  socialLoginError: string | null;
  onSocialError: (error: string | null) => void;
  showAlert?: boolean;
  alertMessage?: string;
  alertType?: 'success' | 'error';
  showResend?: boolean;
  onResend?: () => void;
  isResending?: boolean;
  onEmailBlur?: () => void;
  emailChecking?: boolean;
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
  onAudienceChange,
  showAlert = false,
  alertMessage = '',
  alertType = 'error',
  showResend = false,
  onResend,
  isResending = false,
  onEmailBlur,
  emailChecking = false,
  passwordRef,
  confirmPasswordRef,
}: AuthFormProps) {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const message = searchParams?.get('message');
  const redirect = searchParams?.get('redirect');
  const redirectQuery = redirect
    ? `?redirect=${encodeURIComponent(redirect)}`
    : '';

  const isLogin = mode === 'login';
  const audience: Audience = (formData.audience as Audience) || 'candidato';
  const effectiveAudience: Audience = isLogin ? 'candidato' : audience;
  const isEmpresa = effectiveAudience === 'empresa';

  const title = isLogin ? t('auth.login.title') : t('auth.register.title');
  const subtitle = isLogin
    ? isEmpresa
      ? 'Accedé al panel de tu empresa'
      : 'Plataforma QA de Paraguay'
    : 'Plataforma QA de Paraguay';
  const submitText = isLogin
    ? isEmpresa
      ? 'Ingresar al portal'
      : t('auth.login.submit')
    : t('auth.register.submit');
  const loadingText = isLogin
    ? t('auth.login.loading')
    : t('auth.register.loading');
  const linkText = isLogin
    ? t('auth.login.linkText')
    : t('auth.register.linkText');
  const linkHref = isLogin
    ? isEmpresa
      ? '/empresa/registro'
      : `/register${redirectQuery}`
    : `/login${redirectQuery}`;

  const fieldClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-1 ${
      isDarkMode
        ? `bg-slate-700/70 text-white placeholder-slate-400 ${hasError ? 'border-red-500 focus:border-red-400' : 'border-slate-500/80 focus:border-indigo-300'}`
        : `bg-white text-gray-900 placeholder-gray-400 ${hasError ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-indigo-400'}`
    }`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 ${
        isDarkMode
          ? 'bg-slate-900'
          : 'bg-gradient-to-br from-indigo-50 via-white to-violet-50'
      }`}
    >
      {/* Decorative blobs — light mode only */}
      {!isDarkMode && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 translate-x-1/2 translate-y-1/2 pointer-events-none" />
        </>
      )}

      <div className="relative max-w-md w-full">
        {/* Brand header — circular LogoMark */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-md ${
              isDarkMode
                ? 'bg-slate-800 border border-slate-600'
                : 'bg-white border border-slate-200'
            }`}
          >
            <LogoMark
              size={42}
              color={isDarkMode ? '#fff' : '#0f172a'}
              wordmark={false}
            />
          </div>
          <h1
            className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            AIQUAA
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
          >
            {subtitle}
          </p>
        </div>

        {/* Card */}
        <div
          className={`rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm ${
            isDarkMode
              ? 'bg-slate-800/95 border border-slate-600/60'
              : 'bg-white/95 border border-gray-200'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {title}
          </h2>
          <p
            className={`text-sm mb-6 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
          >
            {isLogin
              ? isEmpresa
                ? '¿Registrás una empresa nueva?'
                : '¿No tenés cuenta?'
              : '¿Ya tenés cuenta?'}{' '}
            <Link
              href={linkHref}
              className="font-semibold text-indigo-500 hover:text-indigo-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-sm"
            >
              {isLogin && isEmpresa ? 'Registrá tu empresa' : linkText}
            </Link>
          </p>

          {/* Audience toggle */}
          {!isLogin && onAudienceChange && (
            <AudienceToggle value={audience} onChange={onAudienceChange} />
          )}

          {/* Alerts */}
          {showAlert && (
            <div className="mb-4">
              <Alert
                type={alertType}
                message={alertMessage}
                onClose={onClearErrors}
              />
            </div>
          )}
          {error === 'OAuthAccountNotLinked' && (
            <div className="mb-4">
              <Alert
                type="error"
                message={t('auth.error.oauth')}
                onClose={onClearErrors}
              />
            </div>
          )}
          {error === 'registration_disabled' && (
            <div className="mb-4">
              <Alert
                type="error"
                message={t('auth.error.registrationDisabled')}
                onClose={onClearErrors}
              />
            </div>
          )}
          {message === 'registration_success' && (
            <div className="mb-4">
              <Alert
                type="success"
                message={t('auth.success.registration')}
                onClose={onClearErrors}
              />
            </div>
          )}
          {socialLoginError && (
            <div className="mb-4">
              <Alert
                type="error"
                message={socialLoginError}
                onClose={() => onSocialError(null)}
              />
            </div>
          )}
          {/* OAuth providers */}
          {!isEmpresa && (
            <>
              <OAuthButtons />
              <div className="relative my-4">
                <div className={`absolute inset-0 flex items-center`}>
                  <div
                    className={`w-full border-t ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}
                  />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span
                    className={`px-3 ${isDarkMode ? 'bg-slate-800/95 text-slate-400' : 'bg-white/95 text-gray-400'}`}
                  >
                    o continuar con email
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                >
                  {isEmpresa ? 'Nombre de contacto' : t('auth.field.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={fieldClass(!!errors.name)}
                  placeholder={
                    isEmpresa ? 'Nombre y apellido' : 'Tu nombre completo'
                  }
                  value={formData.name || ''}
                  onChange={onFieldChange}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 leading-relaxed">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Empresa-only fields */}
            {isEmpresa && (
              <>
                <div>
                  <label
                    htmlFor="companyName"
                    className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                  >
                    Nombre de la empresa
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    className={fieldClass(!!errors.companyName)}
                    placeholder="Tu Empresa S.A."
                    value={formData.companyName || ''}
                    onChange={onFieldChange}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400 leading-relaxed">
                      {errors.companyName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="ruc"
                    className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                  >
                    RUC
                  </label>
                  <input
                    id="ruc"
                    name="ruc"
                    type="text"
                    className={fieldClass(!!errors.ruc)}
                    placeholder="80000001-1"
                    value={formData.ruc || ''}
                    onChange={onFieldChange}
                    maxLength={12}
                  />
                  {errors.ruc ? (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400 leading-relaxed">
                      {errors.ruc}
                    </p>
                  ) : (
                    <p
                      className={`mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                    >
                      Formato: 80000001-1
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
              >
                {isEmpresa ? 'Email corporativo' : t('auth.field.email')}
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  className={fieldClass(!!errors.email)}
                  placeholder={isEmpresa ? 'tu@empresa.com' : 'tu@email.com'}
                  value={formData.email || ''}
                  onChange={onFieldChange}
                  onBlur={onEmailBlur}
                />
                {emailChecking && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="animate-spin h-4 w-4 text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  </span>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400 leading-relaxed">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
              >
                {t('auth.field.password')}
              </label>
              <PasswordInput
                ref={passwordRef}
                id="password"
                name="password"
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                onChange={onPasswordChange ?? onFieldChange}
                className={fieldClass(!!errors.password)}
                showStrength={!isLogin}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400 leading-relaxed">
                  {errors.password}
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                >
                  {t('auth.field.confirmPassword')}
                </label>
                <PasswordInput
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  onChange={onPasswordChange ?? onFieldChange}
                  className={fieldClass(!!errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 leading-relaxed">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Role selector — candidato only */}
            {!isLogin && !isEmpresa && (
              <div>
                <p
                  className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                >
                  ¿Cuál es tu rol en QA?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((role) => {
                    const selected = formData.role === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => onRoleChange?.(role.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                          selected
                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                            : isDarkMode
                              ? 'border-slate-600 bg-slate-700/60 text-slate-300 hover:border-indigo-400'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        <span>{role.emoji}</span>
                        <span className="truncate">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 leading-relaxed">
                    {errors.role}
                  </p>
                )}
              </div>
            )}

            {/* Reenviar confirmación */}
            {showResend && onResend && (
              <button
                type="button"
                onClick={onResend}
                disabled={isResending}
                className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
                  isDarkMode
                    ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50'
                    : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {isResending ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t('auth.resend.loading')}
                  </>
                ) : (
                  t('auth.resend.button')
                )}
              </button>
            )}

            <div className="pt-1">
              <LoadingButton
                isLoading={isLoading}
                loadingText={loadingText}
                type="submit"
              >
                {submitText}
              </LoadingButton>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-xs pt-1">
                <Link
                  href="/auth/forgot-password"
                  className={`${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
                <Link
                  href={`/register${redirectQuery}`}
                  className="font-semibold text-indigo-500 hover:text-indigo-400 underline-offset-4 hover:underline"
                >
                  {t('auth.register.link')}
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
