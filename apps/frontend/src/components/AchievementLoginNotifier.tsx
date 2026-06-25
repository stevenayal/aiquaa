'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';

type LoginAchievement = {
  id: string;
  rankingLabel: string;
  position: number;
  scoreLabel: string | null;
  achievedAt: string;
};

export default function AchievementLoginNotifier() {
  const { user, session } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const [achievements, setAchievements] = useState<LoginAchievement[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const checkKey = useMemo(() => {
    if (!user?.id || !session?.access_token) return null;
    return `aiquaa-ranking-achievements:${user.id}:${session.access_token.slice(-12)}`;
  }, [session?.access_token, user?.id]);

  useEffect(() => {
    if (!checkKey || !session?.access_token) return;
    if (sessionStorage.getItem(checkKey) === '1') return;

    sessionStorage.setItem(checkKey, '1');

    fetch('/api/achievements/login', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : { achievements: [] }))
      .then((payload) => {
        const next = Array.isArray(payload.achievements)
          ? payload.achievements
          : [];
        if (next.length > 0) {
          setAchievements(next);
          setDismissed(false);
        }
      })
      .catch(() => {
        /* Login notification should never block navigation. */
      });
  }, [checkKey, session?.access_token]);

  if (dismissed || achievements.length === 0) return null;

  const first = achievements[0];
  const extraCount = Math.max(0, achievements.length - 1);

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-[calc(100vw-2rem)] max-w-sm">
      <div
        className={`rounded-2xl border p-4 shadow-2xl ${
          isDarkMode
            ? 'bg-slate-900 border-amber-700/60 text-slate-100'
            : 'bg-white border-amber-200 text-gray-900'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
              isDarkMode
                ? 'bg-amber-900/50 text-amber-300'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            #
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Nuevo logro de ranking</p>
            <p
              className={`mt-1 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
            >
              Llegaste al puesto #{first.position} en {first.rankingLabel}
              {first.scoreLabel ? ` con ${first.scoreLabel}` : ''}.
            </p>
            {extraCount > 0 && (
              <p
                className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Tambien tenes {extraCount} logro{extraCount > 1 ? 's' : ''}{' '}
                nuevo{extraCount > 1 ? 's' : ''}.
              </p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <Link
                href="/perfil"
                onClick={() => setDismissed(true)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200"
              >
                Ver logros
              </Link>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className={`text-xs font-medium ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Cerrar
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={`shrink-0 rounded-full px-2 text-lg leading-none ${isDarkMode ? 'text-slate-500 hover:text-slate-200' : 'text-gray-400 hover:text-gray-700'}`}
            aria-label="Cerrar notificacion de logro"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
