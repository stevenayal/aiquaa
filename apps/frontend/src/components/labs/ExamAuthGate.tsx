'use client';

import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ExamAuthGateProps {
  children: React.ReactNode;
  examName: string;
  examEmoji?: string;
}

export default function ExamAuthGate({ children, examName, examEmoji = '📝' }: ExamAuthGateProps) {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { isDarkMode } = useTheme();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center py-12 px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full rounded-2xl p-8 text-center space-y-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'}`}>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-4xl mx-auto">
            🔒
          </div>

          <div>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Acceso restringido
            </h2>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Para tomar el <strong className={isDarkMode ? 'text-slate-200' : 'text-gray-800'}>{examEmoji} {examName}</strong> y guardar tus resultados en tu perfil, necesitás una cuenta en AIQUAA.
            </p>
          </div>

          <div className={`rounded-xl p-4 text-left space-y-2 ${isDarkMode ? 'bg-slate-700/50' : 'bg-indigo-50'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-indigo-600'}`}>
              Con tu cuenta podés:
            </p>
            <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              <li>📊 Ver tu historial de exámenes</li>
              <li>📈 Trackear tu progreso a lo largo del tiempo</li>
              <li>🏆 Guardar tus mejores resultados</li>
              <li>💬 Participar en el foro de la comunidad</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              🎉 Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className={`w-full py-3 px-4 text-sm font-semibold rounded-xl border transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Ya tengo cuenta → Iniciar sesión
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
