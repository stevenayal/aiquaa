'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import {
  getMyProcessGroupsAction,
  type ProcessGroup,
} from '@/actions/employer';

type HiringProcess = {
  id: string;
  code: string;
  position_name: string;
  description: string | null;
  status: 'draft' | 'active' | 'closed';
  exam_types: string[];
  expires_at: string | null;
  created_at: string;
  group_id: string | null;
};

const statusLabel: Record<string, { text: string; className: string }> = {
  draft: { text: 'Borrador', className: 'bg-gray-100 text-gray-600' },
  active: { text: 'Activo', className: 'bg-green-100 text-green-700' },
  closed: { text: 'Cerrado', className: 'bg-red-100 text-red-600' },
  expired: { text: 'Vencido', className: 'bg-amber-100 text-amber-700' },
};

function getEffectiveStatus(p: HiringProcess): string {
  if (
    p.status === 'active' &&
    p.expires_at &&
    new Date(p.expires_at) < new Date()
  ) {
    return 'expired';
  }
  return p.status;
}

function ProcessCard({
  p,
  isDarkMode,
}: {
  p: HiringProcess;
  isDarkMode: boolean;
}) {
  const effectiveStatus = getEffectiveStatus(p);
  const s = statusLabel[effectiveStatus] ?? statusLabel.draft;
  const isExpired = effectiveStatus === 'expired';
  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        isDarkMode
          ? 'bg-dark-secondary border-slate-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2
              className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {p.position_name}
            </h2>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isDarkMode
                  ? isExpired
                    ? 'bg-amber-900/40 text-amber-300'
                    : p.status === 'active'
                      ? 'bg-green-900/40 text-green-300'
                      : p.status === 'closed'
                        ? 'bg-red-900/40 text-red-300'
                        : 'bg-slate-700 text-slate-400'
                  : s.className
              }`}
            >
              {s.text}
            </span>
          </div>
          {p.description && (
            <p
              className={`text-sm mb-2 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              {p.description}
            </p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <span
              className={`text-xs font-mono px-2 py-1 rounded ${
                isDarkMode
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Código: {p.code}
            </span>
            <span
              className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              {p.exam_types.join(', ')}
            </span>
            {p.expires_at && (
              <span
                className={`text-xs ${
                  isExpired
                    ? isDarkMode
                      ? 'text-amber-400'
                      : 'text-amber-600'
                    : isDarkMode
                      ? 'text-slate-500'
                      : 'text-gray-400'
                }`}
              >
                {isExpired ? 'Venció:' : 'Vence:'}{' '}
                {new Date(p.expires_at).toLocaleDateString('es-PY')}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/empresa/procesos/${p.id}`}
          className={`shrink-0 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            isDarkMode
              ? 'text-indigo-300 hover:bg-slate-700'
              : 'text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          Ver →
        </Link>
      </div>
    </div>
  );
}

export default function ProcesosPage() {
  const { isDarkMode } = useTheme();
  const [processes, setProcesses] = useState<HiringProcess[]>([]);
  const [groups, setGroups] = useState<ProcessGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data, error: err }, groupsRes] = await Promise.all([
        supabase
          .from('hiring_processes')
          .select('*')
          .order('created_at', { ascending: false }),
        getMyProcessGroupsAction(),
      ]);

      if (err) setError(err.message);
      else {
        setProcesses((data ?? []) as HiringProcess[]);
        setGroups(groupsRes.data ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const ungrouped = processes.filter((p) => !p.group_id);
  const hasGroups = groups.length > 0;
  const hasAny = processes.length > 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Mis procesos de selección
            </h1>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Todos tus procesos activos, borradores y cerrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/empresa/eventos"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-700 border border-slate-700'
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🗂️ Eventos
            </Link>
            <Link
              href="/empresa/procesos/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              + Nuevo proceso
            </Link>
          </div>
        </div>

        {loading && (
          <div
            className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
          >
            Cargando...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 text-red-700 px-5 py-4 text-sm">
            Error al cargar procesos: {error}
          </div>
        )}

        {!loading && !error && !hasAny && (
          <div
            className={`text-center py-16 rounded-xl border-2 border-dashed ${
              isDarkMode
                ? 'border-slate-700 text-slate-500'
                : 'border-gray-200 text-gray-400'
            }`}
          >
            <p className="text-4xl mb-3">📂</p>
            <p className="font-medium mb-1">No tenés procesos todavía</p>
            <p className="text-sm mb-6">
              Creá tu primer proceso de selección para empezar a recibir
              candidatos
            </p>
            <Link
              href="/empresa/procesos/nuevo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Crear primer proceso
            </Link>
          </div>
        )}

        {!loading && !error && hasAny && (
          <div className="space-y-8">
            {/* Grouped sections */}
            {hasGroups &&
              groups.map((group) => {
                const groupProcesses = processes.filter(
                  (p) => p.group_id === group.id
                );
                if (groupProcesses.length === 0) return null;
                return (
                  <div key={group.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🗂️</span>
                      <h2
                        className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                      >
                        {group.name}
                      </h2>
                      <span
                        className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                      >
                        ({groupProcesses.length})
                      </span>
                      <div className="ml-auto flex items-center gap-3">
                        <Link
                          href={`/empresa/eventos/${group.id}`}
                          className={`text-xs transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                        >
                          📊 Stats
                        </Link>
                        <Link
                          href="/empresa/eventos"
                          className={`text-xs transition-colors ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Gestionar →
                        </Link>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {groupProcesses.map((p) => (
                        <ProcessCard key={p.id} p={p} isDarkMode={isDarkMode} />
                      ))}
                    </div>
                  </div>
                );
              })}

            {/* Ungrouped */}
            {ungrouped.length > 0 && (
              <div>
                {hasGroups && (
                  <p
                    className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    Sin categoría
                  </p>
                )}
                <div className="space-y-3">
                  {ungrouped.map((p) => (
                    <ProcessCard key={p.id} p={p} isDarkMode={isDarkMode} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/empresa"
            className={`text-sm ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            ← Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
