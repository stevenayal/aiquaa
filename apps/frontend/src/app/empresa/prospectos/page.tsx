'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getEmpresaProspectsAction,
  updateProspectStatusAction,
  getCvSignedUrlAction,
  type ProspectWithProcess,
  type ProspectStatus,
} from '@/actions/prospects';

const STATUS_CONFIG: Record<
  ProspectStatus,
  { label: string; color: string; darkColor: string }
> = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-700',
    darkColor: 'bg-amber-900/40 text-amber-300',
  },
  invitado: {
    label: 'Invitado',
    color: 'bg-blue-100 text-blue-700',
    darkColor: 'bg-blue-900/40 text-blue-300',
  },
  rendido: {
    label: 'Rendido',
    color: 'bg-green-100 text-green-700',
    darkColor: 'bg-green-900/40 text-green-300',
  },
  descartado: {
    label: 'Descartado',
    color: 'bg-slate-100 text-slate-500',
    darkColor: 'bg-slate-700 text-slate-400',
  },
};

const SOURCE_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn',
  referido: 'Referido',
  bolsa: 'Bolsa',
  otro: 'Otro',
};

export default function ProspectosPage() {
  const { isDarkMode } = useTheme();
  const [prospects, setProspects] = useState<ProspectWithProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pendiente');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getEmpresaProspectsAction().then(({ data }) => {
      setProspects(data ?? []);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (
    prospect: ProspectWithProcess,
    newStatus: ProspectStatus
  ) => {
    setUpdatingId(prospect.id);
    const { error } = await updateProspectStatusAction(prospect.id, newStatus);
    if (!error) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === prospect.id ? { ...p, status: newStatus } : p
        )
      );
    }
    setUpdatingId(null);
  };

  const handleCvDownload = async (cvPath: string) => {
    const { url, error } = await getCvSignedUrlAction(cvPath);
    if (url) window.open(url, '_blank');
    else alert(error ?? 'No se pudo obtener el CV');
  };

  const filtered =
    filterStatus === 'all'
      ? prospects
      : prospects.filter((p) => p.status === filterStatus);

  const card = isDarkMode
    ? 'bg-dark-secondary border-slate-700'
    : 'bg-white border-gray-200';

  const inputClass = `rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const countByStatus = (s: ProspectStatus) =>
    prospects.filter((p) => p.status === s).length;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Prospectos
            </h1>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Candidatos en pipeline de selección por proceso
            </p>
          </div>
        </div>

        {/* Stats */}
        {!loading && prospects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                {
                  label: 'Total',
                  value: prospects.length,
                  color: 'text-indigo-500',
                },
                {
                  label: 'Pendientes',
                  value: countByStatus('pendiente'),
                  color: 'text-amber-500',
                },
                {
                  label: 'Invitados',
                  value: countByStatus('invitado'),
                  color: 'text-blue-500',
                },
                {
                  label: 'Rendidos',
                  value: countByStatus('rendido'),
                  color: 'text-green-500',
                },
              ] as const
            ).map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border p-4 ${card}`}>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p
                  className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        {prospects.length > 0 && (
          <div className={`rounded-xl border p-4 ${card}`}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={inputClass}
            >
              <option value="all">Todos los estados</option>
              {(
                Object.entries(STATUS_CONFIG) as [
                  ProspectStatus,
                  (typeof STATUS_CONFIG)[ProspectStatus],
                ][]
              ).map(([val, cfg]) => (
                <option key={val} value={val}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div
            className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
          >
            Cargando...
          </div>
        ) : prospects.length === 0 ? (
          <div
            className={`text-center py-16 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}
          >
            <p className="text-4xl mb-3">👤</p>
            <p className="font-medium mb-1">Sin prospectos registrados</p>
            <p className="text-sm mb-6">
              Agregá prospectos desde la página de cada proceso de selección
            </p>
            <Link
              href="/empresa/procesos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Ver mis procesos
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border ${card}`}>
            <p
              className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              Sin prospectos para el estado seleccionado
            </p>
          </div>
        ) : (
          <div className={`rounded-xl border overflow-hidden ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'}>
                    {[
                      'Prospecto',
                      'Proceso',
                      'Fuente',
                      'Estado',
                      'CV',
                      'Fecha',
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const sc = STATUS_CONFIG[p.status];
                    return (
                      <tr
                        key={p.id}
                        className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} ${
                          i % 2 === 0
                            ? isDarkMode
                              ? 'bg-dark-secondary'
                              : 'bg-white'
                            : isDarkMode
                              ? 'bg-slate-800/30'
                              : 'bg-gray-50/50'
                        }`}
                      >
                        {/* Prospecto */}
                        <td className="px-5 py-3">
                          <div
                            className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {p.name}
                          </div>
                          {p.email && (
                            <div
                              className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {p.email}
                            </div>
                          )}
                          {p.phone && (
                            <div
                              className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {p.phone}
                            </div>
                          )}
                        </td>

                        {/* Proceso */}
                        <td
                          className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          <Link
                            href={`/empresa/procesos/${p.hiring_processes.id}`}
                            className={`hover:underline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                          >
                            {p.hiring_processes.position_name}
                          </Link>
                          <div
                            className={`font-mono mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                          >
                            {p.hiring_processes.code}
                          </div>
                        </td>

                        {/* Fuente */}
                        <td
                          className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {p.source
                            ? (SOURCE_LABEL[p.source] ?? p.source)
                            : '—'}
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-3">
                          <select
                            value={p.status}
                            disabled={updatingId === p.id}
                            onChange={(e) =>
                              handleStatusChange(
                                p,
                                e.target.value as ProspectStatus
                              )
                            }
                            className={`text-xs font-medium px-2 py-1 rounded-lg border-0 outline-none cursor-pointer disabled:opacity-50 ${
                              isDarkMode ? sc.darkColor : sc.color
                            } ${isDarkMode ? 'bg-opacity-100' : ''}`}
                          >
                            {(
                              Object.entries(STATUS_CONFIG) as [
                                ProspectStatus,
                                (typeof STATUS_CONFIG)[ProspectStatus],
                              ][]
                            ).map(([val, cfg]) => (
                              <option key={val} value={val}>
                                {cfg.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* CV */}
                        <td className="px-5 py-3">
                          {p.cv_url ? (
                            <button
                              onClick={() => handleCvDownload(p.cv_url!)}
                              className={`text-xs transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                            >
                              Ver CV
                            </button>
                          ) : (
                            <span
                              className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}
                            >
                              —
                            </span>
                          )}
                        </td>

                        {/* Fecha */}
                        <td
                          className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {new Date(p.created_at).toLocaleDateString('es-PY')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
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
