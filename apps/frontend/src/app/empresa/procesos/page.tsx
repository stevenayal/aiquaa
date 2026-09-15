'use client';

import Link from 'next/link';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  archiveProcessGroupAction,
  getEmpresaProcessesOverviewAction,
  unarchiveProcessGroupAction,
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

type HiringProcess = ProcessListItem;

const statusLabel: Record<string, { text: string; className: string }> = {
  draft: { text: 'Borrador', className: 'bg-gray-100 text-gray-600' },
  active: { text: 'Activo', className: 'bg-green-100 text-green-700' },
  closed: { text: 'Cerrado', className: 'bg-red-100 text-red-600' },
  expired: { text: 'Vencido', className: 'bg-amber-100 text-amber-700' },
};

const statusDarkClass: Record<EffectiveProcessStatus, string> = {
  draft: 'bg-slate-700 text-slate-400',
  active: 'bg-green-900/40 text-green-300',
  closed: 'bg-red-900/40 text-red-300',
  expired: 'bg-amber-900/40 text-amber-300',
};

const PREF_SORT = 'empresa_procesos_event_sort';
const PREF_HIDE_CLOSED = 'empresa_procesos_hide_closed_events';
const PREF_SHOW_ARCHIVED = 'empresa_procesos_show_archived_events';

// One shared formatter instead of toLocaleDateString per card per render.
const dateFormatter = new Intl.DateTimeFormat('es-PY');

