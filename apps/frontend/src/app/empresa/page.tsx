'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getMyMembershipAction } from '@/actions/empresa-admin';
import type { EmpresaMemberRole } from '@/actions/empresa-admin';

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
    title: 'Candidatos',
    description: 'Revisá los resultados de exámenes por proceso',
  },
  {
    href: '/perfil',
    emoji: '🏢',
    title: 'Perfil de empresa',
    description: 'Editá la info de tu empresa',
  },
];

const ADMIN_LINK = {
  href: '/empresa/admin/usuarios',
  emoji: '⚙️',
  title: 'Gestión de usuarios',
  description: 'Invitá y administrá los usuarios de tu empresa',
};

export default function EmpresaDashboardPage() {
  const { user } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const [myRole, setMyRole] = useState<EmpresaMemberRole | null>(null);

  useEffect(() => {
    if (!user) return;
    getMyMembershipAction().then(({ data }) => {
      if (data) setMyRole(data.role as EmpresaMemberRole);
    });
  }, [user]);

  const companyName =
    user?.user_metadata?.company_name ||
    user?.user_metadata?.full_name ||
    'tu empresa';

  const isAdmin = myRole === 'owner' || myRole === 'admin';
  const links = isAdmin ? [...BASE_LINKS, ADMIN_LINK] : BASE_LINKS;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏢</span>
            <h1
              className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {companyName}
            </h1>
          </div>
          <p
            className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Panel de empresa — AIQUAA
          </p>
        </div>

        {/* Welcome banner */}
        <div
          className={`rounded-xl border p-5 mb-10 flex items-start gap-4 ${
            isDarkMode
              ? 'bg-indigo-900/30 border-indigo-700/50 text-indigo-200'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}
        >
          <span className="text-2xl shrink-0">🎯</span>
          <div>
            <p className="font-semibold text-base mb-1">
              ¡Bienvenido a tu panel de empresa!
            </p>
            <p
              className={`text-sm ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}
            >
              Creá procesos de selección, compartí el código con tus candidatos
              y revisá sus resultados de exámenes técnicos en un solo lugar.
            </p>
          </div>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group rounded-xl border p-6 transition-all duration-200 ${
                isDarkMode
                  ? 'bg-dark-secondary border-dark-secondary hover:border-indigo-500'
                  : 'bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <p
                    className={`font-semibold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {item.title}
                  </p>
                  <p
                    className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer link to forum */}
        <div className="mt-10 text-center">
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
