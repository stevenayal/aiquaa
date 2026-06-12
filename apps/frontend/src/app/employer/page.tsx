'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getMyProcessesAction,
  updateProcessStatusAction,
  type HiringProcess,
} from '@/actions/employer';
import Link from 'next/link';

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  closed: 'Cerrado',
  draft: 'Borrador',
};

const STATUS_COLOR: Record<string, string> = {
  active:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  draft:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB',
  git: 'Git',
  performance: 'Rendimiento',
  'api-testing-fundamentals': 'API Testing Fundamentals',
  'api-banking': 'API Banking Challenge',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function EmployerPage() {
  const { user, isLoading } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [processes, setProcesses] = useState<HiringProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    getMyProcessesAction().then(({ data }) => {
      if (data) setProcesses(data as HiringProcess[]);
      setLoading(false);
    });
  }, [user]);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleStatus(code: string, current: string) {
    const next = current === 'active' ? 'closed' : 'active';
    startTransition(async () => {
      await updateProcessStatusAction(code, next as 'active' | 'closed');
      setProcesses((prev) =>
        prev.map((p) =>
          p.code === code
            ? { ...p, status: next as HiringProcess['status'] }
            : p
        )
      );
    });
  }

  const base = isDarkMode
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';
  const card = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen ${base} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${base} py-10 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Procesos de selección</h1>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Gestioná tus evaluaciones técnicas para candidatos QA
            </p>
          </div>
          <Link
            href="/employer/nuevo"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Nuevo proceso
          </Link>
        </div>

        {processes.length === 0 ? (
          <div className={`${card} border rounded-xl p-12 text-center`}>
            <p
              className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              No tenés procesos creados todavía
            </p>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Creá tu primer proceso para empezar a evaluar candidatos
            </p>
            <Link
              href="/employer/nuevo"
              className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Crear proceso
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {processes.map((p) => (
              <div key={p.id} className={`${card} border rounded-xl p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-base">
                        {p.position_name}
                      </h2>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status]}`}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {p.company_name}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <code
                        className={`text-sm font-mono px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        {p.code}
                      </code>
                      <button
                        onClick={() => copyCode(p.code)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          copied === p.code
                            ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                            : isDarkMode
                              ? 'text-gray-400 hover:text-white'
                              : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {copied === p.code ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {p.exam_types.map((t) => (
                        <span
                          key={t}
                          className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {EXAM_LABELS[t] ?? t}
                        </span>
                      ))}
                    </div>

                    <p
                      className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      Creado {formatDate(p.created_at)}
                      {p.expires_at && ` · Vence ${formatDate(p.expires_at)}`}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <Link
                      href={`/employer/${p.code}`}
                      className="text-sm text-indigo-500 hover:text-indigo-400 font-medium"
                    >
                      Ver candidatos →
                    </Link>
                    <button
                      onClick={() => toggleStatus(p.code, p.status)}
                      disabled={isPending}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        p.status === 'active'
                          ? 'border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      {p.status === 'active'
                        ? 'Cerrar proceso'
                        : 'Reabrir proceso'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
