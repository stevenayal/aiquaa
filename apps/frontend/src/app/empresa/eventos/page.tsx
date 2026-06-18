'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import {
  getMyProcessGroupsAction,
  createProcessGroupAction,
  deleteProcessGroupAction,
  assignProcessToGroupAction,
  type ProcessGroup,
} from '@/actions/employer';

type Process = {
  id: string;
  code: string;
  position_name: string;
  status: 'draft' | 'active' | 'closed';
  group_id: string | null;
};

const statusLabel: Record<string, string> = {
  active: 'Activo',
  draft: 'Borrador',
  closed: 'Cerrado',
};

export default function EventosPage() {
  const { isDarkMode } = useTheme();
  const [groups, setGroups] = useState<ProcessGroup[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const [groupsRes, processesRes] = await Promise.all([
      getMyProcessGroupsAction(),
      supabase
        .from('hiring_processes')
        .select('id, code, position_name, status, group_id')
        .order('created_at', { ascending: false }),
    ]);
    setGroups(groupsRes.data ?? []);
    setProcesses((processesRes.data ?? []) as Process[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    setError(null);
    const res = await createProcessGroupAction({
      name: newGroupName,
      description: newGroupDesc,
    });
    if (res.error) {
      setError(res.error);
    } else {
      setNewGroupName('');
      setNewGroupDesc('');
      setShowForm(false);
      await load();
    }
    setCreating(false);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('¿Eliminar este evento? Los procesos quedarán sin categoría.'))
      return;
    setDeletingId(groupId);
    await deleteProcessGroupAction(groupId);
    setDeletingId(null);
    await load();
  };

  const handleAssign = async (groupId: string) => {
    if (!selectedProcess) return;
    await assignProcessToGroupAction(selectedProcess, groupId);
    setAddingToGroup(null);
    setSelectedProcess('');
    await load();
  };

  const handleUnassign = async (processId: string) => {
    await assignProcessToGroupAction(processId, null);
    await load();
  };

  const ungrouped = processes.filter((p) => !p.group_id);

  const cardClass = `rounded-xl border ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`;
  const inputClass = `rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Eventos y categorías
            </h1>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Agrupá tus procesos por bootcamp, evento o campaña de selección
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              + Nuevo evento
            </button>
          )}
        </div>

        {/* Create group form */}
        {showForm && (
          <form
            onSubmit={handleCreateGroup}
            className={`${cardClass} p-5 mb-6 space-y-3`}
          >
            <h2
              className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Nuevo evento
            </h2>
            <input
              className={`${inputClass} w-full`}
              placeholder="Nombre del evento (ej. Bootcamp 2026 CLT)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
              maxLength={100}
              autoFocus
            />
            <input
              className={`${inputClass} w-full`}
              placeholder="Descripción (opcional)"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              maxLength={300}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !newGroupName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creando...' : 'Crear evento'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div
            className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
          >
            Cargando...
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {/* Groups */}
            {groups.map((group) => {
              const groupProcesses = processes.filter(
                (p) => p.group_id === group.id
              );
              const availableToAdd = ungrouped;
              const isAddingHere = addingToGroup === group.id;

              return (
                <div key={group.id} className={`${cardClass} p-5`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2
                        className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {group.name}
                      </h2>
                      {group.description && (
                        <p
                          className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {group.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      disabled={deletingId === group.id}
                      className={`shrink-0 text-xs px-2 py-1 rounded transition-colors ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-red-900/30'
                          : 'text-red-500 hover:bg-red-50'
                      }`}
                      title="Eliminar evento"
                    >
                      {deletingId === group.id ? '...' : '🗑️ Eliminar'}
                    </button>
                  </div>

                  {/* Process chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {groupProcesses.length === 0 && (
                      <span
                        className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                      >
                        Sin procesos asignados
                      </span>
                    )}
                    {groupProcesses.map((p) => (
                      <div
                        key={p.id}
                        className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-mono border ${
                          isDarkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-200'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <Link
                          href={`/empresa/procesos/${p.id}`}
                          className="hover:underline"
                          title={p.position_name}
                        >
                          {p.code}
                        </Link>
                        <span
                          className={`text-xs ${
                            p.status === 'active'
                              ? 'text-green-500'
                              : p.status === 'closed'
                                ? 'text-red-400'
                                : 'text-gray-400'
                          }`}
                        >
                          · {statusLabel[p.status]}
                        </span>
                        <button
                          onClick={() => handleUnassign(p.id)}
                          className={`ml-0.5 w-4 h-4 flex items-center justify-center rounded-full text-xs transition-colors ${
                            isDarkMode
                              ? 'hover:bg-slate-600 text-slate-400'
                              : 'hover:bg-gray-200 text-gray-400'
                          }`}
                          title="Quitar del evento"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add process to group */}
                  {!isAddingHere ? (
                    <button
                      onClick={() => {
                        setAddingToGroup(group.id);
                        setSelectedProcess('');
                      }}
                      disabled={availableToAdd.length === 0}
                      className={`text-xs font-medium transition-colors disabled:opacity-40 ${
                        isDarkMode
                          ? 'text-indigo-400 hover:text-indigo-300'
                          : 'text-indigo-600 hover:text-indigo-500'
                      }`}
                    >
                      + Agregar proceso
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <select
                        className={`${inputClass} text-xs py-1.5`}
                        value={selectedProcess}
                        onChange={(e) => setSelectedProcess(e.target.value)}
                        autoFocus
                      >
                        <option value="">— Seleccioná un proceso —</option>
                        {availableToAdd.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} — {p.position_name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(group.id)}
                        disabled={!selectedProcess}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        Agregar
                      </button>
                      <button
                        onClick={() => {
                          setAddingToGroup(null);
                          setSelectedProcess('');
                        }}
                        className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ungrouped */}
            {ungrouped.length > 0 && (
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-2 px-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  Sin categoría
                </p>
                <div className={`${cardClass} p-5`}>
                  <div className="flex flex-wrap gap-2">
                    {ungrouped.map((p) => (
                      <Link
                        key={p.id}
                        href={`/empresa/procesos/${p.id}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
                          isDarkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                        title={p.position_name}
                      >
                        {p.code}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {groups.length === 0 && ungrouped.length === 0 && (
              <div
                className={`text-center py-16 rounded-xl border-2 border-dashed ${
                  isDarkMode
                    ? 'border-slate-700 text-slate-500'
                    : 'border-gray-200 text-gray-400'
                }`}
              >
                <p className="text-4xl mb-3">🗂️</p>
                <p className="font-medium mb-1">No hay eventos todavía</p>
                <p className="text-sm">
                  Creá un evento para agrupar tus procesos de selección
                </p>
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
