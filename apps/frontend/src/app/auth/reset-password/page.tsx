'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';

export default function ResetPasswordPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Verify the user has a valid recovery session
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        router.replace('/auth/forgot-password');
      }
    });
  }, [router]);

  const validate = (): string => {
    if (!password) return 'La contraseña es obligatoria';
    if (password.length < 8) return 'Mínimo 8 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      return 'Debe contener mayúscula, minúscula y número';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 3000);
    }
  };

  const strengthColor = () => {
    if (!password) return '';
    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^a-zA-Z0-9]/.test(password),
    ].filter(Boolean).length;
    if (score <= 2) return 'bg-red-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const strengthWidth = () => {
    if (!password) return 'w-0';
    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^a-zA-Z0-9]/.test(password),
    ].filter(Boolean).length;
    return ['w-0', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-full'][score];
  };

  if (!sessionReady) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 text-3xl">
            🔑
          </div>
          <h1
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Crear nueva contraseña
          </h1>
          <p
            className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Elegí una contraseña segura para tu cuenta
          </p>
        </div>

        <div
          className={`rounded-xl p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
        >
          {success ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-5xl">✅</p>
              <h2
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                ¡Contraseña actualizada!
              </h2>
              <p
                className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Tu contraseña fue cambiada exitosamente. Te redirigimos al foro
                en unos segundos...
              </p>
              <div className="w-full h-1 rounded-full overflow-hidden bg-slate-700">
                <div
                  className="h-full bg-indigo-500 animate-[shrink_3s_linear_forwards]"
                  style={{
                    width: '100%',
                    animation: 'width 3s linear forwards',
                  }}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-50 text-red-700 border border-red-200'}`}
                >
                  ❌ {error}
                </div>
              )}

              {/* Nueva contraseña */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
                {/* Strength bar */}
                {password && (
                  <div
                    className={`mt-2 h-1.5 w-full rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthColor()} ${strengthWidth()}`}
                    />
                  </div>
                )}
                <p
                  className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  Usá mayúsculas, minúsculas y números
                </p>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Repetí tu nueva contraseña"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs mt-1 text-red-400">
                    Las contraseñas no coinciden
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs mt-1 text-emerald-400">
                    ✓ Las contraseñas coinciden
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : '💾 Guardar nueva contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
