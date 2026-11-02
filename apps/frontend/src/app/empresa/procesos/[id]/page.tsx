'use client';

import Link from 'next/link';
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { reopenProcessAction } from '@/actions/employer';
import { reviewHrefFor } from '@/lib/exam-review-routes';
import {
  buildAttemptNumbers,
  dedupeMirroredAttempts,
  groupResultsByCandidate,
  type CandidateGroup,
} from '@/lib/empresa/candidateResults';

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
  repository_url: string | null;
};

type ExamResult = {
  id: string;
  participant_name: string | null;
  participant_email: string | null;
  user_id?: string | null;
  exam_type: string;
  score: number;
  percentage: number;
  passed: boolean;
  time_spent: number;
  created_at: string;
  review_status?: string | null;
  metadata?: unknown;
};

// eslint-disable-next-line no-unused-vars
type OnProspectAdded = (prospect: Prospect) => void;

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
  expired: {
    text: 'Vencido',
    color: 'bg-amber-100 text-amber-700',
    darkColor: 'bg-amber-900/40 text-amber-300',
  },
};

function getEffectiveStatus(process: HiringProcess): string {
  if (
    process.status === 'active' &&
    process.expires_at &&
    new Date(process.expires_at) < new Date()
  ) {
    return 'expired';
  }
  return process.status;
}

function getResultDisplayName(result: ExamResult) {
  return result.participant_name || result.participant_email || '—';
}

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
  'git-practico': 'Git — Prueba práctica',
  'playwright-practico': 'Playwright — Prueba práctica',
  performance: 'Performance',
  'test-app': 'Test App — Bug Hunt',
  'api-testing-fundamentals': 'API Testing Fundamentals',
  'api-banking': 'API Testing Challenge',
  'database-fundamentals': 'Bases de Datos — Fundamentos',
  'database-practice': 'Bases de Datos — Práctica SQL',
  'infrastructure-fundamentals': 'Infraestructura — Fundamentos',
  'api-developer-fundamentals': 'APIs para Desarrolladores — Fundamentos',
};

const SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referido', label: 'Referido' },
  { value: 'bolsa', label: 'Bolsa de trabajo' },
  { value: 'otro', label: 'Otro' },
];

const SOURCE_LABELS = new Map(SOURCES.map((s) => [s.value, s.label]));

/** Rows rendered per step in the table/ranking; "Mostrar más" adds more. */
const RESULTS_PAGE_SIZE = 50;

const resultDateFormatter = new Intl.DateTimeFormat('es-PY');

const mins = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

/**
 * Per-row values derived once when results load, instead of on every render
 * of every row (review link lookup ran twice per row, date formatting, label
 * lookups, lowercase copies for the search filter).
 */
type ResultRow = ExamResult & {
  displayName: string;
  examLabel: string;
  reviewHref: string | null;
  dateLabel: string;
  timeLabel: string;
  searchText: string;
  /** "Intento 2 de 3" cuando el candidato repitió ese examen. */
  attemptLabel: string | null;
};

function toResultRow(
  r: ExamResult,
  attempt?: { index: number; total: number }
): ResultRow {
  return {
    ...r,
    displayName: getResultDisplayName(r),
    examLabel: EXAM_LABELS[r.exam_type] ?? r.exam_type,
    reviewHref: reviewHrefFor(r.exam_type, r.id),
    dateLabel: resultDateFormatter.format(new Date(r.created_at)),
    timeLabel: mins(r.time_spent),
    searchText:
      `${r.participant_name ?? ''}\n${r.participant_email ?? ''}`.toLowerCase(),
    attemptLabel:
      attempt && attempt.total > 1
        ? `Intento ${attempt.index} de ${attempt.total}`
        : null,
  };
}

function reviewBadgeClass(
  reviewStatus: string | null | undefined,
  dark: boolean
) {
  if (reviewStatus === 'reviewed') {
    return dark
      ? 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60'
      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
  }
  return dark
    ? 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/60'
    : 'bg-amber-100 text-amber-700 hover:bg-amber-200';
}

// ─── Result rows (memoized) ───────────────────────────────────────────────────

