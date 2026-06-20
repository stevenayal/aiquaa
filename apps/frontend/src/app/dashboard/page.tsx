'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getExamResultsAction, getMyXpProfileAction } from '@/actions/exams';
import { xpForLevel, PY_TIMEZONE } from '@/lib/xp';

interface ExamResult {
  id: string;
  exam_type: string;
  exam_mode: string;
  score: number;
  total_questions: number;
  passed: boolean;
  percentage: number;
  time_spent: number | null;
  created_at: string;
}

interface XpProfile {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
  achievementCount: number;
  position: number;
}

const LAB_INFO = {
  git: { emoji: '🌿', label: 'Examen GIT', href: '/labs/git' },
  istqb: { emoji: '📋', label: 'ISTQB CTFL v4.0', href: '/labs/istqb' },
  performance: {
    emoji: '⚡',
    label: 'Performance Testing',
    href: '/labs/performance',
  },
  'api-testing-fundamentals': {
    emoji: '🌐',
    label: 'API Testing — Fundamentos',
    href: '/assessments/api-testing-fundamentals',
  },
  'api-banking': {
    emoji: '🏦',
    label: 'API Banking — Challenge práctico',
    href: '/assessments/api-banking',
  },
  'database-fundamentals': {
    emoji: '🗄️',
    label: 'Bases de Datos — Fundamentos',
    href: '/assessments/database-fundamentals',
  },
  'database-practice': {
    emoji: '🧮',
    label: 'Bases de Datos — Práctica SQL',
    href: '/assessments/database-practice',
  },
} as const;

