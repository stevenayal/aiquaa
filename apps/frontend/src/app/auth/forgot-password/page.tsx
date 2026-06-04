'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordPage() {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresá un email válido');
      return;
    }
    setIsLoading(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/confirm?next=/auth/reset-password`,
    });
    setIsLoading(false);
    if (sbError) {
      setError(sbError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full space-y-8">

        {/* Logo / Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 text-3xl">
            🔐
          </div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ¿Olvidaste tu contraseña?
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            No te preocupes. Te enviamos un link para crear una nueva.
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className={`rounded-xl p-6 text-center space-y-4 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <p className="text-4xl">📬</p>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ¡Correo enviado!
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Revisá tu bandeja de entrada en <strong className={isDarkMode ? 'text-slate-200' : 'text-gray-800'}>{email}</strong>. El link expira en 1 hora.
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              ¿No llegó? Revisá la carpeta de spam o{' '}
              <button
                onClick={() => setSent(false)}
                className="text-indigo-400 hover:underline"
              >
                intentá de nuevo
              </button>
            </p>
            <Link
              href="/login"
              className={`inline-block mt-2 text-sm font-medium text-indigo-400 hover:text-indigo-300`}
            >
              ← Volver al login
            </Link>
          </div>
        ) : (
          /* Form */
          <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className={`px-4 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  ❌ {error}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="tu@email.com"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : '📧 Enviar link de recuperación'}
              </button>

              <p className={`text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  ← Volver al login
                </Link>
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
