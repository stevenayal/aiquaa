'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getMyMembershipAction, getMyEmpresaAction } from '@/actions/empresa-admin';
import type { EmpresaMemberRole, Empresa } from '@/actions/empresa-admin';
import {
  getEmpresaDashboardStatsAction,
  type EmpresaDashboardStats,
} from '@/actions/employer';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const BASE_LINKS = [
  {
    href: '/empresa/procesos/nuevo',
    emoji: '📋',
    title: 'Nuevo proceso de selección',
    description: 'Creá un proceso y obtené un código para candidatos',
  },
  {
    href: '/empresa/procesos',
    emoji: '📂',
    title: 'Mis procesos',
    description: 'Gestioná tus procesos activos y cerrados',
  },
  {
    href: '/empresa/candidatos',
    emoji: '👥',
    title: 'Candidatos evaluados',
    description: 'Revisá los resultados de exámenes por proceso',
  },
  {
    href: '/empresa/invitaciones',
    emoji: '📧',
    title: 'Invitar candidatos',
    description: 'Invitá candidatos QA directamente a rendir',
  },
  {
    href: '/empresa/eventos',
    emoji: '🗂️',
    title: 'Eventos y categorías',
    description: 'Agrupá tus procesos por bootcamp, evento o campaña',
  },
  {
    href: '/empresa/perfil',
    emoji: '🏢',
    title: 'Perfil de empresa',
    description: 'Completá tu perfil para atraer talento QA',
  },
];

const ADMIN_LINK = {
  href: '/empresa/admin/usuarios',
  emoji: '⚙️',
  title: 'Gestión de usuarios',
  description: 'Invitá y administrá los usuarios de tu empresa',
};