const ProcessCard = memo(function ProcessCard({
  p,
  effectiveStatus,
  isDarkMode,
}: {
  p: HiringProcess;
  effectiveStatus: EffectiveProcessStatus;
  isDarkMode: boolean;
}) {
  const s = statusLabel[effectiveStatus] ?? statusLabel.draft;
  const isExpired = effectiveStatus === 'expired';
  return (
    <div
      // content-visibility lets the browser skip layout/paint of cards that
      // are off-screen, which is what made long lists feel sluggish.
      className={`rounded-xl border p-5 transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_110px] ${
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
                isDarkMode ? statusDarkClass[effectiveStatus] : s.className
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
              {(p.exam_types ?? []).join(', ')}
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
                {dateFormatter.format(new Date(p.expires_at))}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/empresa/procesos/${p.id}`}
          prefetch={false}
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
});

const ProcessList = memo(function ProcessList({
  processes,
  statusById,
  isDarkMode,
}: {
  processes: HiringProcess[];
  statusById: Map<string, EffectiveProcessStatus>;
  isDarkMode: boolean;
}) {
  return (
    <div className="space-y-3">
      {processes.map((p) => (
        <ProcessCard
          key={p.id}
          p={p}
          effectiveStatus={statusById.get(p.id) ?? p.status}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
});

export default function ProcesosPage() {
  const { isDarkMode } = useTheme();
  const [processes, setProcesses] = useState<HiringProcess[]>([]);
  const [groups, setGroups] = useState<ProcessGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eventSort, setEventSort] = useState<EventSort>('recent');
  const [hideClosedInEvents, setHideClosedInEvents] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Restore the viewer's list preferences after mount (localStorage is not
  // available during SSR).
  useEffect(() => {
    const sort = readStoredPreference(PREF_SORT);
    if (isEventSort(sort)) setEventSort(sort);
    setHideClosedInEvents(readStoredPreference(PREF_HIDE_CLOSED) === '1');
    setShowArchived(readStoredPreference(PREF_SHOW_ARCHIVED) === '1');
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error: err } = await getEmpresaProcessesOverviewAction();
      if (cancelled) return;
      if (err || !data) setError(err ?? 'Error desconocido');
      else {
        setProcesses(data.processes);
        setGroups(data.groups);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Single O(n) pass: effective status per process + processes per group,
  // instead of re-filtering the whole list for every group on every render.
  const { statusById, byGroup, ungrouped, summaries } = useMemo(() => {
    const now = Date.now();
    const statusById = new Map<string, EffectiveProcessStatus>();
    const byGroup = new Map<string, HiringProcess[]>();
    const ungrouped: HiringProcess[] = [];
    for (const p of processes) {
      statusById.set(p.id, getEffectiveProcessStatus(p, now));
      if (!p.group_id) {
        ungrouped.push(p);
        continue;
      }
      const list = byGroup.get(p.group_id);
      if (list) list.push(p);
      else byGroup.set(p.group_id, [p]);
    }
    const summaries = new Map<string, EventSummary>();
    byGroup.forEach((list, groupId) => {
      summaries.set(groupId, summarizeEvent(list, now));
    });
    return { statusById, byGroup, ungrouped, summaries };
  }, [processes]);

  const visibleGroups = useMemo(() => {
    const withProcesses = groups.filter(
      (g) =>
        (byGroup.get(g.id)?.length ?? 0) > 0 && (showArchived || !g.archived_at)
    );
    const sorted = sortEvents(withProcesses, summaries, eventSort);
    // Events dados de baja always go last, after active and finished ones.
    return [
      ...sorted.filter((g) => !g.archived_at),
      ...sorted.filter((g) => g.archived_at),
    ];
  }, [groups, byGroup, summaries, eventSort, showArchived]);

  const archivedCount = useMemo(
    () =>
      groups.filter((g) => g.archived_at && (byGroup.get(g.id)?.length ?? 0))
        .length,
    [groups, byGroup]
  );

  const hasGroups = groups.some((g) => (byGroup.get(g.id)?.length ?? 0) > 0);
  const hasAny = processes.length > 0;

  const changeSort = (value: string) => {
    if (!isEventSort(value)) return;
    setEventSort(value);
    writeStoredPreference(PREF_SORT, value);
  };

  const toggleHideClosed = (checked: boolean) => {
    setHideClosedInEvents(checked);
    writeStoredPreference(PREF_HIDE_CLOSED, checked ? '1' : '0');
  };

  const toggleShowArchived = (checked: boolean) => {
    setShowArchived(checked);
    writeStoredPreference(PREF_SHOW_ARCHIVED, checked ? '1' : '0');
  };

  const handleArchive = useCallback(
    async (group: ProcessGroup, summary: EventSummary | undefined) => {
      const open = summary?.open ?? 0;
      const message =
        open > 0
          ? `"${group.name}" todavía tiene ${open} proceso${open === 1 ? '' : 's'} activo${open === 1 ? '' : 's'}. Al darlo de baja se cerrará${open === 1 ? '' : 'n'} y los candidatos ya no podrán rendir.\n\n¿Dar de baja el evento?`
          : `¿Dar de baja "${group.name}"? Se oculta de los eventos activos; sus procesos y resultados se conservan y podés reactivarlo cuando quieras.`;
      if (!confirm(message)) return;

      setBusyGroupId(group.id);
      setActionError(null);
      const { error: err } = await archiveProcessGroupAction(group.id, {
        closeActiveProcesses: open > 0,
      });
      setBusyGroupId(null);
      if (err) {
        setActionError(err);
        return;
      }
      const archivedAt = new Date().toISOString();
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id ? { ...g, archived_at: archivedAt } : g
        )
      );
      if (open > 0) {
        setProcesses((prev) =>
          prev.map((p) =>
            p.group_id === group.id && p.status === 'active'
              ? { ...p, status: 'closed' }
              : p
          )
        );
      }
    },
    []
  );

  const handleUnarchive = useCallback(async (group: ProcessGroup) => {
    setBusyGroupId(group.id);
    setActionError(null);
    const { error: err } = await unarchiveProcessGroupAction(group.id);
    setBusyGroupId(null);
    if (err) {
      setActionError(err);
      return;
    }
    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, archived_at: null } : g))
    );
  }, []);

  const controlClass = `rounded-lg border px-2.5 py-1.5 text-xs outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white'
      : 'bg-white border-gray-300 text-gray-700'
  }`;
  const checkboxLabelClass = `inline-flex items-center gap-2 text-xs cursor-pointer select-none ${
    isDarkMode ? 'text-slate-300' : 'text-gray-600'
  }`;

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
            {/* Event list controls */}
            {hasGroups && (
              <div
                className={`flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border px-4 py-3 ${
                  isDarkMode
                    ? 'bg-dark-secondary border-slate-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <label className={checkboxLabelClass}>
                  <span>Ordenar eventos:</span>
                  <select
                    value={eventSort}
                    onChange={(e) => changeSort(e.target.value)}
                    className={controlClass}
                  >
                    {EVENT_SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={checkboxLabelClass}>
                  <input
                    type="checkbox"
                    checked={hideClosedInEvents}
                    onChange={(e) => toggleHideClosed(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Ocultar procesos cerrados y vencidos de eventos
                </label>
                {archivedCount > 0 && (
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => toggleShowArchived(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Mostrar eventos dados de baja ({archivedCount})
                  </label>
                )}
                <span
                  className={`text-xs sm:ml-auto ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  Los eventos con procesos activos se muestran primero
                </span>
              </div>
            )}

            {actionError && (
              <div className="rounded-xl border border-red-300 bg-red-50 text-red-700 px-5 py-3 text-sm">
                {actionError}
              </div>
            )}

            {/* Grouped sections */}
            {visibleGroups.map((group) => {
              const groupProcesses = byGroup.get(group.id) ?? [];
              const summary = summaries.get(group.id);
              const shownProcesses = hideClosedInEvents
                ? groupProcesses.filter((p) => {
                    const s = statusById.get(p.id);
                    return s !== 'closed' && s !== 'expired';
                  })
                : groupProcesses;
              const hiddenCount = groupProcesses.length - shownProcesses.length;
              const isArchived = Boolean(group.archived_at);
              const isBusy = busyGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className={isArchived ? 'opacity-75' : undefined}
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-base">🗂️</span>
                    <h2
                      className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
                    >
                      {group.name}
                    </h2>
                    <span
                      className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                    >
                      ({groupProcesses.length}
                      {hiddenCount > 0 ? ` · ${hiddenCount} ocultos` : ''})
                    </span>
                    {isArchived ? (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isDarkMode
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        Dado de baja
                      </span>
                    ) : summary?.finished ? (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isDarkMode
                            ? 'bg-amber-900/40 text-amber-300'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        Finalizado
                      </span>
                    ) : null}
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
                      {isArchived ? (
                        <button
                          type="button"
                          onClick={() => handleUnarchive(group)}
                          disabled={isBusy}
                          className={`text-xs font-medium transition-colors disabled:opacity-50 ${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'}`}
                        >
                          {isBusy ? '...' : '↩ Reactivar'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleArchive(group, summary)}
                          disabled={isBusy}
                          title="Dar de baja un evento que ya terminó"
                          className={`text-xs font-medium transition-colors disabled:opacity-50 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}
                        >
                          {isBusy ? '...' : '⏹ Dar de baja'}
                        </button>
                      )}
                    </div>
                  </div>
                  {shownProcesses.length > 0 ? (
                    <ProcessList
                      processes={shownProcesses}
                      statusById={statusById}
                      isDarkMode={isDarkMode}
                    />
                  ) : (
                    <div
                      className={`rounded-xl border border-dashed px-5 py-3 text-xs flex items-center justify-between gap-3 ${
                        isDarkMode
                          ? 'border-slate-700 text-slate-500'
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      <span>
                        Todos los procesos de este evento están cerrados o
                        vencidos.
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleHideClosed(false)}
                        className={`shrink-0 font-medium ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                      >
                        Mostrar
                      </button>
                    </div>
                  )}
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
                <ProcessList
                  processes={ungrouped}
                  statusById={statusById}
                  isDarkMode={isDarkMode}
                />
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
