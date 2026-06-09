'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import {
  getProspectsForProcessAction,
  addProspectAction,
  updateProspectStatusAction,
  deleteProspectAction,
  getCvSignedUrlAction,
  type Prospect,
  type ProspectStatus,
} from '@/actions/prospects';

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

const PROSPECT_STATUS_CONFIG: Record<
  ProspectStatus,
  { label: string; color: string; darkColor: string }
> = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-gray-100 text-gray-600',
    darkColor: 'bg-slate-700 text-slate-400',
  },
  invitado: {
    label: 'Invitado',
    color: 'bg-blue-100 text-blue-700',
    darkColor: 'bg-blue-900/40 text-blue-300',
  },
  rendido: {
    label: 'Rindió',
    color: 'bg-purple-100 text-purple-700',
    darkColor: 'bg-purple-900/40 text-purple-300',
  },
  descartado: {
    label: 'Descartado',
    color: 'bg-red-100 text-red-600',
    darkColor: 'bg-red-900/40 text-red-300',
  },
};

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL',
  git: 'Git',
  performance: 'Performance',
  'api-testing-fundamentals': 'API Testing Fundamentals',
};

const SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referido', label: 'Referido' },
  { value: 'bolsa', label: 'Bolsa de trabajo' },
  { value: 'otro', label: 'Otro' },
];

// ─── Add Prospect Modal ────────────────────────────────────────────────────────