function StatCard({
  label,
  value,
  color,
  isDarkMode,
  badge,
  href,
}: {
  label: string;
  value: string | number;
  color: string;
  isDarkMode: boolean;
  badge?: string;
  href?: string;
}) {
  const inner = (
    <div
      className={`rounded-xl border p-4 relative ${isDarkMode ? 'bg-dark-secondary border-dark-secondary' : 'bg-white border-gray-200'} ${href ? 'hover:border-indigo-400 transition-colors cursor-pointer' : ''}`}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-xs font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
          {badge}
        </span>
      )}
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p
        className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
      >
        {label}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SkeletonCard({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 animate-pulse ${isDarkMode ? 'bg-dark-secondary border-dark-secondary' : 'bg-white border-gray-200'}`}
    >
      <div
        className={`h-7 w-12 rounded mb-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
      />
      <div
        className={`h-3 w-20 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
      />
    </div>
  );
}

export default function EmpresaDashboardPage() {
  const { user } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const [myRole, setMyRole] = useState<EmpresaMemberRole | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [stats, setStats] = useState<EmpresaDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBannerDismissed(
        localStorage.getItem('empresa_banner_dismissed') === '1'
      );
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    getMyMembershipAction().then(({ data }) => {
      if (data) setMyRole(data.role as EmpresaMemberRole);
    });
    getMyEmpresaAction().then(({ data }) => {
      if (data) setEmpresa(data);
    });
    getEmpresaDashboardStatsAction().then(({ data }) => {
      if (data) setStats(data);
      setStatsLoading(false);
    });
  }, [user]);

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('empresa_banner_dismissed', '1');
  };

  const companyName =
    empresa?.nombre_comercial || empresa?.razon_social || 'tu empresa';

  const isAdmin = myRole === 'owner' || myRole === 'admin';
  const links = isAdmin ? [...BASE_LINKS, ADMIN_LINK] : BASE_LINKS;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🏢</span>
            <h1
              className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {companyName}
            </h1>
          </div>
          <p
            className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Panel de empresa — AIQUAA
          </p>
        </div>

        {/* Stats grid — always visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} isDarkMode={isDarkMode} />
            ))
          ) : (
            <>
              <StatCard
                label="Procesos activos"
                value={stats?.activeProcesses ?? 0}
                color="text-green-500"
                isDarkMode={isDarkMode}
                href="/empresa/procesos"
              />
              <StatCard
                label="Candidatos evaluados"
                value={stats?.totalCandidates ?? 0}
                color="text-indigo-500"
                isDarkMode={isDarkMode}
                href="/empresa/candidatos"
              />
              <StatCard
                label="Tasa de aprobación"
                value={stats?.totalCandidates ? `${stats.passRate}%` : '—'}
                color="text-emerald-500"
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="Tiempo promedio"
                value={
                  stats?.avgTimeSpentMinutes != null
                    ? `${stats.avgTimeSpentMinutes}m`
                    : '—'
                }
                color="text-amber-500"
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="Total procesos"
                value={stats?.totalProcesses ?? 0}
                color="text-slate-500"
                isDarkMode={isDarkMode}
                href="/empresa/procesos"
              />
              <StatCard
                label="Procesos cerrados"
                value={stats?.closedProcesses ?? 0}
                color="text-slate-400"
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="Prospectos pendientes"
                value={stats?.pendingProspects ?? 0}
                color={
                  stats?.pendingProspects ? 'text-orange-500' : 'text-slate-400'
                }
                isDarkMode={isDarkMode}
                badge={
                  stats?.pendingProspects
                    ? String(stats.pendingProspects)
                    : undefined
                }
                href="/empresa/procesos"
              />
              <StatCard
                label="Invitaciones activas"
                value={stats?.pendingInvitaciones ?? 0}
                color={
                  stats?.pendingInvitaciones
                    ? 'text-blue-500'
                    : 'text-slate-400'
                }
                isDarkMode={isDarkMode}
                badge={
                  stats?.pendingInvitaciones
                    ? String(stats.pendingInvitaciones)
                    : undefined
                }
                href="/empresa/invitaciones"
              />
            </>
          )}
        </div>

        {/* Empty state CTA when no activity */}
        {!statsLoading && stats?.totalProcesses === 0 && (
          <div
            className={`rounded-xl border-2 border-dashed p-8 text-center mb-8 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
          >
            <p className="text-3xl mb-3">🚀</p>
            <p
              className={`font-semibold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              ¡Empezá a reclutar talento QA!
            </p>
            <p
              className={`text-sm mb-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Creá tu primer proceso de selección y compartí el código con los
              candidatos
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/empresa/procesos/nuevo"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Crear primer proceso
              </Link>
              <Link
                href="/empresa/perfil"
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Completar perfil
              </Link>
            </div>
          </div>
        )}

        {/* Welcome banner — collapsible after first visit */}
        {!bannerDismissed && (
          <div
            className={`rounded-xl border p-5 mb-8 flex items-start gap-4 ${
              isDarkMode
                ? 'bg-indigo-900/30 border-indigo-700/50 text-indigo-200'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            <span className="text-2xl shrink-0">🎯</span>
            <div className="flex-1">
              <p className="font-semibold text-base mb-1">
                ¡Bienvenido a tu panel de empresa!
              </p>
              <p
                className={`text-sm ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}
              >
                Creá procesos de selección, compartí el código con tus
                candidatos y revisá sus resultados de exámenes técnicos en un
                solo lugar.
              </p>
            </div>
            <button
              onClick={dismissBanner}
              className={`shrink-0 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick links grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group rounded-xl border p-5 transition-all duration-200 ${
                isDarkMode
                  ? 'bg-dark-secondary border-dark-secondary hover:border-indigo-500'
                  : 'bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p
                    className={`font-semibold text-sm mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {item.title}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts — only when there's data */}
        {stats && (stats.totalProcesses > 0 || stats.totalCandidates > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div
              className={`rounded-xl border p-4 ${isDarkMode ? 'bg-dark-secondary border-dark-secondary' : 'bg-white border-gray-200'}`}
            >
              <h3
                className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Procesos creados (6 meses)
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyProcesses}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v, 'Procesos']} />
                    <Bar
                      dataKey="value"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      name="Procesos"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 ${isDarkMode ? 'bg-dark-secondary border-dark-secondary' : 'bg-white border-gray-200'}`}
            >
              <h3
                className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Candidatos evaluados (6 meses)
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyCandidates}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v, 'Candidatos']} />
                    <Bar
                      dataKey="value"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      name="Candidatos"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p
            className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
          >
            ¿Querés explorar la comunidad?{' '}
            <Link
              href="/forum"
              className={`underline transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
            >
              Ir al foro
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
