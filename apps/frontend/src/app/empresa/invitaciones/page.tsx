'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import {
  getEmpresaInvitacionesAction,
  createInvitacionAction,
  cancelInvitacionAction,
  resendInvitacionEmailAction,
  type EmpresaInvitacion,
} from '@/actions/empresa-invitaciones';

type HiringProcess = {
  id: string;
  code: string;
  position_name: string;
  status: string;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; darkColor: string }
> = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-700',
    darkColor: 'bg-amber-900/40 text-amber-300',
  },
  vista: {
    label: 'Vista',
    color: 'bg-blue-100 text-blue-700',
    darkColor: 'bg-blue-900/40 text-blue-300',
  },
  completada: {
    label: 'Completada',
    color: 'bg-green-100 text-green-700',
    darkColor: 'bg-green-900/40 text-green-300',
  },
  rechazada: {
    label: 'Rechazada',
    color: 'bg-red-100 text-red-600',
    darkColor: 'bg-red-900/40 text-red-300',
  },
};

function InvitarModal({
  isDarkMode,
  processes,
  onClose,
  onCreated,
}: {
  isDarkMode: boolean;
  processes: HiringProcess[];
  onClose: () => void;
  onCreated: (_inv: EmpresaInvitacion) => void;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [processId, setProcessId] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelClass = `block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error: err } = await createInvitacionAction({
      candidate_email: email.trim(),
      candidate_name: name.trim() || undefined,
      process_id: processId || undefined,
      message: message.trim() || undefined,
    });

    setSaving(false);
    if (err || !data) {
      setError(err ?? 'Error al crear la invitación');
      return;
    }
    onCreated(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
        >
          <h2
            className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Invitar candidato
          </h2>
          <button
            onClick={onClose}
            className={`text-lg ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>Email del candidato *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidato@ejemplo.com"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Nombre del candidato</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María García"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Proceso de selección (opcional)
            </label>
            <select
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
              className={inputClass}
            >
              <option value="">Sin proceso asignado</option>
              {processes
                .filter((p) => p.status === 'active')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.position_name} ({p.code})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Mensaje personalizado (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Hola, te invitamos a rendir nuestra evaluación técnica QA..."
              className={`${inputClass} resize-none`}
              maxLength={500}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Enviando...' : 'Enviar invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InvitacionesPage() {
  const { isDarkMode } = useTheme();
  const [invitaciones, setInvitaciones] = useState<EmpresaInvitacion[]>([]);
  const [processes, setProcesses] = useState<HiringProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: invs }, { data: procs }] = await Promise.all([
        getEmpresaInvitacionesAction(),
        supabase
          .from('hiring_processes')
          .select('id, code, position_name, status')
          .order('created_at', { ascending: false }),
      ]);
      setInvitaciones(invs ?? []);
      setProcesses(procs ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta invitación?')) return;
    setCancellingId(id);
    const { error } = await cancelInvitacionAction(id);
    if (!error) setInvitaciones((prev) => prev.filter((i) => i.id !== id));
    setCancellingId(null);
  };

  const handleResend = async (id: string) => {
    setResendingId(id);
    const { data } = await resendInvitacionEmailAction(id);
    if (data) {
      setInvitaciones((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );
    }
    setResendingId(null);
  };

  const filtered = invitaciones.filter(
    (i) => filterStatus === 'all' || i.status === filterStatus
  );

  const card = isDarkMode
    ? 'bg-dark-secondary border-slate-700'
    : 'bg-white border-gray-200';
  const inputClass = `rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

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
              Invitaciones a candidatos
            </h1>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Invitá candidatos QA directamente a rendir tu evaluación
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            + Invitar candidato
          </button>
        </div>

        {/* Stats */}
        {!loading && invitaciones.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Total',
                value: invitaciones.length,
                color: 'text-indigo-500',
              },
              {
                label: 'Pendientes',
                value: invitaciones.filter((i) => i.status === 'pendiente')
                  .length,
                color: 'text-amber-500',
              },
              {
                label: 'Completadas',
                value: invitaciones.filter((i) => i.status === 'completada')
                  .length,
                color: 'text-green-500',
              },
              {
                label: 'Tasa respuesta',
                value: `${Math.round((invitaciones.filter((i) => i.status === 'completada').length / invitaciones.length) * 100)}%`,
                color: 'text-emerald-500',
              },
            ].map(({ label, value, color }) => (
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
        {invitaciones.length > 0 && (
          <div className={`rounded-xl border p-4 ${card}`}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={inputClass}
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
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
        ) : invitaciones.length === 0 ? (
          <div
            className={`text-center py-16 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}
          >
            <p className="text-4xl mb-3">📧</p>
            <p className="font-medium mb-1">Sin invitaciones enviadas</p>
            <p className="text-sm mb-6">
              Invitá candidatos QA directamente para que rindan tu evaluación
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Invitar primer candidato
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border ${card}`}>
            <p
              className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              Sin invitaciones para el filtro seleccionado
            </p>
          </div>
        ) : (
          <div className={`rounded-xl border overflow-hidden ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'}>
                    {[
                      'Candidato',
                      'Proceso',
                      'Estado',
                      'Email',
                      'Enviada',
                      '',
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
                  {filtered.map((inv, i) => {
                    const sc =
                      STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pendiente;
                    return (
                      <tr
                        key={inv.id}
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
                        <td className="px-5 py-3">
                          <div
                            className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {inv.candidate_name || inv.candidate_email}
                          </div>
                          {inv.candidate_name && (
                            <div
                              className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {inv.candidate_email}
                            </div>
                          )}
                        </td>
                        <td
                          className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {inv.hiring_processes ? (
                            <Link
                              href={`/empresa/procesos/${inv.process_id}`}
                              className={`hover:underline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                            >
                              {inv.hiring_processes.position_name}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? sc.darkColor : sc.color}`}
                          >
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {inv.email_sent ? (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}
                            >
                              Enviado
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span
                                className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}
                                title={inv.email_error ?? undefined}
                              >
                                No entregado
                              </span>
                              {['pendiente', 'vista'].includes(inv.status) && (
                                <button
                                  onClick={() => handleResend(inv.id)}
                                  disabled={resendingId === inv.id}
                                  className={`block text-[11px] font-medium transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                                >
                                  {resendingId === inv.id
                                    ? 'Reenviando...'
                                    : 'Reenviar email'}
                                </button>
                              )}
                              {inv.email_error && (
                                <div
                                  className={`max-w-[180px] truncate text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                                >
                                  {inv.email_error}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td
                          className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {new Date(inv.sent_at).toLocaleDateString('es-PY')}
                        </td>
                        <td className="px-5 py-3">
                          {['pendiente', 'vista'].includes(inv.status) && (
                            <button
                              onClick={() => handleCancel(inv.id)}
                              disabled={cancellingId === inv.id}
                              className={`text-xs transition-colors ${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-gray-300 hover:text-red-500'}`}
                              title="Cancelar invitación"
                            >
                              {cancellingId === inv.id ? '...' : '✕'}
                            </button>
                          )}
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

      {showModal && (
        <InvitarModal
          isDarkMode={isDarkMode}
          processes={processes}
          onClose={() => setShowModal(false)}
          onCreated={(inv) => setInvitaciones((prev) => [inv, ...prev])}
        />
      )}
    </div>
  );
}