export default function DashboardPage() {
  const { isDarkMode } = useTheme();
  const { user } = useSupabaseAuth();
  const [xp, setXp] = useState<XpProfile | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    Promise.all([getMyXpProfileAction(), getExamResultsAction()])
      .then(([xpRes, examRes]) => {
        if (!active) return;
        if (xpRes.data) setXp(xpRes.data as XpProfile);
        if (examRes.data) setResults(examRes.data as ExamResult[]);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error cargando el dashboard:', err);
        setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'Estudiante';

  const passedTypes = new Set(
    results
      .filter((r) => r.passed && r.exam_mode === 'exam')
      .map((r) => r.exam_type)
  );
  const allTypes = [
    'git',
    'istqb',
    'performance',
    'api-testing-fundamentals',
    'api-banking',
    'database-fundamentals',
    'database-practice',
  ] as const;
  const recommended = allTypes.find((t) => !passedTypes.has(t)) ?? null;
  const allPassed = allTypes.every((t) => passedTypes.has(t));

  const last3 = results.slice(0, 3);

  const currentLevelXp = xp ? xpForLevel(xp.level) : 0;
  const nextLevelXp = xp ? xpForLevel(xp.level + 1) : 100;
  const xpRange = nextLevelXp - currentLevelXp;
  const xpPct =
    xp && xpRange > 0
      ? Math.min(100, Math.round(((xp.totalXp - currentLevelXp) / xpRange) * 100))
      : 0;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
        role="status"
        aria-busy="true"
        aria-label="Cargando tu dashboard"
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
      >
        <div
          className={`max-w-md w-full text-center rounded-2xl p-8 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
        >
          <div className="text-4xl mb-3" aria-hidden="true">
            ⚠️
          </div>
          <h1
            className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            No pudimos cargar tu dashboard
          </h1>
          <p
            className={`text-sm mb-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Hubo un problema al traer tus datos. Revisá tu conexión e intentá de
            nuevo.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-10 px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1
            className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Hola, {firstName} 👋
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Tu resumen de actividad en AIQUAA
          </p>
        </div>

        {/* XP Widget */}
        {xp ? (
          <div
            className={`rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  Tu progreso
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {xp.totalXp.toLocaleString()}
                  </span>
                  <span
                    className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    XP
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span
                      className={
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }
                    >
                      Nivel {xp.level}
                    </span>
                    <span
                      className={
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }
                    >
                      {xpPct}% → Nivel {xp.level + 1}
                    </span>
                  </div>
                  <div
                    className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-700"
                      style={{ width: `${xpPct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={`text-4xl font-extrabold mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                >
                  Nv.{xp.level}
                </div>
                <p
                  className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  Posición #{xp.position}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                {
                  label: 'Racha actual',
                  value: `${xp.currentStreak}d`,
                  emoji: '🔥',
                },
                {
                  label: 'Racha máx.',
                  value: `${xp.longestStreak}d`,
                  emoji: '⚡',
                },
                {
                  label: 'Logros',
                  value: String(xp.achievementCount),
                  emoji: '🏅',
                },
              ].map(({ label, value, emoji }) => (
                <div
                  key={label}
                  className={`rounded-xl p-3 text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                >
                  <p className="text-xl">{emoji}</p>
                  <p
                    className={`text-lg font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {value}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl p-6 border-2 border-dashed text-center ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-white'}`}
          >
            <p className="text-3xl mb-2">🚀</p>
            <p
              className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
            >
              Aún no tenés XP acumulado
            </p>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Completá tu primer simulador para empezar a ganar XP y aparecer en
              el ranking.
            </p>
          </div>
        )}

        {/* Recommended next lab */}
        {results.length === 0 || recommended ? (
          <div
            className={`rounded-2xl p-5 ${isDarkMode ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}
            >
              Próximo desafío recomendado
            </p>
            {recommended ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`font-bold text-base ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}
                  >
                    {LAB_INFO[recommended].emoji} {LAB_INFO[recommended].label}
                  </p>
                  <p
                    className={`text-sm mt-0.5 ${isDarkMode ? 'text-amber-400/80' : 'text-amber-700'}`}
                  >
                    Todavía no lo aprobaste en modo examen
                  </p>
                </div>
                <Link
                  href={LAB_INFO[recommended].href}
                  className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Ir al lab →
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`font-bold text-base ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}
                  >
                    🧪 Explorá los Labs
                  </p>
                  <p
                    className={`text-sm mt-0.5 ${isDarkMode ? 'text-amber-400/80' : 'text-amber-700'}`}
                  >
                    Rendí tu primer examen para empezar
                  </p>
                </div>
                <Link
                  href="/labs"
                  className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Ver Labs →
                </Link>
              </div>
            )}
          </div>
        ) : allPassed ? (
          <div
            className={`rounded-2xl p-5 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700/50' : 'bg-emerald-50 border border-emerald-200'}`}
          >
            <p
              className={`font-bold text-base ${isDarkMode ? 'text-emerald-200' : 'text-emerald-900'}`}
            >
              🎉 ¡Aprobaste todos los exámenes!
            </p>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-emerald-400/80' : 'text-emerald-700'}`}
            >
              Podés seguir mejorando tu posición en el ranking con más intentos.
            </p>
          </div>
        ) : null}

        {/* Last exams */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2
              className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}
            >
              Últimos exámenes
            </h2>
            <Link
              href="/ranking"
              className={`text-xs font-semibold transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              Ver ranking →
            </Link>
          </div>
          {last3.length === 0 ? (
            <div
              className={`rounded-2xl p-8 text-center border-2 border-dashed ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
            >
              <p className="text-3xl mb-2">📋</p>
              <p
                className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
              >
                Todavía no rendiste ningún examen
              </p>
              <p
                className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Explorá los Labs para empezar
              </p>
              <Link
                href="/labs"
                className="inline-block mt-4 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Ver Labs
              </Link>
            </div>
          ) : (
            <div
              className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            >
              {last3.map((result, i) => {
                const lab = LAB_INFO[result.exam_type as keyof typeof LAB_INFO];
                const date = new Date(result.created_at).toLocaleDateString(
                  'es-PY',
                  {
                    day: '2-digit',
                    month: 'short',
                    timeZone: PY_TIMEZONE,
                  }
                );
                return (
                  <div
                    key={result.id}
                    className={`flex items-center gap-4 px-5 py-4 ${i < last3.length - 1 ? (isDarkMode ? 'border-b border-slate-700' : 'border-b border-gray-100') : ''}`}
                  >
                    <span className="text-2xl shrink-0">
                      {lab?.emoji ?? '📝'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                      >
                        {lab?.label ?? result.exam_type}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                      >
                        {result.exam_mode === 'exam'
                          ? 'Modo Examen'
                          : 'Entrenamiento'}{' '}
                        · {date}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {result.score}/{result.total_questions}
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        {Number(result.percentage).toFixed(0)}%
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${result.passed ? (isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700') : isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}
                    >
                      {result.passed ? '✓' : '✗'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h2
            className={`text-base font-bold mb-3 ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}
          >
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                { href: '/labs', emoji: '🧪', label: 'Labs' },
                { href: '/ranking', emoji: '🏆', label: 'Ranking' },
                { href: '/perfil', emoji: '👤', label: 'Mi Perfil' },
                { href: '/forum', emoji: '💬', label: 'Foro' },
              ] as const
            ).map(({ href, emoji, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl font-semibold text-sm transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'}`}
              >
                <span className="text-2xl">{emoji}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
