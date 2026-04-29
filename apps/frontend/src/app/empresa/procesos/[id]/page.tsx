'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';

type HiringProcess = {
  id: string;
  code: string;
  position_name: string;
  description: string | null;
  status: 'draft' | 'active' | 'closed';
  exam_types: string[];
  expires_at: string | null;
  created_at: string;
  company_name: string;
};

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
};

const STATUS_LABELS: Record<
  string,
  { text: string; color: string; darkColor: string }
> = {
  draft: {
    text: 'Borrador',
    color: 'bg-gray-100 text-gray-600',
    darkColor: 'bg-slate-700 text-slate-400',
  },
  active: {
    text: 'Activo',
    color: 'bg-green-100 text-green-700',
    darkColor: 'bg-green-900/40 text-green-300',
  },
  closed: {
    text: 'Cerrado',
    color: 'bg-red-100 text-red-600',
    darkColor: 'bg-red-900/40 text-red-300',
  },
};

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL',
  git: 'Git',
  performance: 'Performance',
};

export default function ProcesoDetailPage() {
  const { isDarkMode } = useTheme();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [process, setProcess] = useState<HiringProcess | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>(
    'all'
  );

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: proc, error } = await supabase
        .from('hiring_processes')
        .select('*')
        .eq('id', id)
        .eq('created_by', user.id)
        .single();

      if (error || !proc) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProcess(proc);

      const { data: res } = await supabase
        .from('exam_results')
        .select(
          'id, participant_name, participant_email, exam_type, score, percentage, passed, time_spent, created_at'
        )
        .eq('process_code', proc.code)
        .order('percentage', { ascending: false });

      setResults(res ?? []);
      setLoading(false);
    };
    load();
  }, [id, router]);

  const toggleStatus = async () => {
    if (!process) return;
    const newStatus = process.status === 'active' ? 'closed' : 'active';
    setUpdatingStatus(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('hiring_processes')
      .update({ status: newStatus })
      .eq('id', process.id);
    if (!error) setProcess((p) => (p ? { ...p, status: newStatus } : p));
    setUpdatingStatus(false);
  };

  const copyCode = () => {
    if (!process) return;
    navigator.clipboard.writeText(process.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = results.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (r.participant_name?.toLowerCase().includes(q) ?? false) ||
      (r.participant_email?.toLowerCase().includes(q) ?? false);
    const matchExam = filterExam === 'all' || r.exam_type === filterExam;
    const matchPassed =
      filterPassed === 'all' ||
      (filterPassed === 'passed' && r.passed) ||
      (filterPassed === 'failed' && !r.passed);
    return matchSearch && matchExam && matchPassed;
  });

  const passRate = results.length
    ? Math.round(
        (results.filter((r) => r.passed).length / results.length) * 100
      )
    : null;

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
    : null;

  const mins = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const card = isDarkMode
    ? 'bg-dark-secondary border-slate-700'
    : 'bg-white border-gray-200';
  const labelClass = `text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`;
  const inputClass = `rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDarkMode ? 'bg-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`}
      >
        <p className="text-5xl">📂</p>
        <p className="text-xl font-semibold">Proceso no encontrado</p>
        <Link
          href="/empresa/procesos"
          className="text-indigo-400 hover:underline text-sm"
        >
          ← Volver a mis procesos
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[process!.status];

  return (
    <div
      className={`min-h-screen transition-colors ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link
              href="/empresa/procesos"
              className={`text-sm mb-2 inline-block ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ← Mis procesos
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {process!.position_name}
              </h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDarkMode ? statusInfo.darkColor : statusInfo.color}`}
              >
                {statusInfo.text}
              </span>
            </div>
            {process!.description && (
              <p
                className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                {process!.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyCode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {copied ? '✅ Copiado' : `📋 ${process!.code}`}
            </button>
            {process!.status !== 'draft' && (
              <button
                onClick={toggleStatus}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  process!.status === 'active'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {updatingStatus
                  ? '...'
                  : process!.status === 'active'
                    ? 'Cerrar proceso'
                    : 'Reactivar proceso'}
              </button>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Exámenes',
              value: process!.exam_types
                .map((e) => EXAM_LABELS[e] ?? e)
                .join(', '),
            },
            { label: 'Candidatos', value: results.length.toString() },
            {
              label: 'Tasa aprobación',
              value: passRate != null ? `${passRate}%` : '—',
            },
            {
              label: 'Puntaje promedio',
              value: avgScore != null ? `${avgScore}%` : '—',
            },
          ].map(({ label, value }) => (
            <div key={label} className={`rounded-xl border p-4 ${card}`}>
              <p className={labelClass}>{label}</p>
              <p
                className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Candidates */}
        <div className={`rounded-xl border ${card}`}>
          <div className="p-5 border-b border-inherit">
            <h2
              className={`font-semibold text-base mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Candidatos ({filtered.length})
            </h2>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} flex-1 min-w-48`}
              />
              <select
                value={filterExam}
                onChange={(e) => setFilterExam(e.target.value)}
                className={inputClass}
              >
                <option value="all">Todos los exámenes</option>
                {process!.exam_types.map((e) => (
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
                <option value="passed">Aprobados</option>
                <option value="failed">No aprobados</option>
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div
              className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              <p className="text-3xl mb-2">👥</p>
              <p className="font-medium">Sin candidatos todavía</p>
              <p className="text-sm mt-1">
                Compartí el código{' '}
                <button
                  onClick={copyCode}
                  className="text-indigo-400 hover:underline font-mono"
                >
                  {process!.code}
                </button>{' '}
                con tus candidatos
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              <p className="text-sm">
                Sin resultados para los filtros aplicados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'}>
                    {['Candidato', 'Examen', 'Puntaje', 'Tiempo', 'Fecha'].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
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
                        <div
                          className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          {r.participant_name || '—'}
                        </div>
                        {r.participant_email && (
                          <div
                            className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
