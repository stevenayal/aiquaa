'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  createProcessGroupAction,
  deleteProcessGroupAction,
  assignProcessToGroupAction,
  archiveProcessGroupAction,
  unarchiveProcessGroupAction,
  getEmpresaProcessesOverviewAction,
  type ProcessGroup,
  type ProcessListItem,
} from '@/actions/employer';
import {
  EVENT_SORT_OPTIONS,
  getEffectiveProcessStatus,
  isEventSort,
  readStoredPreference,
  sortEvents,
  summarizeEvent,
  writeStoredPreference,
  type EffectiveProcessStatus,
  type EventSort,
  type EventSummary,
} from '@/lib/process-events';

type Process = ProcessListItem;

const statusLabel: Record<EffectiveProcessStatus, string> = {
  active: 'Activo',
  draft: 'Borrador',
  closed: 'Cerrado',
  expired: 'Vencido',
};

const PREF_SORT = 'empresa_eventos_sort';
const PREF_HIDE_CLOSED = 'empresa_eventos_hide_closed';

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
  const [eventSort, setEventSort] = useState<EventSort>('recent');
  const [hideClosed, setHideClosed] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    // One round trip, scoped to the viewer's own / empresa processes.
    const { data, error: err } = await getEmpresaProcessesOverviewAction();
    if (err) setActionError(err);
    setGroups(data?.groups ?? []);
    setProcesses(data?.processes ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const sort = readStoredPreference(PREF_SORT);
    if (isEventSort(sort)) setEventSort(sort);
    setHideClosed(readStoredPreference(PREF_HIDE_CLOSED) === '1');
  }, []);

  const { byGroup, statusById, summaries, ungrouped } = useMemo(() => {
    const now = Date.now();
    const statusById = new Map<string, EffectiveProcessStatus>();
    const byGroup = new Map<string, Process[]>();
    const ungrouped: Process[] = [];
    for (const p of processes) {
      statusById.set(p.id, getEffectiveProcessStatus(p, now));
      if (!p.group_id) ungrouped.push(p);
      else {
        const list = byGroup.get(p.group_id);
        if (list) list.push(p);
        else byGroup.set(p.group_id, [p]);
      }
    }
    const summaries = new Map<string, EventSummary>();
    for (const g of groups) {
      summaries.set(g.id, summarizeEvent(byGroup.get(g.id) ?? [], now));
    }
    return { byGroup, statusById, summaries, ungrouped };
  }, [processes, groups]);

  const { activeGroups, archivedGroups } = useMemo(() => {
    const sorted = sortEvents(groups, summaries, eventSort);
    return {
      activeGroups: sorted.filter((g) => !g.archived_at),
      archivedGroups: sorted.filter((g) => g.archived_at),
    };
  }, [groups, summaries, eventSort]);

  const changeSort = (value: string) => {
    if (!isEventSort(value)) return;
    setEventSort(value);
    writeStoredPreference(PREF_SORT, value);
  };

  const toggleHideClosed = (checked: boolean) => {
    setHideClosed(checked);
    writeStoredPreference(PREF_HIDE_CLOSED, checked ? '1' : '0');
  };

  const handleArchiveGroup = async (group: ProcessGroup) => {
    const open = summaries.get(group.id)?.open ?? 0;
    const plural = open === 1 ? '' : 's';
    const message =
      open > 0
        ? `"${group.name}" todavía tiene ${open} proceso${plural} activo${plural}. Al darlo de baja se cerrará${open === 1 ? '' : 'n'} y los candidatos ya no podrán rendir.\n\n¿Dar de baja el evento?`
        : `¿Dar de baja "${group.name}"? Se oculta de los eventos activos; sus procesos y resultados se conservan y podés reactivarlo cuando quieras.`;
    if (!confirm(message)) return;
    setArchivingId(group.id);
    setActionError(null);
    const res = await archiveProcessGroupAction(group.id, {
      closeActiveProcesses: open > 0,
    });
    setArchivingId(null);
    if (res.error) {
      setActionError(res.error);
      return;
    }
    await load();
  };

  const handleUnarchiveGroup = async (groupId: string) => {
    setArchivingId(groupId);
    setActionError(null);
    const res = await unarchiveProcessGroupAction(groupId);
    setArchivingId(null);
    if (res.error) {
      setActionError(res.error);
      return;
    }
    await load();
  };

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
            {/* List controls */}
            {groups.length > 0 && (
              <div
                className={`${cardClass} flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3`}
              >
                <label
                  className={`inline-flex items-center gap-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                >
                  <span>Ordenar eventos activos:</span>
                  <select
                    value={eventSort}
                    onChange={(e) => changeSort(e.target.value)}
                    className={`${inputClass} text-xs py-1.5`}
                  >
                    {EVENT_SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label
                  className={`inline-flex items-center gap-2 text-xs cursor-pointer select-none ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                >
                  <input
                    type="checkbox"
                    checked={hideClosed}
                    onChange={(e) => toggleHideClosed(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Ocultar procesos cerrados y vencidos
                </label>
              </div>
            )}

            {actionError && (
              <div className="rounded-xl border border-red-300 bg-red-50 text-red-700 px-5 py-3 text-sm">
                {actionError}
              </div>
            )}

            {/* Groups */}
            {[...activeGroups, ...(showArchived ? archivedGroups : [])].map(
              (group) => {
                const allGroupProcesses = byGroup.get(group.id) ?? [];
                const groupProcesses = hideClosed
                  ? allGroupProcesses.filter((p) => {
                      const st = statusById.get(p.id);
                      return st !== 'closed' && st !== 'expired';
                    })
                  : allGroupProcesses;
                const hiddenCount =
                  allGroupProcesses.length - groupProcesses.length;
                const summary = summaries.get(group.id);
                const isArchived = Boolean(group.archived_at);
                const availableToAdd = ungrouped;
                const isAddingHere = addingToGroup === group.id;

                return (
                  <div
                    key={group.id}
                    className={`${cardClass} p-5 ${isArchived ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2
                            className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {group.name}
                          </h2>
                          {isArchived ? (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'}`}
                            >
                              Dado de baja
                            </span>
                          ) : summary?.finished ? (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'}`}
                            >
                              Finalizado
                            </span>
                          ) : summary && summary.open > 0 ? (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'}`}
                            >
                              {summary.open} activo
                              {summary.open === 1 ? '' : 's'}
                            </span>
                          ) : null}
                        </div>
                        {group.description && (
                          <p
                            className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                          >
                            {group.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/empresa/eventos/${group.id}`}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDarkMode
                              ? 'text-indigo-400 hover:bg-slate-700'
                              : 'text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          📊 Estadísticas
                        </Link>
                        {isArchived ? (
                          <button
                            onClick={() => handleUnarchiveGroup(group.id)}
                            disabled={archivingId === group.id}
                            className={`text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 ${
                              isDarkMode
                                ? 'text-green-400 hover:bg-green-900/30'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title="Volver a mostrar el evento como vigente"
                          >
                            {archivingId === group.id ? '...' : '↩ Reactivar'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchiveGroup(group)}
                            disabled={archivingId === group.id}
                            className={`text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 ${
                              isDarkMode
                                ? 'text-amber-400 hover:bg-amber-900/30'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title="Dar de baja un evento que ya terminó (se conservan procesos y resultados)"
                          >
                            {archivingId === group.id
                              ? '...'
                              : '⏹ Dar de baja'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          disabled={deletingId === group.id}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDarkMode
                              ? 'text-red-400 hover:bg-red-900/30'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                          title="Eliminar evento"
                        >
                          {deletingId === group.id ? '...' : '🗑️ Eliminar'}
                        </button>
                      </div>
                    </div>

                    {/* Process chips */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {allGroupProcesses.length === 0 && (
                        <span
                          className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                        >
                          Sin procesos asignados
                        </span>
                      )}
                      {hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleHideClosed(false)}
                          className={`text-xs self-center ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
                          title="Mostrar procesos cerrados y vencidos"
                        >
                          +{hiddenCount} cerrados/vencidos ocultos
                        </button>
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
                              statusById.get(p.id) === 'active'
                                ? 'text-green-500'
                                : statusById.get(p.id) === 'closed'
                                  ? 'text-red-400'
                                  : statusById.get(p.id) === 'expired'
                                    ? 'text-amber-500'
                                    : 'text-gray-400'
                            }`}
                          >
                            · {statusLabel[statusById.get(p.id) ?? p.status]}
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
              }
            )}

            {archivedGroups.length > 0 && (
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className={`w-full text-xs font-medium py-2 rounded-lg border border-dashed transition-colors ${
                  isDarkMode
                    ? 'border-slate-700 text-slate-400 hover:text-slate-200'
                    : 'border-gray-300 text-gray-500 hover:text-gray-700'
                }`}
              >
                {showArchived
                  ? 'Ocultar eventos dados de baja'
                  : `Mostrar eventos dados de baja (${archivedGroups.length})`}
              </button>
            )}

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
