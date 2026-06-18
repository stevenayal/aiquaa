'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
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
import {
  getEventStatsAction,
  type EventStats,
  type EventProcessStat,
} from '@/actions/employer';

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL',
  git: 'Git',
  performance: 'Performance',
  'api-testing-fundamentals': 'API Fundamentals',
  'api-banking': 'API Banking',
  'database-fundamentals': 'BD Fundamentos',
  'database-practice': 'BD Práctica SQL',
};

function getEffectiveStatus(
  p: EventProcessStat
): 'active' | 'closed' | 'draft' | 'expired' {
  if (
    p.status === 'active' &&
    p.expires_at &&
    new Date(p.expires_at) < new Date()
  ) {
    return 'expired';
  }
  return p.status;
}

const STATUS_BADGE: Record<
  string,
  { text: string; light: string; dark: string }
> = {
  active: {
    text: 'Activo',
    light: 'bg-green-100 text-green-700',
    dark: 'bg-green-900/40 text-green-300',
  },
  closed: {
    text: 'Cerrado',
    light: 'bg-red-100 text-red-600',
    dark: 'bg-red-900/40 text-red-300',
  },
  draft: {
    text: 'Borrador',
    light: 'bg-gray-100 text-gray-600',
    dark: 'bg-slate-700 text-slate-400',
  },
  expired: {
    text: 'Vencido',
    light: 'bg-amber-100 text-amber-700',
    dark: 'bg-amber-900/40 text-amber-300',
  },
};

