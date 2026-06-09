'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ExamResult = {
  id: string;
  participant_name: string | null;
  participant_email: string | null;
  exam_type: string;
  score: number;
  percentage: number;
  passed: boolean;
  time_spent: number;
  created_at: string;
  process_code: string | null;
};

type HiringProcess = {
  id: string;
  code: string;
  position_name: string;
  status: string;
};

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL',
  git: 'Git',
  performance: 'Performance',
  'api-testing-fundamentals': 'API Testing Fundamentals',
};

type SortKey = 'percentage' | 'created_at' | 'participant_name';
type SortDir = 'asc' | 'desc';

export default function CandidatosPage() {
  const { isDarkMode } = useTheme();
  const [processes, setProcesses] = useState<HiringProcess[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<string>('all');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>(
    'all'
  );
  const [sortKey, setSortKey] = useState<SortKey>('percentage');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: procs }, { data: res }] = await Promise.all([
        supabase
          .from('hiring_processes')
          .select('id, code, position_name, status')
          .order('created_at', { ascending: false }),
        supabase
          .from('exam_results')
          .select(
            'id, participant_name, participant_email, exam_type, score, percentage, passed, time_spent, created_at, process_code'
          )
          .not('process_code', 'is', null)
          .order('created_at', { ascending: false }),
      ]);

      const myCodes = new Set((procs ?? []).map((p) => p.code));
      const myResults = (res ?? []).filter(
        (r) => r.process_code && myCodes.has(r.process_code)
      );

      setProcesses(procs ?? []);
      setResults(myResults);
      setLoading(false);
    };
    load();
  }, []);

  const availableExamTypes = useMemo(
    () => [...new Set(results.map((r) => r.exam_type))],
    [results]
  );

  // For each result, compute its attempt index and total attempts for that candidate+exam combo
  const attemptInfo = useMemo(() => {
    const groups = new Map<string, ExamResult[]>();
    for (const r of results) {
      const key = `${r.participant_email ?? r.participant_name ?? r.id}|${r.exam_type}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    const indexMap = new Map<string, number>(); // resultId -> attempt number (1-based)
    const totalMap = new Map<string, number>(); // resultId -> total attempts
    for (const group of groups.values()) {
      const sorted = [...group].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      sorted.forEach((r, i) => {
        indexMap.set(r.id, i + 1);
        totalMap.set(r.id, sorted.length);
      });
    }
    return { indexMap, totalMap };
  }, [results]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results
      .filter((r) => {
        const matchSearch =
          !q ||
          (r.participant_name?.toLowerCase().includes(q) ?? false) ||
          (r.participant_email?.toLowerCase().includes(q) ?? false);
        const matchCode =
          selectedCode === 'all' || r.process_code === selectedCode;
        const matchExam = filterExam === 'all' || r.exam_type === filterExam;
        const matchPassed =
          filterPassed === 'all' ||
          (filterPassed === 'passed' && r.passed) ||
          (filterPassed === 'failed' && !r.passed);
        return matchSearch && matchCode && matchExam && matchPassed;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'percentage') cmp = a.percentage - b.percentage;
        else if (sortKey === 'created_at')
          cmp =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        else if (sortKey === 'participant_name') {
          cmp = (a.participant_name ?? '').localeCompare(
            b.participant_name ?? ''
          );
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [
    results,
    search,
    selectedCode,
    filterExam,
    filterPassed,
    sortKey,
    sortDir,
  ]);

  // --- Chart data (all based on `filtered` so they respect active filters) ---

  const topCandidatesData = useMemo(() => {
    const best = new Map<
      string,
      { label: string; percentage: number; passed: boolean }
    >();
    for (const r of filtered) {
      const key = r.participant_email ?? r.participant_name ?? r.id;
      const label = r.participant_name || r.participant_email || 'Sin nombre';
      const cur = best.get(key);
      if (!cur || r.percentage > cur.percentage) {
        best.set(key, { label, percentage: r.percentage, passed: r.passed });
      }
    }
    return [...best.values()]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10)
      .map((c) => ({
        name: c.label.length > 22 ? c.label.slice(0, 20) + '…' : c.label,
        puntaje: c.percentage,
        passed: c.passed,
      }));
  }, [filtered]);

  const byWeekData = useMemo(() => {
    function isoWeek(date: Date): string {
      const d = new Date(date.getTime());
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const jan4 = new Date(d.getFullYear(), 0, 4);
      const week =
        1 +
        Math.round(
          ((d.getTime() - jan4.getTime()) / 86400000 -
            3 +
            ((jan4.getDay() + 6) % 7)) /
            7
        );
      return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }
    const groups = new Map<string, { total: number; aprobados: number }>();
    for (const r of filtered) {
      const w = isoWeek(new Date(r.created_at));
      const cur = groups.get(w) ?? { total: 0, aprobados: 0 };
      groups.set(w, {
        total: cur.total + 1,
        aprobados: cur.aprobados + (r.passed ? 1 : 0),
      });
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([w, d]) => ({
        semana: w.replace(/^\d{4}-/, ''),
        total: d.total,
        aprobados: d.aprobados,
      }));
  }, [filtered]);

  const byHourData = useMemo(() => {
    const counts = new Array(24).fill(0) as number[];
    const fmt = new Intl.DateTimeFormat('es-PY', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/Asuncion',
    });
    for (const r of filtered) {
      const h = parseInt(fmt.format(new Date(r.created_at)), 10) % 24;
      counts[h] += 1;
    }
    return counts.map((cnt, h) => ({
      hora: `${String(h).padStart(2, '0')}h`,
      examenes: cnt,
    }));
  }, [filtered]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const passCount = filtered.filter((r) => r.passed).length;
  const avgScore = filtered.length
    ? Math.round(
        filtered.reduce((a, r) => a + r.percentage, 0) / filtered.length
      )
    : null;

  const mins = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const card = isDarkMode
    ? 'bg-dark-secondary border-slate-700'
    : 'bg-white border-gray-200';
  const inputClass = `rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey !== k ? (
      <span className="opacity-30 ml-1">↕</span>
    ) : sortDir === 'desc' ? (
      <span className="ml-1">↓</span>
    ) : (
      <span className="ml-1">↑</span>
    );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Header */}
        <div>
          <h1
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Candidatos
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Resultados de exámenes técnicos de todos tus procesos
          </p>
        </div>

        {/* Stats */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total resultados', value: results.length.toString() },
              { label: 'Mostrando', value: filtered.length.toString() },
              {
                label: 'Aprobados (vista)',
                value: filtered.length
                  ? `${passCount} (${Math.round((passCount / filtered.length) * 100)}%)`
                  : '—',
              },
              {
                label: 'Puntaje promedio',
                value: avgScore != null ? `${avgScore}%` : '—',
              },
            ].map(({ label, value }) => (
              <div key={label} className={`rounded-xl border p-4 ${card}`}>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {label}
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filters */}
        <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-56">
              <span
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} w-full pl-8`}
              />
            </div>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className={inputClass}
            >
              <option value="all">Todos los procesos</option>
              {processes.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.position_name} ({p.code})
                </option>
              ))}
            </select>
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className={inputClass}
            >
              <option value="all">Todos los exámenes</option>
              {availableExamTypes.map((e) => (
                <option key={e} value={e}>
                  {EXAM_LABELS[e] ?? e}
                </option>
              ))}
            </select>
            <select
              value={filterPassed}
              onChange={(e) =>
                setFilterPassed(e.target.value as typeof filterPassed)
              }
              className={inputClass}
            >
              <option value="all">Todos</option>
              <option value="passed">✓ Aprobados</option>
              <option value="failed">✗ No aprobados</option>
            </select>
          </div>

          {(search ||
            selectedCode !== 'all' ||
            filterExam !== 'all' ||
            filterPassed !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCode('all');
                setFilterExam('all');
                setFilterPassed('all');
              }}
              className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div
            className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
          >
            Cargando...
          </div>
        ) : results.length === 0 ? (
          <div
            className={`text-center py-16 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}
          >
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium mb-1">Sin resultados todavía</p>
            <p className="text-sm mb-5">
              Compartí el código de un proceso con tus candidatos
            </p>
            <Link
              href="/empresa/procesos"
              className="text-sm text-indigo-400 hover:underline"
            >
              Ver mis procesos →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border ${card}`}>
            <p
              className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              Sin resultados para los filtros aplicados
            </p>
          </div>
        ) : (
          <div className={`rounded-xl border overflow-hidden ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'}>
                    <th
                      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => toggleSort('participant_name')}
                    >
                      Candidato <SortIcon k="participant_name" />
                    </th>
                    <th
                      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      Examen
                    </th>
                    <th
                      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      Proceso
                    </th>
                    <th
                      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => toggleSort('percentage')}
                    >
                      Puntaje <SortIcon k="percentage" />
                    </th>
                    <th
                      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      Tiempo
                    </th>
                    <th
                      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => toggleSort('created_at')}
                    >
                      Fecha <SortIcon k="created_at" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const proc = processes.find(
                      (p) => p.code === r.process_code
                    );
                    return (
                      <tr
                        key={r.id}
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                              {r.participant_name || (
                                <span
                                  className={`italic ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                                >
                                  Sin nombre
                                </span>
                              )}
                            </span>
                            {(attemptInfo.totalMap.get(r.id) ?? 1) > 1 && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded font-mono ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500'}`}
                              >
                                intento {attemptInfo.indexMap.get(r.id)}/
                                {attemptInfo.totalMap.get(r.id)}
                              </span>
                            )}
                          </div>
                          {r.participant_email && (
                            <div
                              className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {r.participant_email}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`font-mono text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {EXAM_LABELS[r.exam_type] ?? r.exam_type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {proc ? (
                            <Link
                              href={`/empresa/procesos/${proc.id}`}
                              className={`text-xs hover:underline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                            >
                              {proc.position_name}
                            </Link>
                          ) : (
                            <span
                              className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {r.process_code}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-base ${r.passed ? 'text-green-500' : 'text-red-500'}`}
                            >
                              {r.percentage}%
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                r.passed
                                  ? isDarkMode
                                    ? 'bg-green-900/40 text-green-300'
                                    : 'bg-green-50 text-green-700'
                                  : isDarkMode
                                    ? 'bg-red-900/40 text-red-300'
                                    : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {r.passed ? '✓' : '✗'}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {mins(r.time_spent)}
                        </td>
                        <td
                          className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {new Date(r.created_at).toLocaleDateString('es-PY')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charts */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-6">
            <h2
              className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Análisis visual
            </h2>

            {/* Top candidates */}
            <div className={`rounded-xl border p-5 ${card}`}>
              <p
                className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Mejores candidatos (puntaje más alto)
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={topCandidatesData}
                  margin={{ top: 4, right: 16, bottom: 48, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? '#334155' : '#e5e7eb'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: 11,
                    }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fill: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: 11,
                    }}
                    unit="%"
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? '#1e293b' : '#fff',
                      border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{
                      color: isDarkMode ? '#e2e8f0' : '#374151',
                      fontWeight: 600,
                    }}
                    formatter={(v: unknown) => [`${v}%`, 'Puntaje']}
                  />
                  <Bar dataKey="puntaje" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {topCandidatesData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.passed ? '#22c55e' : '#ef4444'}
                        fillOpacity={0.82}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p
                className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Verde = aprobado · Rojo = no aprobado
              </p>
            </div>

            {/* By week */}
            {byWeekData.length > 1 && (
              <div className={`rounded-xl border p-5 ${card}`}>
                <p
                  className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Actividad por semana
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={byWeekData}
                    margin={{ top: 4, right: 16, bottom: 16, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? '#334155' : '#e5e7eb'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="semana"
                      tick={{
                        fill: isDarkMode ? '#94a3b8' : '#6b7280',
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: isDarkMode ? '#94a3b8' : '#6b7280',
                        fontSize: 11,
                      }}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        background: isDarkMode ? '#1e293b' : '#fff',
                        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{
                        color: isDarkMode ? '#e2e8f0' : '#374151',
                        fontWeight: 600,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 12,
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
                      }}
                    />
                    <Bar
                      dataKey="total"
                      name="Total"
                      fill="#6366f1"
                      fillOpacity={0.8}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="aprobados"
                      name="Aprobados"
                      fill="#22c55e"
                      fillOpacity={0.8}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* By hour */}
            <div className={`rounded-xl border p-5 ${card}`}>
              <p
                className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Distribución por hora del día
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={byHourData}
                  margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? '#334155' : '#e5e7eb'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="hora"
                    tick={{
                      fill: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: 10,
                    }}
                    interval={3}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: 11,
                    }}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? '#1e293b' : '#fff',
                      border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{
                      color: isDarkMode ? '#e2e8f0' : '#374151',
                      fontWeight: 600,
                    }}
                    formatter={(v: number | string) => [v, 'Exámenes']}
                  />
                  <Bar
                    dataKey="examenes"
                    fill="#6366f1"
                    fillOpacity={0.72}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p
                className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Hora en zona horaria Paraguay (UTC−4)
              </p>
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