const ResultTableRow = memo(function ResultTableRow({
  r,
  striped,
  isDarkMode,
}: {
  r: ResultRow;
  striped: boolean;
  isDarkMode: boolean;
}) {
  return (
    <tr
      className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} ${
        !striped
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
          {r.displayName}
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
          {r.examLabel}
        </span>
        {r.attemptLabel && (
          <div
            className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
          >
            {r.attemptLabel}
          </div>
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
        {r.timeLabel}
      </td>
      <td
        className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
      >
        {r.dateLabel}
      </td>
      <td className="px-5 py-3">
        {r.reviewHref && (
          <Link
            href={r.reviewHref}
            prefetch={false}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${reviewBadgeClass(r.review_status, isDarkMode)}`}
          >
            {r.review_status === 'reviewed' ? '✅ Revisado' : '⏳ Revisar'}
          </Link>
        )}
      </td>
    </tr>
  );
});

// ─── Candidate view (grouped) ────────────────────────────────────────────────

function scoreColor(passed: boolean) {
  return passed ? 'text-green-500' : 'text-red-500';
}

const CandidateRow = memo(function CandidateRow({
  candidate,
  position,
  requiredExamTypes,
  expanded,
  onToggle,
  isDarkMode,
}: {
  candidate: CandidateGroup<ResultRow>;
  position: number | null;
  requiredExamTypes: string[];
  expanded: boolean;
  // eslint-disable-next-line no-unused-vars
  onToggle: (key: string) => void;
  isDarkMode: boolean;
}) {
  const muted = isDarkMode ? 'text-slate-400' : 'text-gray-500';
  const faint = isDarkMode ? 'text-slate-500' : 'text-gray-400';
  const requiredCount = requiredExamTypes.length || candidate.exams.length;
  const needsReview = candidate.exams.some((e) =>
    e.attempts.some((a) => a.reviewHref && a.review_status !== 'reviewed')
  );

  return (
    <div
      className={`rounded-xl border ${isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-white'}`}
    >
      <button
        type="button"
        onClick={() => onToggle(candidate.key)}
        aria-expanded={expanded}
        className="w-full text-left p-4 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-3 min-w-0 sm:w-64 shrink-0">
          {position !== null && (
            <span
              className={`text-sm font-bold w-6 text-center shrink-0 ${faint}`}
            >
              {position === 0
                ? '🥇'
                : position === 1
                  ? '🥈'
                  : position === 2
                    ? '🥉'
                    : position + 1}
            </span>
          )}
          <div className="min-w-0">
            <p
              className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {candidate.name}
            </p>
            {candidate.email && candidate.email !== candidate.name && (
              <p className={`text-xs truncate ${muted}`}>{candidate.email}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 flex-1">
          {candidate.exams.map((exam) => (
            <span
              key={exam.examType}
              title={`${EXAM_LABELS[exam.examType] ?? exam.examType} — mejor intento ${exam.best.percentage}%`}
              className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                exam.best.passed
                  ? isDarkMode
                    ? 'bg-green-900/30 text-green-200'
                    : 'bg-green-50 text-green-800'
                  : isDarkMode
                    ? 'bg-red-900/30 text-red-200'
                    : 'bg-red-50 text-red-800'
              }`}
            >
              <span className="truncate max-w-[11rem]">
                {EXAM_LABELS[exam.examType] ?? exam.examType}
              </span>
              <span className="font-bold">{exam.best.percentage}%</span>
              {exam.attempts.length > 1 && (
                <span className="opacity-70">×{exam.attempts.length}</span>
              )}
            </span>
          ))}
          {candidate.pendingExamTypes.map((type) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-dashed ${isDarkMode ? 'border-slate-600 text-slate-500' : 'border-gray-300 text-gray-400'}`}
            >
              {EXAM_LABELS[type] ?? type} · pendiente
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 shrink-0 sm:justify-end">
          {needsReview && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDarkMode ? 'bg-amber-900/40 text-amber-200' : 'bg-amber-100 text-amber-700'}`}
            >
              ⏳ Revisar
            </span>
          )}
          <div className="text-right">
            <p
              className={`text-lg font-bold leading-none ${scoreColor(candidate.examsPassed === requiredCount && candidate.pendingExamTypes.length === 0)}`}
            >
              {candidate.processScore}%
            </p>
            <p className={`text-[11px] mt-1 ${faint}`}>
              {candidate.examsPassed}/{requiredCount} aprobados
            </p>
          </div>
          <span className={`text-xs ${faint}`}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div
          className={`border-t px-4 py-3 space-y-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}
        >
          {candidate.exams.map((exam) => (
            <div key={exam.examType}>
              <p
                className={`text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                {EXAM_LABELS[exam.examType] ?? exam.examType}
                <span className={`font-normal ml-2 ${faint}`}>
                  {exam.attempts.length === 1
                    ? '1 intento'
                    : `${exam.attempts.length} intentos — cuenta el mejor`}
                </span>
              </p>
              <ul className="space-y-1">
                {exam.attempts.map((a, i) => (
                  <li
                    key={a.id}
                    className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs rounded-lg px-3 py-1.5 ${
                      a.id === exam.best.id
                        ? isDarkMode
                          ? 'bg-indigo-900/30'
                          : 'bg-indigo-50'
                        : isDarkMode
                          ? 'bg-slate-800/50'
                          : 'bg-gray-50'
                    }`}
                  >
                    <span className={`w-16 ${muted}`}>Intento {i + 1}</span>
                    <span className={`font-bold w-12 ${scoreColor(a.passed)}`}>
                      {a.percentage}%
                    </span>
                    <span className={`w-20 ${muted}`}>{a.dateLabel}</span>
                    <span className={`w-16 ${muted}`}>{a.timeLabel}</span>
                    {a.id === exam.best.id && exam.attempts.length > 1 && (
                      <span
                        className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}
                      >
                        ★ Mejor
                      </span>
                    )}
                    {a.reviewHref && (
                      <Link
                        href={a.reviewHref}
                        prefetch={false}
                        className={`ml-auto px-2 py-0.5 rounded-lg font-semibold transition-colors ${reviewBadgeClass(a.review_status, isDarkMode)}`}
                      >
                        {a.review_status === 'reviewed'
                          ? '✅ Revisado'
                          : '⏳ Revisar'}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

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
  onAdded: OnProspectAdded;
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

// ─── Reopen Process Modal ───────────────────────────────────────────────────────

function ReopenProcessModal({
  processId,
  isDarkMode,
  onClose,
  onReopened,
}: {
  processId: string;
  isDarkMode: boolean;
  onClose: () => void;
  onReopened: (expiresAt: string) => void;
}) {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  const [date, setDate] = useState(defaultDate.toISOString().slice(0, 10));
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
    if (!date) {
      setError('Elegí una fecha');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: err, data } = await reopenProcessAction(processId, date);

    setSaving(false);

    if (err || !data) {
      setError(err ?? 'Error al reabrir el proceso');
      return;
    }
    onReopened(data.expires_at ?? date);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full max-w-sm rounded-2xl shadow-2xl ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
        >
          <h2
            className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Reabrir proceso
          </h2>
          <button
            onClick={onClose}
            className={`text-lg leading-none ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p
            className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Elegí la nueva fecha límite. El proceso vuelve a estar{' '}
            <span className="font-medium">activo</span> y los candidatos podrán
            rendir hasta esa fecha.
          </p>
          <div>
            <label className={labelClass}>Nueva fecha de vencimiento</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className={inputClass}
              autoFocus
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
              {saving ? 'Reabriendo...' : 'Reabrir proceso'}
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
  const [results, setResults] = useState<ResultRow[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [activeTab, setActiveTab] = useState<'postulantes' | 'prospectos'>(
    'postulantes'
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>(
    'all'
  );
  const [viewMode, setViewMode] = useState<
    'candidatos' | 'intentos' | 'ranking'
  >('candidatos');
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(
    () => new Set()
  );
  const [visibleCount, setVisibleCount] = useState(RESULTS_PAGE_SIZE);
  // Typing in the search box stays responsive: the (possibly large) table
  // re-filters with the deferred value, at lower priority than the input.
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      // Auth check and process fetch run in parallel — they are independent
      // and each is a network round trip (RLS still scopes the process).
      const [
        {
          data: { user },
        },
        { data: proc, error },
      ] = await Promise.all([
        supabase.auth.getUser(),
        // Allow any active empresa member to view the process
        supabase.from('hiring_processes').select('*').eq('id', id).single(),
      ]);
      if (!user) {
        router.replace('/login');
        return;
      }

      if (error || !proc) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProcess(proc);

      const [{ data: res }, assessmentRes, { data: prsp }] = await Promise.all([
        supabase
          .from('exam_results')
          .select(
            'id, user_id, participant_name, participant_email, exam_type, score, percentage, passed, time_spent, created_at, review_status, metadata'
          )
          .eq('process_code', proc.code)
          .order('percentage', { ascending: false }),
        supabase
          .from('assessment_attempts')
          .select(
            'id, user_id, total_score, percentage, passed, started_at, submitted_at, created_at, assessments!inner(slug)'
          )
          .filter('metadata->>processCode', 'eq', proc.code)
          .eq('status', 'graded')
          .order('percentage', { ascending: false }),
        getProspectsForProcessAction(proc.id),
      ]);

      // profiles has no FK from assessment_attempts — fetch separately.
      // Some exam_results rows also have user_id but never got
      // participant_name/email filled in at submission time (e.g. OAuth
      // sign-ins), so include those in the same profile lookup.
      const examResultsRaw = (res ?? []) as ExamResult[];
      // Las pruebas técnicas también se espejan en exam_results: sin esto,
      // cada intento aparecía dos veces en la lista de postulantes.
      const attemptRows = dedupeMirroredAttempts(
        (assessmentRes.data ?? []) as any[],
        examResultsRaw
      );
      const userIds = [
        ...new Set([
          ...attemptRows.map((r: any) => r.user_id).filter(Boolean),
          ...examResultsRaw
            .filter(
              (r) => !r.participant_name && !r.participant_email && r.user_id
            )
            .map((r) => r.user_id as string),
        ]),
      ];
      const profileMap: Record<
        string,
        { display_name: string | null; email: string | null }
      > = {};
      if (userIds.length > 0) {
        const { data: profileRows } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);
        (profileRows ?? []).forEach((p: any) => {
          profileMap[p.id] = p;
        });
      }

      const examResults = examResultsRaw.map((r) => ({
        ...r,
        participant_name:
          r.participant_name ??
          r.participant_email ??
          (r.user_id ? profileMap[r.user_id]?.display_name : null) ??
          (r.user_id ? profileMap[r.user_id]?.email : null),
        participant_email:
          r.participant_email ??
          (r.user_id ? profileMap[r.user_id]?.email : null) ??
          null,
      }));

      const mappedAttempts: ExamResult[] = attemptRows.map((r: any) => ({
        id: r.id,
        user_id: r.user_id ?? null,
        participant_name:
          profileMap[r.user_id]?.display_name ??
          profileMap[r.user_id]?.email ??
          null,
        participant_email: profileMap[r.user_id]?.email ?? null,
        exam_type: r.assessments?.slug ?? 'unknown',
        score: r.total_score ?? 0,
        percentage: r.percentage ?? 0,
        passed: r.passed ?? false,
        time_spent:
          r.submitted_at && r.started_at
            ? Math.floor(
                (new Date(r.submitted_at).getTime() -
                  new Date(r.started_at).getTime()) /
                  1000
              )
            : 0,
        created_at: r.submitted_at ?? r.created_at,
      }));

      const allResults = [...examResults, ...mappedAttempts];
      const attemptNumbers = buildAttemptNumbers(allResults);
      setResults(
        allResults.map((r) => toResultRow(r, attemptNumbers.get(r.id)))
      );
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

  const rendidosEmails = useMemo(
    () =>
      new Set(
        results.map((r) => r.participant_email?.toLowerCase()).filter(Boolean)
      ),
    [results]
  );

  const filteredResults = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return results.filter((r) => {
      const matchSearch = !q || r.searchText.includes(q);
      const matchExam = filterExam === 'all' || r.exam_type === filterExam;
      const matchPassed =
        filterPassed === 'all' ||
        (filterPassed === 'passed' && r.passed) ||
        (filterPassed === 'failed' && !r.passed);
      return matchSearch && matchExam && matchPassed;
    });
  }, [results, deferredSearch, filterExam, filterPassed]);

  const requiredExamTypes = useMemo(() => process?.exam_types ?? [], [process]);

  // Una fila por persona: los postulantes se cuentan por candidato, no por
  // intento (antes un candidato con 3 exámenes figuraba 3 veces).
  const candidateGroups = useMemo(
    () => groupResultsByCandidate(results, requiredExamTypes),
    [results, requiredExamTypes]
  );

  const filteredCandidates = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return candidateGroups.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false);
      if (!matchSearch) return false;
      const relevant =
        filterExam === 'all'
          ? c.exams
          : c.exams.filter((e) => e.examType === filterExam);
      if (relevant.length === 0) return false;
      if (filterPassed === 'passed')
        return relevant.every((e) => e.best.passed);
      if (filterPassed === 'failed')
        return relevant.some((e) => !e.best.passed);
      return true;
    });
  }, [candidateGroups, deferredSearch, filterExam, filterPassed]);

  // "Por candidato" va alfabético para ubicar a alguien; "Ranking" por puntaje.
  const visibleCandidates = useMemo(
    () =>
      viewMode === 'candidatos'
        ? [...filteredCandidates].sort((a, b) =>
            a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
          )
        : filteredCandidates,
    [filteredCandidates, viewMode]
  );

  const toggleCandidate = useCallback((key: string) => {
    setExpandedCandidates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Back to the first page whenever the filters or the view change.
  useEffect(() => {
    setVisibleCount(RESULTS_PAGE_SIZE);
  }, [deferredSearch, filterExam, filterPassed, viewMode]);

  // Tasa sobre el mejor intento de cada candidato en cada examen: repetir un
  // examen ya no infla ni castiga la tasa.
  const passRate = useMemo(() => {
    const bests = candidateGroups.flatMap((c) => c.exams.map((e) => e.best));
    return bests.length
      ? Math.round((bests.filter((b) => b.passed).length / bests.length) * 100)
      : null;
  }, [candidateGroups]);

  const activeListLength =
    viewMode === 'intentos'
      ? filteredResults.length
      : filteredCandidates.length;
  const remainingResults = Math.max(0, activeListLength - visibleCount);

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

  const effectiveStatus = getEffectiveStatus(process!);
  const statusInfo = STATUS_LABELS[effectiveStatus] ?? STATUS_LABELS.draft;
  const isExpired = effectiveStatus === 'expired';

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
            {process!.repository_url && (
              <a
                href={process!.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm mt-1 inline-flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'}`}
              >
                🔗 {process!.repository_url.replace('https://github.com/', '')}
              </a>
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
            {process!.status !== 'draft' &&
              (process!.status === 'active' && !isExpired ? (
                <button
                  onClick={toggleStatus}
                  disabled={updatingStatus}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
                >
                  {updatingStatus ? '...' : 'Cerrar proceso'}
                </button>
              ) : (
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Reabrir proceso
                </button>
              ))}
          </div>
        </div>

        {/* Expired banner */}
        {isExpired && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
              isDarkMode
                ? 'bg-amber-900/20 border-amber-700/50 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span>⚠️</span>
            <span>
              Este proceso venció el{' '}
              <strong>
                {new Date(process!.expires_at!).toLocaleDateString('es-PY', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>{' '}
              — los candidatos ya no pueden rendir.
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Exámenes',
              value: process!.exam_types
                .map((e) => EXAM_LABELS[e] ?? e)
                .join(', '),
            },
            {
              label: 'Candidatos',
              value: `${candidateGroups.length} · ${results.length} intentos`,
            },
            { label: 'Prospectos', value: prospects.length.toString() },
            {
              label: 'Aprobación (mejor intento)',
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
                  ? `Postulantes (${candidateGroups.length})`
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
                    {(['candidatos', 'ranking', 'intentos'] as const).map(
                      (mode) => (
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
                          {mode === 'candidatos'
                            ? '👤 Por candidato'
                            : mode === 'ranking'
                              ? '📊 Ranking'
                              : '☰ Intentos'}
                        </button>
                      )
                    )}
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
              ) : activeListLength === 0 ? (
                <div
                  className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  <p className="text-sm">
                    Sin resultados para los filtros aplicados
                  </p>
                </div>
              ) : viewMode !== 'intentos' ? (
                /* ── Candidate / ranking view ── */
                <div className="p-5 space-y-3">
                  <p
                    className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    <span className="font-semibold uppercase tracking-wide">
                      {filteredCandidates.length} candidatos
                    </span>{' '}
                    — puntaje del proceso = promedio del mejor intento en cada
                    examen
                    {requiredExamTypes.length > 0
                      ? ' (los pendientes cuentan 0)'
                      : ''}
                    . Hacé click en un candidato para ver todos sus intentos.
                  </p>
                  {visibleCandidates.slice(0, visibleCount).map((c, i) => (
                    <CandidateRow
                      key={c.key}
                      candidate={c}
                      position={viewMode === 'ranking' ? i : null}
                      requiredExamTypes={requiredExamTypes}
                      expanded={expandedCandidates.has(c.key)}
                      onToggle={toggleCandidate}
                      isDarkMode={isDarkMode}
                    />
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
                      {filteredResults.slice(0, visibleCount).map((r, i) => (
                        <ResultTableRow
                          key={r.id}
                          r={r}
                          striped={i % 2 !== 0}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {results.length > 0 && remainingResults > 0 && (
                <div
                  className={`flex items-center justify-center gap-3 px-5 py-4 border-t text-sm ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-100 text-gray-500'}`}
                >
                  <span className="text-xs">
                    Mostrando {visibleCount} de {activeListLength}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((c) => c + RESULTS_PAGE_SIZE)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isDarkMode
                        ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Mostrar {Math.min(RESULTS_PAGE_SIZE, remainingResults)} más
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(activeListLength)}
                    className={`text-xs font-medium ${isDarkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'}`}
                  >
                    Mostrar todos
                  </button>
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
                              {(p.source && SOURCE_LABELS.get(p.source)) ??
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

      {showReopenModal && (
        <ReopenProcessModal
          processId={process!.id}
          isDarkMode={isDarkMode}
          onClose={() => setShowReopenModal(false)}
          onReopened={(expiresAt) =>
            setProcess((p) =>
              p ? { ...p, status: 'active', expires_at: expiresAt } : p
            )
          }
        />
      )}
    </div>
  );
}
