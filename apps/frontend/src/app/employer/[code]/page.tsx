'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getProcessCandidatesAction,
  type HiringProcess,
  type ProcessCandidate,
} from '@/actions/employer';

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB',
  git: 'Git',
  performance: 'Rendimiento',
  'api-testing-fundamentals': 'API Testing Fundamentals',
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProcessDashboardPage() {
  const { code } = useParams<{ code: string }>();
  const { user, isLoading } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [process, setProcess] = useState<HiringProcess | null>(null);
  const [candidates, setCandidates] = useState<ProcessCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || !code) return;
    getProcessCandidatesAction(code).then(
      ({ data, process: proc, error: err }) => {
        if (err || !proc) {
          setError(err ?? 'Proceso no encontrado');
          setLoading(false);
          return;
        }
        setProcess(proc as HiringProcess);
        setCandidates((data ?? []) as ProcessCandidate[]);
        setLoading(false);
      }
    );
  }, [user, code]);

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const base = isDarkMode
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';
  const card = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';
  const th = isDarkMode
    ? 'text-gray-400 border-gray-700'
    : 'text-gray-500 border-gray-200';
  const td = isDarkMode ? 'border-gray-700' : 'border-gray-100';

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen ${base} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${base} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => router.push('/employer')}
            className="mt-4 text-sm text-indigo-500 hover:underline"
          >
            Volver a procesos
          </button>
        </div>
      </div>
    );
  }

  const passed = candidates.filter((c) => c.passed).length;

  return (
    <div className={`min-h-screen ${base} py-10 px-4`}>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push('/employer')}
          className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
        >
          ← Volver a procesos
        </button>

        <div className={`${card} border rounded-xl p-5 mb-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">{process?.position_name}</h1>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {process?.company_name}
              </p>
              {process?.description && (
                <p
                  className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {process.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Código:
              </span>
              <code
                className={`text-sm font-mono px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                {code}
              </code>
              <button
                onClick={copyCode}
                className={`text-xs px-2 py-1.5 rounded-lg border transition-colors ${
                  copied
                    ? 'border-green-400 text-green-600'
                    : isDarkMode
                      ? 'border-gray-600 text-gray-400 hover:text-white'
                      : 'border-gray-300 text-gray-500 hover:text-gray-900'
                }`}
              >
                {copied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="flex gap-6 mt-5 pt-4 border-t border-gray-700/30">
            <div className="text-center">
              <p className="text-2xl font-bold">{candidates.length}</p>
              <p
                className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Candidatos
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{passed}</p>
              <p
                className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Aprobaron
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {candidates.length - passed}
              </p>
              <p
                className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                No aprobaron
              </p>
            </div>
            {candidates.length > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-400">
                  {Math.round(
                    candidates.reduce((acc, c) => acc + c.percentage, 0) /
                      candidates.length
                  )}
                  %
                </p>
                <p
                  className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Promedio
                </p>
              </div>
            )}
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className={`${card} border rounded-xl p-12 text-center`}>
            <p
              className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Todavía no hay candidatos
            </p>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Compartí el código <strong>{code}</strong> con los candidatos para
              que rindan el examen
            </p>
          </div>
        ) : (
          <div className={`${card} border rounded-xl overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`border-b ${th} text-xs uppercase tracking-wider`}
                >
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Candidato</th>
                  <th className="px-4 py-3 text-left">Examen</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-center">Resultado</th>
                  <th className="px-4 py-3 text-right">Tiempo</th>
                  <th className="px-4 py-3 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => (
                  <tr key={c.id} className={`border-b ${td} last:border-0`}>
                    <td
                      className={`px-4 py-3 font-mono font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {c.participant_name ?? 'Sin nombre'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {EXAM_LABELS[c.exam_type] ?? c.exam_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-bold ${c.percentage >= 70 ? 'text-green-500' : 'text-red-400'}`}
                      >
                        {c.percentage}%
                      </span>
                      <span
                        className={`text-xs ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        ({c.score}pts)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.passed
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {c.passed ? 'Aprobó' : 'No aprobó'}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {formatTime(c.time_spent)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
