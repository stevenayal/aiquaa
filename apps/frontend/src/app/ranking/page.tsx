'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getLeaderboardAction, getXpRankingAction } from '@/actions/exams';
import type { Reporter } from '@/app/api/github/reporters/route';

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  avatar_url: string | null;
  best_score: number;
  total_questions: number;
  max_possible_score: number | null;
  best_percentage: number;
  passed: boolean;
  attempts: number;
  achieved_at: string;
}

interface ReportersData {
  reporters: Reporter[];
  totalIssues: number;
  totalOpen: number;
  totalClosed: number;
}

interface XpRankingEntry {
  position: number;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  achievementCount: number;
  lastActivityAt: string | null;
  mainBadge: string | null;
}

interface XpRankingResponse {
  data: XpRankingEntry[];
  total: number;
  page: number;
  totalPages: number;
}

const EXAM_TABS = [
  {
    key: 'reportes',
    label: 'Bughunters',
    emoji: '🐛',
    color: 'from-rose-500 to-pink-600',
  },
  {
    key: 'git',
    label: 'Examen GIT',
    emoji: '🌿',
    color: 'from-amber-500 to-orange-600',
  },
  {
    key: 'istqb',
    label: 'ISTQB CTFL v4.0',
    emoji: '📋',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    key: 'performance',
    label: 'Performance',
    emoji: '⚡',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    key: 'xp',
    label: 'XP Comunidad',
    emoji: '🚀',
    color: 'from-purple-500 to-fuchsia-600',
  },
] as const;

type TabKey = (typeof EXAM_TABS)[number]['key'];

const MEDAL = ['🥇', '🥈', '🥉'];

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const COLORS = [
  'bg-violet-600',
  'bg-indigo-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
];
function getColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function MiniAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/20">
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/20 ${getColor(name)}`}
    >
      {getInitials(name)}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelative(iso: string | null) {
  if (!iso) return 'Sin actividad';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`;
  return new Date(iso).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
  });
}

// ── XP Level bar ──────────────────────────────────────────────────────────────

function xpForLevel(n: number) {
  return 50 * n * (n - 1);
}

function LevelBar({
  level,
  totalXp,
  isDarkMode,
}: {
  level: number;
  totalXp: number;
  isDarkMode: boolean;
}) {
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = Math.min(
    100,
    Math.round(((totalXp - current) / (next - current)) * 100)
  );
  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
      >
        {pct}%
      </span>
    </div>
  );
}

// ── XP Comunidad tab ──────────────────────────────────────────────────────────

