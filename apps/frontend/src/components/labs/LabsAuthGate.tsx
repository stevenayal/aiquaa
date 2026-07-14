'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import type { User } from '@supabase/supabase-js';

interface Props {
  children: React.ReactNode;
}

const PROTECTED_LABS_ROUTES = [
  '/labs/test-app',
  '/labs/performance',
  '/labs/istqb',
  '/labs/git',
  '/labs/git-practico',
  '/labs/playwright-practico',
  '/labs/api-testing-fundamentals',
  '/labs/allpairs',
  '/labs/data-generator',
  '/labs/req-lint',
  '/labs/risk-matrix',
];

const PUBLIC_LABS_ROUTES = [
  '/labs/yaml-validator',
  '/labs/cron-validator',
  '/labs/jwt-decoder',
  '/labs/json-validator',
  '/labs/json-to-testplans',
  '/labs/checklist',
  '/labs/base64-converter',
];

export default function LabsAuthGate({ children }: Props) {
  const { isDarkMode } = useTheme();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isProtectedRoute = PROTECTED_LABS_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = PUBLIC_LABS_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (!user && isProtectedRoute) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
      >
        <div
          className={`w-full max-w-md rounded-2xl p-8 text-center shadow-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2
            className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Inicia sesión para continuar
          </h2>
          <p
            className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Esta herramienta requiere una cuenta gratuita para registrar tu
            progreso y uso.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
            >
              Iniciar sesión
            </Link>
            <Link
              href={`/register?redirect=${encodeURIComponent(pathname)}`}
              className={`w-full rounded-lg border px-4 py-3 text-center font-medium transition ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Crear cuenta gratuita
            </Link>
          </div>
          <p
            className={`text-xs mt-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}
          >
            Sin tarjeta de crédito · Siempre gratis
          </p>
        </div>
      </div>
    );
  }

  if (!user && isPublicRoute) {
    return (
      <div className="min-h-screen">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4`}>
          <div
            className={`rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 ${
              isDarkMode
                ? 'bg-slate-800 border border-slate-700'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  ¿Quieres guardar tu progreso?
                </p>
                <p
                  className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Regístrate gratis para no perder tus datos.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  isDarkMode
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