function AddProspectModal({
  processId,
  isDarkMode,
  onClose,
  onAdded,
}: {
  processId: string;
  isDarkMode: boolean;
  onClose: () => void;
  onAdded: (_p: Prospect) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('linkedin');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const labelClass = `block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 5 * 1024 * 1024) {
      setError('CV no puede superar 5 MB');
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    let cv_base64: string | undefined;
    let cv_filename: string | undefined;

    if (file) {
      const buf = await file.arrayBuffer();
      cv_base64 = Buffer.from(buf).toString('base64');
      cv_filename = file.name;
    }

    const { data, error: err } = await addProspectAction({
      process_id: processId,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      source,
      notes: notes.trim() || undefined,
      cv_base64,
      cv_filename,
    });

    setSaving(false);

    if (err || !data) {
      setError(err ?? 'Error al guardar');
      return;
    }
    onAdded(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
        >
          <h2
            className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Agregar prospecto
          </h2>
          <button
            onClick={onClose}
            className={`text-lg leading-none ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María García"
              className={inputClass}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@ejemplo.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+595 9xx xxx xxx"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Fuente</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={inputClass}
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>CV (PDF, máx 5 MB)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-3 text-sm text-center transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-400 hover:border-indigo-500'
                  : 'border-gray-300 text-gray-400 hover:border-indigo-400'
              }`}
            >
              {file ? (
                <span
                  className={isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}
                >
                  📄 {file.name}
                </span>
              ) : (
                'Hacé click para subir el CV'
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Observaciones, perfil, referencias..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar prospecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProcesoDetailPage() {
  const { isDarkMode } = useTheme();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [process, setProcess] = useState<HiringProcess | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [activeTab, setActiveTab] = useState<'postulantes' | 'prospectos'>(
    'postulantes'
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>(
    'all'
  );
  const [viewMode, setViewMode] = useState<'tabla' | 'ranking'>('tabla');

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

      // Allow any active empresa member to view the process
      const { data: proc, error } = await supabase
        .from('hiring_processes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !proc) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProcess(proc);

      const [{ data: res }, { data: prsp }] = await Promise.all([
        supabase
          .from('exam_results')
          .select(
            'id, participant_name, participant_email, exam_type, score, percentage, passed, time_spent, created_at'
          )
          .eq('process_code', proc.code)
          .order('percentage', { ascending: false }),
        getProspectsForProcessAction(proc.id),
      ]);

      setResults(res ?? []);
      setProspects(prsp ?? []);
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

  const openCv = async (cv_url: string) => {
    const { url, error } = await getCvSignedUrlAction(cv_url);
    if (error || !url) {
      alert('No se pudo obtener el CV');
      return;
    }
    window.open(url, '_blank');
  };

  const handleStatusChange = async (
    prospect_id: string,
    status: ProspectStatus
  ) => {
    const { error } = await updateProspectStatusAction(prospect_id, status);
    if (!error) {
      setProspects((prev) =>
        prev.map((p) => (p.id === prospect_id ? { ...p, status } : p))
      );
    }
  };

  const handleDelete = async (prospect_id: string) => {
    if (!confirm('¿Eliminar este prospecto?')) return;
    const { error } = await deleteProspectAction(prospect_id);
    if (!error)
      setProspects((prev) => prev.filter((p) => p.id !== prospect_id));
  };

  const rendidosEmails = new Set(
    results.map((r) => r.participant_email?.toLowerCase()).filter(Boolean)
  );

  const filteredResults = results.filter((r) => {
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
            <Link
              href={`/empresa/invitaciones`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors border-indigo-400 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
            >
              📧 Invitar candidato
            </Link>
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Exámenes',
              value: process!.exam_types
                .map((e) => EXAM_LABELS[e] ?? e)
                .join(', '),
            },
            { label: 'Postulantes', value: results.length.toString() },
            { label: 'Prospectos', value: prospects.length.toString() },
            {
              label: 'Tasa aprobación',
              value: passRate != null ? `${passRate}%` : '—',
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

        {/* Tabs */}
        <div className={`rounded-xl border ${card}`}>
          <div
            className={`flex border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
          >
            {(['postulantes', 'prospectos'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-medium transition-colors capitalize border-b-2 -mb-px ${
                  activeTab === tab
                    ? `border-indigo-500 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`
                    : `border-transparent ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                {tab === 'postulantes'
                  ? `Postulantes (${results.length})`
                  : `Prospectos (${prospects.length})`}
              </button>
            ))}
          </div>

          {/* ── Tab: Postulantes ── */}
          {activeTab === 'postulantes' && (
            <>
              <div className="p-5 border-b border-inherit space-y-3">
                <div className="flex gap-3 flex-wrap items-center">
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
                  {/* View mode toggle */}
                  <div
                    className={`flex rounded-lg border overflow-hidden ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}
                  >
                    {(['tabla', 'ranking'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-2 text-xs font-medium transition-colors ${
                          viewMode === mode
                            ? 'bg-indigo-600 text-white'
                            : isDarkMode
                              ? 'text-slate-300 hover:bg-slate-700'
                              : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {mode === 'tabla' ? '☰ Tabla' : '📊 Ranking'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {results.length === 0 ? (
                <div
                  className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  <p className="text-3xl mb-2">👥</p>
                  <p className="font-medium">Sin postulantes todavía</p>
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
              ) : filteredResults.length === 0 ? (
                <div
                  className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  <p className="text-sm">
                    Sin resultados para los filtros aplicados
                  </p>
                </div>
              ) : viewMode === 'ranking' ? (
                /* ── Ranking view ── */
                <div className="p-5 space-y-3">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    Ranking por puntaje — {filteredResults.length} candidatos
                  </p>
                  {[...filteredResults]
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((r, i) => (
                      <div
                        key={r.id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}
                      >
                        <span
                          className={`text-sm font-bold w-6 text-center shrink-0 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                        >
                          {i === 0
                            ? '🥇'
                            : i === 1
                              ? '🥈'
                              : i === 2
                                ? '🥉'
                                : `${i + 1}`}
                        </span>
                        <div className="min-w-0 w-36 shrink-0">
                          <p
                            className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {r.participant_name || '—'}
                          </p>
                          <p
                            className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                          >
                            {EXAM_LABELS[r.exam_type] ?? r.exam_type}
                          </p>
                        </div>
                        <div className="flex-1">
                          <div
                            className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${r.passed ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${r.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold w-12 text-right shrink-0 ${r.passed ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {r.percentage}%
                        </span>
                        <span
                          className={`text-xs w-14 text-right shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                        >
                          {mins(r.time_spent)}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                /* ── Table view ── */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={
                          isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'
                        }
                      >
                        {[
                          'Candidato',
                          'Examen',
                          'Puntaje',
                          'Tiempo',
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
                      {filteredResults.map((r, i) => (
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
            </>
          )}

          {/* ── Tab: Prospectos ── */}
          {activeTab === 'prospectos' && (
            <>
              <div
                className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
              >
                <p
                  className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Candidatos que ya tenés identificados. Si coincide el email
                  con un postulante, se marca como{' '}
                  <span className="font-medium">Ya rindió</span>.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="ml-4 shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  + Agregar prospecto
                </button>
              </div>

              {prospects.length === 0 ? (
                <div
                  className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="font-medium">Sin prospectos cargados</p>
                  <p className="text-sm mt-1">
                    Agregá candidatos que ya tenés en mente para compararlos con
                    los postulantes
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={
                          isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'
                        }
                      >
                        {[
                          'Prospecto',
                          'Fuente',
                          'Estado',
                          'CV',
                          'Notas',
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
                      {prospects.map((p, i) => {
                        const yaRindio = p.email
                          ? rendidosEmails.has(p.email.toLowerCase())
                          : false;
                        const sc =
                          PROSPECT_STATUS_CONFIG[p.status] ??
                          PROSPECT_STATUS_CONFIG.pendiente;
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
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div>
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
                                      className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                                    >
                                      {p.phone}
                                    </div>
                                  )}
                                </div>
                                {yaRindio && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 shrink-0">
                                    Ya rindió ✓
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className={`px-5 py-3 text-xs capitalize ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {SOURCES.find((s) => s.value === p.source)
                                ?.label ??
                                p.source ??
                                '—'}
                            </td>
                            <td className="px-5 py-3">
                              <select
                                value={p.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    p.id,
                                    e.target.value as ProspectStatus
                                  )
                                }
                                className={`text-xs rounded-full px-2 py-0.5 font-medium border-0 cursor-pointer focus:ring-1 focus:ring-indigo-500 ${
                                  isDarkMode
                                    ? sc.darkColor + ' bg-transparent'
                                    : sc.color
                                }`}
                              >
                                {Object.entries(PROSPECT_STATUS_CONFIG).map(
                                  ([val, cfg]) => (
                                    <option key={val} value={val}>
                                      {cfg.label}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                            <td className="px-5 py-3">
                              {p.cv_url ? (
                                <button
                                  onClick={() => openCv(p.cv_url!)}
                                  className="text-xs text-indigo-400 hover:underline"
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
                            <td
                              className={`px-5 py-3 text-xs max-w-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {p.notes || '—'}
                            </td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => handleDelete(p.id)}
                                className={`text-xs ${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-gray-300 hover:text-red-500'} transition-colors`}
                                title="Eliminar prospecto"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <AddProspectModal
          processId={process!.id}
          isDarkMode={isDarkMode}
          onClose={() => setShowModal(false)}
          onAdded={(p) => setProspects((prev) => [p, ...prev])}
        />
      )}
    </div>
  );
}
