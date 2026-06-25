'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToolUsage } from '@/hooks/useToolUsage';
import { validateProcessCodeAction } from '@/actions/employer';

const STORAGE_KEY = 'git-practico-last';

interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
}

interface VerifyResponse {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  checks: CheckResult[];
}

interface ResolvedProcess {
  code: string;
  position_name: string;
  company_name: string;
  repository_url: string | null;
}

export default function GitPracticoClient() {
  const { isDarkMode } = useTheme();
  const { logUsage, logError } = useToolUsage('git-practico');

  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [process, setProcess] = useState<ResolvedProcess | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);

  const [github, setGithub] = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const p = JSON.parse(stored);
        setGithub(p.github ?? '');
      }
    } catch {
      /* ignore */
    }
  }, []);

  const repoSlug = process?.repository_url
    ? process.repository_url.replace('https://github.com/', '')
    : '';
  const folderName = github
    ? `prueba_tecnica_${github}`
    : 'prueba_tecnica_<usuario>';

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setValidating(true);
    setGateError(null);
    try {
      const {
        valid,
        process: p,
        reason,
      } = await validateProcessCodeAction(code.trim());
      if (!valid || !p) {
        setGateError(
          reason === 'expired'
            ? 'El proceso está vencido.'
            : 'Código inválido. Revisá el código que te dio la empresa.'
        );
        return;
      }
      if (!(p.exam_types ?? []).includes('git-practico')) {
        setGateError('Este código no incluye la prueba práctica de Git.');
        return;
      }
      setProcess({
        code: p.code,
        position_name: p.position_name,
        company_name: p.company_name,
        repository_url: p.repository_url ?? null,
      });
      void logUsage('start');
    } catch (err) {
      setGateError('No se pudo validar el código. Intentá de nuevo.');
      void logError(err, 'validate');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process) return;
    setSubmitting(true);
    setFormError(null);
    setResult(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ github }));
      const res = await fetch('/api/labs/git-practico/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          process_code: process.code,
          candidate_github: github.trim(),
          issue_url: issueUrl.trim(),
          pr_url: prUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data?.error ?? 'No se pudo verificar.');
        return;
      }
      setResult(data as VerifyResponse);
      void logUsage('verify');
    } catch (err) {
      setFormError('Error de red al verificar.');
      void logError(err, 'verify');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;
  const cardClass = `rounded-xl border p-6 ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <header>
          <h1
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            🔀 Prueba práctica de GitHub
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Demostrá el flujo real de trabajo en Git: issue → rama → cambios →
            Pull Request que cierra el issue. La corrección es automática.
          </p>
        </header>

        {/* Step 0 — gate por código */}
        {!process && (
          <form onSubmit={handleValidate} className={`${cardClass} space-y-4`}>
            <div>
              <label className={labelClass}>Código del proceso *</label>
              <input
                type="text"
                className={`${inputClass} font-mono tracking-wider`}
                placeholder="ej. AIQUAA-2026-X7K"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
              <p
                className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Es el código que te compartió la empresa para esta prueba.
              </p>
            </div>
            {gateError && (
              <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
                {gateError}
              </div>
            )}
            <button
              type="submit"
              disabled={validating || !code.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {validating ? 'Validando...' : 'Continuar'}
            </button>
          </form>
        )}

        {/* Instrucciones + form */}
        {process && (
          <>
            <div className={cardClass}>
              <p
                className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}
              >
                {process.company_name} · {process.position_name}
              </p>
              <a
                href={process.repository_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-lg font-semibold inline-flex items-center gap-2 ${isDarkMode ? 'text-white hover:text-indigo-300' : 'text-gray-900 hover:text-indigo-600'}`}
              >
                🔗 {repoSlug}
              </a>

              <ol
                className={`mt-4 space-y-2 text-sm list-decimal list-inside ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                <li>
                  Creá un <strong>issue</strong> en el repositorio describiendo
                  la tarea.
                </li>
                <li>
                  Creá una <strong>rama</strong> nueva a partir de{' '}
                  <code>main</code>.
                </li>
                <li>
                  Subí una carpeta <code>{folderName}/</code> con tus cambios
                  (al menos un archivo dentro).
                </li>
                <li>
                  Abrí un <strong>Pull Request</strong> hacia <code>main</code>.
                </li>
                <li>
                  En la descripción del PR escribí <code>Closes #N</code> (N =
                  número de tu issue) para enlazarlos.
                </li>
              </ol>
            </div>

            <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
              <div>
                <label className={labelClass}>Tu usuario de GitHub *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="ej. stevenayal"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Link del issue *</label>
                <input
                  type="url"
                  className={inputClass}
                  placeholder={`https://github.com/${repoSlug || 'owner/repo'}/issues/1`}
                  value={issueUrl}
                  onChange={(e) => setIssueUrl(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Link del Pull Request *</label>
                <input
                  type="url"
                  className={inputClass}
                  placeholder={`https://github.com/${repoSlug || 'owner/repo'}/pull/2`}
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  required
                />
              </div>
              {formError && (
                <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
                  {formError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Verificando...' : 'Verificar mi entrega'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProcess(null);
                    setResult(null);
                    setCode('');
                  }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Cambiar código
                </button>
              </div>
            </form>

            {/* Resultado */}
            {result && (
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    Resultado
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      result.passed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    }`}
                  >
                    {result.passed ? '✅ Aprobado' : '❌ No aprobado'} ·{' '}
                    {result.score}/{result.maxScore} ({result.percentage}%)
                  </span>
                </div>
                <ul className="space-y-2">
                  {result.checks.map((c) => (
                    <li
                      key={c.id}
                      className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                    >
                      <span>{c.passed ? '✅' : '❌'}</span>
                      <span>
                        {c.label}
                        {c.detail && (
                          <span
                            className={`ml-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                          >
                            ({c.detail})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