function XpComunidadTab({ isDarkMode, currentUserName }: { isDarkMode: boolean; currentUserName: string | null }) {
  const [data, setData] = useState<XpRankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    setLoading(true);
    getXpRankingAction(page, 20)
      .then((res) => {
        if (res.error || !res.data) {
          setData(null);
          return;
        }
        setData({
          data: res.data as unknown as XpRankingEntry[],
          total: res.total,
          page: res.page,
          totalPages: res.totalPages,
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div
        className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}
      >
        <p className="text-5xl mb-3">🚀</p>
        <p
          className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
        >
          Nadie en el ranking aún
        </p>
        <p
          className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
        >
          ¡Completá un simulador o generá casos All Pairs para ganar XP y
          aparecer acá!
        </p>
      </div>
    );
  }

  const top3 = data.data.slice(0, 3);
  const rest = data.data.slice(3);
  const isFirstPage = page === 1;

  return (
    <div className="space-y-5">
      {/* Cómo ganar XP */}
      <div className={`rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <button
          onClick={() => setShowHowTo(v => !v)}
          className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}
        >
          <span>💡 ¿Cómo ganar XP?</span>
          <span>{showHowTo ? '▲' : '▼'}</span>
        </button>
        {showHowTo && (
          <div className={`px-5 pb-4 space-y-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            {[
              { emoji: '📋', action: 'Completar simulacro ISTQB (aprobar)', xp: '+100 XP' },
              { emoji: '⚡', action: 'Completar examen Performance (aprobar)', xp: '+80 XP' },
              { emoji: '🌿', action: 'Completar examen GIT (aprobar)', xp: '+60 XP' },
              { emoji: '🔗', action: 'Generar casos All Pairs (20+ pares)', xp: '+20 XP' },
              { emoji: '💬', action: 'Crear un post en el foro', xp: '+10 XP' },
              { emoji: '🌅', action: 'Check-in diario', xp: '+5 XP' },
            ].map(({ emoji, action, xp }) => (
              <div key={action} className="flex items-center justify-between text-sm pt-2">
                <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>{emoji} {action}</span>
                <span className="font-bold text-purple-500">{xp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Participantes',
            value: data.total,
            color: 'text-purple-500 dark:text-purple-400',
          },
          {
            label: 'Páginas',
            value: data.totalPages,
            color: 'text-fuchsia-500 dark:text-fuchsia-400',
          },
          {
            label: 'Esta página',
            value: data.data.length,
            color: 'text-indigo-500 dark:text-indigo-400',
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-2xl p-4 text-center ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          >
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p
              className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Podio top 3 — solo en página 1 */}
      {isFirstPage && top3.length > 0 && (
        <div
          className={`rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wider text-center mb-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
          >
            Top XP Global
          </p>
          <div className="flex items-end justify-center gap-4">
            {[top3[1], top3[0], top3[2]].map((entry, i) => {
              if (!entry) return <div key={i} className="w-24" />;
              const podiumRank = i === 1 ? 0 : i === 0 ? 1 : 2;
              const heights = ['h-32', 'h-24', 'h-20'];
              return (
                <div
                  key={entry.position}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="relative">
                    <MiniAvatar
                      name={entry.displayName}
                      avatarUrl={entry.avatarUrl}
                    />
                    {entry.mainBadge && (
                      <span className="absolute -top-1 -right-1 text-base leading-none">
                        {entry.mainBadge}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs font-semibold text-center break-words w-full max-w-[96px] line-clamp-2 leading-tight ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                  >
                    {entry.displayName}
                  </p>
                  <p className={`text-xs font-bold text-purple-500`}>
                    {entry.totalXp.toLocaleString()} XP
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    Nv. {entry.level}
                  </p>
                  <div
                    className={`w-full rounded-t-lg flex items-center justify-center text-2xl ${heights[podiumRank]} ${
                      podiumRank === 0
                        ? 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                        : podiumRank === 1
                          ? 'bg-gradient-to-t from-slate-500 to-slate-400'
                          : 'bg-gradient-to-t from-amber-800 to-amber-600'
                    }`}
                  >
                    {MEDAL[podiumRank]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de XP */}
      <div
        className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
      >
        {/* Encabezado de sección */}
        <div
          className={`px-5 py-3 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/80' : 'border-gray-100 bg-gray-50'}`}
        >
          <h2
            className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}
          >
            ⚡ Lista de XP
            <span
              className={`text-xs font-normal ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              — posiciones {(page - 1) * 20 + (isFirstPage ? 4 : 1)} a{' '}
              {(page - 1) * 20 + data.data.length}
            </span>
          </h2>
        </div>

        {/* Filas */}
        {(isFirstPage ? rest : data.data).map((entry, i, arr) => {
          const isCurrentUser = currentUserName !== null && entry.displayName === currentUserName;
          return (
          <div
            key={entry.position}
            className={`flex items-center gap-3 px-5 py-4 ${
              i < arr.length - 1
                ? isDarkMode
                  ? 'border-b border-slate-700'
                  : 'border-b border-gray-100'
                : ''
            } ${isCurrentUser ? 'border-l-4 border-purple-500' : ''} ${isDarkMode ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'} transition-colors`}
          >
            {/* Posición */}
            <span
              className={`w-8 text-center text-sm font-bold shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
            >
              {entry.position}
            </span>

            {/* Avatar + badge */}
            <div className="relative shrink-0">
              <MiniAvatar
                name={entry.displayName}
                avatarUrl={entry.avatarUrl}
              />
              {entry.mainBadge && (
                <span className="absolute -top-1 -right-1 text-sm leading-none">
                  {entry.mainBadge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <p
                className={`text-sm font-semibold truncate flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
              >
                {isCurrentUser && <span>🫵</span>}
                {entry.displayName}
                {isCurrentUser && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white shrink-0">Tú</span>
                )}
              </p>
              <LevelBar
                level={entry.level}
                totalXp={entry.totalXp}
                isDarkMode={isDarkMode}
              />
              <p
                className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                {formatRelative(entry.lastActivityAt)}
              </p>
            </div>

            {/* XP + stats */}
            <div className="text-right shrink-0 space-y-0.5">
              <p
                className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {entry.totalXp.toLocaleString()} XP
              </p>
              <p
                className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Nv. {entry.level}
              </p>
              {entry.achievementCount > 0 && (
                <p
                  className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  🏅 {entry.achievementCount}
                </p>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Paginación */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 ${
              isDarkMode
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:hover:bg-slate-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:hover:bg-gray-200'
            }`}
          >
            ← Anterior
          </button>
          <span
            className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 ${
              isDarkMode
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:hover:bg-slate-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:hover:bg-gray-200'
            }`}
          >
            Siguiente →
          </button>
        </div>
      )}

      <p
        className={`text-center text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}
      >
        Ranking de XP de la comunidad Aiquaa · Actualizado en tiempo real
      </p>
    </div>
  );
}

// ── Sección Reportadores ──────────────────────────────────────────────────────

function ReportadoresTab({ isDarkMode }: { isDarkMode: boolean }) {
  const [data, setData] = useState<ReportersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/github/reporters')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-rose-500" />
      </div>
    );
  }

  if (!data || !data.reporters?.length) {
    return (
      <div
        className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}
      >
        <p className="text-5xl mb-3">📭</p>
        <p
          className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
        >
          Sin issues reportados aún
        </p>
      </div>
    );
  }

  const { reporters, totalIssues, totalOpen, totalClosed } = data;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Total issues',
            value: totalIssues,
            color: 'text-indigo-600 dark:text-indigo-400',
          },
          {
            label: 'Abiertos',
            value: totalOpen,
            color: 'text-amber-600 dark:text-amber-400',
          },
          {
            label: 'Cerrados',
            value: totalClosed,
            color: 'text-emerald-600 dark:text-emerald-400',
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-2xl p-4 text-center ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          >
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p
              className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {reporters.map((r, idx) => (
        <div
          key={r.login}
          className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
        >
          {/* Fila principal */}
          <div className="flex items-center gap-4 px-5 py-4">
            <span
              className={`w-7 text-center text-lg font-bold shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              {idx < 3 ? MEDAL[idx] : idx + 1}
            </span>

            <MiniAvatar name={r.login} avatarUrl={r.avatar_url} />

            <div className="flex-1 min-w-0">
              <a
                href={r.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-semibold hover:underline ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}
              >
                @{r.login}
              </a>
              <p
                className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Último: {formatDate(r.latest)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}
              >
                {r.total} {r.total === 1 ? 'issue' : 'issues'}
              </span>
              {r.open > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'}`}
                >
                  {r.open} abierto{r.open !== 1 ? 's' : ''}
                </span>
              )}
              {r.closed > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}
                >
                  {r.closed} resuelto{r.closed !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Issues recientes */}
          <div
            className={`border-t px-5 py-3 space-y-1.5 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}
          >
            {r.issues
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .slice(0, 3)
              .map((issue) => (
                <a
                  key={issue.number}
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${issue.state === 'open' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                  <span
                    className={`text-xs shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    #{issue.number}
                  </span>
                  <span
                    className={`text-xs truncate group-hover:text-indigo-500 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    {issue.title}
                  </span>
                  <span
                    className={`text-xs shrink-0 ml-auto ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}
                  >
                    {formatDate(issue.created_at)}
                  </span>
                </a>
              ))}
            {r.issues.length > 3 && (
              <a
                href={`https://github.com/stevenayal/aiquaa/issues?q=author%3A${r.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:underline"
              >
                + {r.issues.length - 3} más →
              </a>
            )}
          </div>
        </div>
      ))}

      <p
        className={`text-center text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}
      >
        Datos del repositorio stevenayal/aiquaa · Actualizado cada hora
      </p>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function RankingPage() {
  const { isDarkMode } = useTheme();
  const { user } = useSupabaseAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('reportes');
  const [examData, setExamData] = useState<Record<string, LeaderboardEntry[]>>({
    git: [],
    istqb: [],
    performance: [],
  });
  const [examLoading, setExamLoading] = useState<Record<string, boolean>>({
    git: true,
    istqb: true,
    performance: true,
  });
  const [showWelcome, setShowWelcome] = useState(false);

  const isWelcome = searchParams.get('welcome') === '1';

  useEffect(() => {
    if (isWelcome) {
      setShowWelcome(true);
      router.replace('/ranking', { scroll: false });
      const t = setTimeout(() => setShowWelcome(false), 6000);
      return () => clearTimeout(t);
    }
  }, [isWelcome, router]);

  useEffect(() => {
    (['git', 'istqb', 'performance'] as const).forEach((key) => {
      getLeaderboardAction(key, 20).then((res) => {
        setExamData((prev) => ({
          ...prev,
          [key]: (res.data as LeaderboardEntry[]) || [],
        }));
        setExamLoading((prev) => ({ ...prev, [key]: false }));
      });
    });
  }, []);

  const tab = EXAM_TABS.find((t) => t.key === activeTab)!;
  const isReportes = activeTab === 'reportes';
  const isXp = activeTab === 'xp';
  const entries = isReportes || isXp ? [] : (examData[activeTab] ?? []);
  const isLoading =
    isReportes || isXp ? false : (examLoading[activeTab] ?? false);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'por acá';

  function getSubtitle() {
    if (isReportes)
      return 'Personas que contribuyeron reportando bugs y mejoras';
    if (isXp)
      return 'Ranking de XP de la comunidad — ganás XP completando simuladores y generando casos de prueba';
    return 'Top 20 mejores puntajes en modo examen. ¿Estás en el ranking?';
  }

  return (
    <div
      className={`min-h-screen py-10 px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Welcome banner */}
        {showWelcome && (
          <div
            className={`rounded-2xl border px-5 py-4 flex items-start gap-4 transition-all duration-500 ${
              isDarkMode
                ? 'bg-indigo-900/40 border-indigo-700/60 text-indigo-100'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <span className="text-3xl shrink-0">👋</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base">¡Bienvenido/a, {firstName}!</p>
              <p
                className={`text-sm mt-0.5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}
              >
                Ya sos parte de AIQUAA. Acá podés ver el ranking de los mejores
                puntajes. ¿Te animás a aparecer?
              </p>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className={`shrink-0 text-lg leading-none transition-opacity hover:opacity-60 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-400'}`}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">{isXp ? '🚀' : '🏆'}</div>
          <h1
            className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Ranking AIQUAA
          </h1>
          <p
            className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            {getSubtitle()}
          </p>
        </div>

        {/* Tabs */}
        <div
          className={`flex rounded-xl p-1 gap-1 flex-wrap ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}
        >
          {EXAM_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all min-w-[100px] ${
                activeTab === t.key
                  ? `bg-gradient-to-r ${t.color} text-white shadow-md`
                  : isDarkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {isReportes ? (
          <ReportadoresTab isDarkMode={isDarkMode} />
        ) : isXp ? (
          <XpComunidadTab isDarkMode={isDarkMode} currentUserName={user?.user_metadata?.full_name || user?.user_metadata?.display_name || null} />
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
          </div>
        ) : entries.length === 0 ? (
          <div
            className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}
          >
            <p className="text-5xl mb-3">📭</p>
            <p
              className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
            >
              Aún no hay resultados
            </p>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              ¡Sé el primero en completar el examen y aparecer acá!
            </p>
            <a
              href={
                activeTab === 'git'
                  ? '/labs/git'
                  : activeTab === 'istqb'
                    ? '/labs/istqb'
                    : '/labs/performance'
              }
              className="inline-block mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {tab.emoji} Ir al examen
            </a>
          </div>
        ) : (
          <>
            {/* Podio top 3 */}
            {top3.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                <div className="flex items-end justify-center gap-4">
                  {[top3[1], top3[0], top3[2]].map((entry, i) => {
                    if (!entry) return <div key={i} className="w-24" />;
                    const podiumRank = i === 1 ? 0 : i === 0 ? 1 : 2;
                    const heights = ['h-32', 'h-24', 'h-20'];
                    return (
                      <div
                        key={entry.rank}
                        className="flex flex-col items-center gap-2 flex-1"
                      >
                        <MiniAvatar
                          name={entry.display_name}
                          avatarUrl={entry.avatar_url}
                        />
                        <p
                          className={`text-xs font-semibold text-center break-words w-full max-w-[96px] line-clamp-2 leading-tight ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                        >
                          {entry.display_name}
                        </p>
                        <p
                          className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {entry.best_score}/{entry.max_possible_score ?? entry.total_questions}
                        </p>
                        <div
                          className={`w-full rounded-t-lg flex items-center justify-center text-2xl ${heights[podiumRank]} ${
                            podiumRank === 0
                              ? 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                              : podiumRank === 1
                                ? 'bg-gradient-to-t from-slate-500 to-slate-400'
                                : 'bg-gradient-to-t from-amber-800 to-amber-600'
                          }`}
                        >
                          {MEDAL[podiumRank]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tabla del resto */}
            {rest.length > 0 && (
              <div
                className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                {rest.map((entry, i) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 px-5 py-3.5 ${
                      i < rest.length - 1
                        ? isDarkMode
                          ? 'border-b border-slate-700'
                          : 'border-b border-gray-100'
                        : ''
                    } ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <span
                      className={`w-6 text-center text-sm font-bold shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
                    >
                      {entry.rank}
                    </span>
                    <MiniAvatar
                      name={entry.display_name}
                      avatarUrl={entry.avatar_url}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                      >
                        {entry.display_name}
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                      >
                        {entry.attempts} intento
                        {entry.attempts !== 1 ? 's' : ''}
                        {' · '}
                        {new Date(entry.achieved_at).toLocaleDateString(
                          'es-PY',
                          { day: '2-digit', month: 'short' }
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {entry.best_score}/{entry.max_possible_score ?? entry.total_questions}
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        {Number(entry.best_percentage).toFixed(0)}%
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        entry.passed
                          ? isDarkMode
                            ? 'bg-emerald-900/40 text-emerald-300'
                            : 'bg-emerald-100 text-emerald-700'
                          : isDarkMode
                            ? 'bg-red-900/40 text-red-300'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {entry.passed ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 ${isDarkMode ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}>
              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                  ¿Querés mejorar tu posición?
                </p>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>
                  Practicá con Modo Entrenamiento antes de rendir el examen oficial.
                </p>
              </div>
              <a
                href={
                  activeTab === 'git'
                    ? '/labs/git'
                    : activeTab === 'istqb'
                      ? '/labs/istqb'
                      : '/labs/performance'
                }
                className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Practicar →
              </a>
            </div>
            <p
              className={`text-center text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}
            >
              Solo se cuentan resultados de modo examen · Actualizado en tiempo
              real
            </p>
          </>
        )}
      </div>
    </div>
  );
}
