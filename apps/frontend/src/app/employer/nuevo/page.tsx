'use client';

export const dynamic = 'force-dynamic';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createHiringProcessAction } from '@/actions/employer';

const DEFAULT_REPO_URL = 'https://github.com/stevenayal/bootcamp_ctl_2026';
const GITHUB_REPO_RE = /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/;

const EXAM_OPTIONS = [
  { value: 'istqb', label: 'ISTQB Foundation Level' },
  { value: 'git', label: 'Git' },
  { value: 'git-practico', label: 'Git — Prueba práctica (GitHub)' },
  { value: 'performance', label: 'Rendimiento / Performance' },
  { value: 'api-testing-fundamentals', label: 'API Testing Fundamentals' },
  { value: 'api-banking', label: 'API Testing - Challenge practico' },
  { value: 'database-fundamentals', label: 'Bases de Datos — Fundamentos' },
  { value: 'database-practice', label: 'Bases de Datos — Práctica SQL' },
  {
    value: 'infrastructure-fundamentals',
    label: 'Infraestructura — Fundamentos',
  },
];

export default function NuevoProcesoPage() {
  const { user, isLoading } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    company_name: '',
    position_name: '',
    description: '',
    repository_url: DEFAULT_REPO_URL,
    exam_types: ['istqb', 'git', 'performance', 'api-testing-fundamentals'],
    expires_at: '',
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  function toggleExam(value: string) {
    setForm((prev) => ({
      ...prev,
      exam_types: prev.exam_types.includes(value)
        ? prev.exam_types.filter((e) => e !== value)
        : [...prev.exam_types, value],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim() || !form.position_name.trim()) {
      setError('Empresa y posición son obligatorios');
      return;
    }
    if (form.exam_types.length === 0) {
      setError('Seleccioná al menos un tipo de examen');
      return;
    }
    if (!GITHUB_REPO_RE.test(form.repository_url.trim())) {
      setError(
        'Ingresá un repositorio válido (ej. https://github.com/usuario/repo)'
      );
      return;
    }

    startTransition(async () => {
      const { data, error: err } = await createHiringProcessAction({
        company_name: form.company_name.trim(),
        position_name: form.position_name.trim(),
        description: form.description.trim() || undefined,
        repository_url: form.repository_url.trim(),
        exam_types: form.exam_types,
        expires_at: form.expires_at || undefined,
      });

      if (err) {
        setError(err);
        return;
      }
      router.push(`/employer/${data.code}`);
    });
  }

  const base = isDarkMode
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';
  const card = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';
  const input = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500';

  return (
    <div className={`min-h-screen ${base} py-10 px-4`}>
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => router.push('/employer')}
          className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
        >
          ← Volver a procesos
        </button>

        <h1 className="text-2xl font-bold mb-1">Nuevo proceso de selección</h1>
        <p
          className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
        >
          Se generará un código único que compartís con los candidatos
        </p>

        <form
          onSubmit={handleSubmit}
          className={`${card} border rounded-xl p-6 space-y-5`}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Empresa *</label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, company_name: e.target.value }))
              }
              placeholder="Ej: CLT, Banco XYZ"
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${input}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Posición *</label>
            <input
              type="text"
              value={form.position_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, position_name: e.target.value }))
              }
              placeholder="Ej: QA Analyst Junior"
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${input}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Información adicional para los candidatos..."
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors resize-none ${input}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Repositorio de GitHub *
            </label>
            <input
              type="url"
              value={form.repository_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, repository_url: e.target.value }))
              }
              placeholder="https://github.com/usuario/repo"
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${input}`}
            />
            <p
              className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Repo donde los candidatos harán la prueba práctica de Git. Por
              defecto el repo del bootcamp.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Exámenes incluidos *
            </label>
            <div className="space-y-2">
              {EXAM_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.exam_types.includes(opt.value)}
                    onChange={() => toggleExam(opt.value)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de vencimiento (opcional)
            </label>
            <input
              type="date"
              value={form.expires_at}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, expires_at: e.target.value }))
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${input}`}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {isPending ? 'Creando proceso...' : 'Crear proceso'}
          </button>
        </form>
      </div>
    </div>
  );
}