function StatCard({
  label,
  value,
  sub,
  isDarkMode,
}: {
  label: string;
  value: string | number;
  sub?: string;
  isDarkMode: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDarkMode
          ? 'bg-dark-secondary border-slate-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <p
        className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function EventoDetailPage() {
  const { isDarkMode } = useTheme();
  const params = useParams();
  const groupId = params.id as string;

  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEventStatsAction(groupId).then(({ data, error: err }) => {
      if (err) setError(err);
      else setStats(data);
      setLoading(false);
    });
  }, [groupId]);

  const cardClass = `rounded-xl border ${
    isDarkMode
      ? 'bg-dark-secondary border-slate-700'
      : 'bg-white border-gray-200'
  }`;
  const headingClass = `text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg text-slate-400' : 'bg-gray-50 text-gray-400'}`}
      >
        Cargando estadísticas...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">{error ?? 'Evento no encontrado'}</p>
          <Link
            href="/empresa/eventos"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Volver a eventos
          </Link>
        </div>
      </div>
    );
  }

  const { group, processes, topCandidates, byExamType, totals } = stats;

  const topChartData = topCandidates.map((c) => ({
    name: c.name.length > 22 ? c.name.slice(0, 22) + '…' : c.name,
    fullName: c.name,
    puntaje: c.percentage,
    examType: EXAM_LABELS[c.examType] ?? c.examType,
    processCode: c.processCode,
    passed: c.passed,
  }));

  const examChartData = byExamType.map((e) => ({
    name: EXAM_LABELS[e.examType] ?? e.examType,
    Total: e.total,
    Aprobados: e.passed,
    tasa: e.passRate,
  }));

  const examCount = byExamType.length;

  const tooltipStyle = isDarkMode
    ? {
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        color: '#e2e8f0',
      }
    : { backgroundColor: '#fff', border: '1px solid #e2e8f0' };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/empresa/eventos"
            className={`text-sm mb-2 inline-block ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ← Eventos y categorías
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1
                className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {group.name}
              </h1>
              {group.description && (
                <p
                  className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {group.description}
                </p>
              )}
            </div>
            <span
              className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              {processes.length}{' '}
              {processes.length === 1 ? 'proceso' : 'procesos'}
            </span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total candidatos"
            value={totals.candidates}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Tasa aprobación"
            value={`${totals.passRate}%`}
            sub={`${totals.passed} aprobados`}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Puntaje promedio"
            value={totals.avgScore !== null ? `${totals.avgScore}%` : '—'}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Tipos de examen"
            value={examCount}
            isDarkMode={isDarkMode}
          />
        </div>

        {totals.candidates === 0 ? (
          <div
            className={`text-center py-16 rounded-xl border-2 border-dashed ${
              isDarkMode
                ? 'border-slate-700 text-slate-500'
                : 'border-gray-200 text-gray-400'
            }`}
          >
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium mb-1">Sin candidatos todavía</p>
            <p className="text-sm">
              Cuando los candidatos rindan exámenes de los procesos de este
              evento, aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 10 participants */}
              <div className={`${cardClass} p-5`}>
                <p className={headingClass}>Top 10 participantes</p>
                {topChartData.length === 0 ? (
                  <p
                    className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    Sin datos
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      layout="vertical"
                      data={topChartData}
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{
                          fontSize: 11,
                          fill: isDarkMode ? '#94a3b8' : '#6b7280',
                        }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{
                          fontSize: 11,
                          fill: isDarkMode ? '#94a3b8' : '#6b7280',
                        }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`${value}%`, 'Puntaje']}
                        labelFormatter={(_, payload) => {
                          const d = payload?.[0]?.payload;
                          if (!d) return '';
                          return `${d.fullName} — ${d.examType} (${d.processCode})`;
                        }}
                      />
                      <Bar
                        dataKey="puntaje"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={20}
                      >
                        {topChartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.passed ? '#22c55e' : '#ef4444'}
                            fillOpacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <p
                  className={`text-xs mt-2 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}
                >
                  🟢 Aprobado · 🔴 No aprobado
                </p>
              </div>

              {/* By exam type */}
              <div className={`${cardClass} p-5`}>
                <p className={headingClass}>Por tipo de examen</p>
                {examChartData.length === 0 ? (
                  <p
                    className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    Sin datos
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={examChartData}
                      margin={{ top: 0, right: 8, left: -16, bottom: 40 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fill: isDarkMode ? '#94a3b8' : '#6b7280',
                        }}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: isDarkMode ? '#94a3b8' : '#6b7280',
                        }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number, name: string) => [
                          value,
                          name,
                        ]}
                        labelFormatter={(label, payload) => {
                          const tasa = payload?.[0]?.payload?.tasa;
                          return `${label}${tasa !== undefined ? ` — ${tasa}% aprob.` : ''}`;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Bar
                        dataKey="Total"
                        fill={isDarkMode ? '#6366f1' : '#818cf8'}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="Aprobados"
                        fill={isDarkMode ? '#22c55e' : '#4ade80'}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Processes table */}
            <div className={`${cardClass} overflow-hidden`}>
              <div className="px-5 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}">
                <p
                  className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Procesos del evento
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`text-xs font-medium uppercase tracking-wider ${
                        isDarkMode
                          ? 'bg-slate-800/50 text-slate-400'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      <th className="px-5 py-3 text-left">Proceso</th>
                      <th className="px-4 py-3 text-left">Código</th>
                      <th className="px-4 py-3 text-center">Candidatos</th>
                      <th className="px-4 py-3 text-center">Aprobados</th>
                      <th className="px-4 py-3 text-center">Tasa</th>
                      <th className="px-4 py-3 text-center">Top score</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {processes.map((p) => {
                      const eff = getEffectiveStatus(p);
                      const badge = STATUS_BADGE[eff];
                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            isDarkMode
                              ? 'hover:bg-slate-800/30'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-5 py-3">
                            <Link
                              href={`/empresa/procesos/${p.id}`}
                              className={`font-medium hover:underline ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                              {p.position_name}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-mono text-xs px-2 py-0.5 rounded ${
                                isDarkMode
                                  ? 'bg-slate-700 text-slate-300'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {p.code}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 text-center ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                          >
                            {p.candidateCount}
                          </td>
                          <td
                            className={`px-4 py-3 text-center ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                          >
                            {p.passedCount}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-semibold ${
                                p.passRate >= 60
                                  ? isDarkMode
                                    ? 'text-green-400'
                                    : 'text-green-600'
                                  : p.candidateCount === 0
                                    ? isDarkMode
                                      ? 'text-slate-500'
                                      : 'text-gray-400'
                                    : isDarkMode
                                      ? 'text-red-400'
                                      : 'text-red-600'
                              }`}
                            >
                              {p.candidateCount === 0 ? '—' : `${p.passRate}%`}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 text-center ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                          >
                            {p.topScore !== null ? `${p.topScore}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                isDarkMode ? badge.dark : badge.light
                              }`}
                            >
                              {badge.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
