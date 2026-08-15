'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  getMyProcessGroupsAction,
  type ProcessGroup,
} from '@/actions/employer';

const EXAM_OPTIONS = [
  {
    id: 'istqb',
    label: 'ISTQB CTFL — Fundamentos de QA',
    description:
      'Conceptos de testing, ciclo de vida del defecto, técnicas de diseño y gestión de pruebas',
  },
  {
    id: 'git',
    label: 'Git — Control de versiones',
    description:
      'Comandos esenciales, branching, merge, rebase y flujos de trabajo colaborativos',
  },
  {
    id: 'git-practico',
    label: 'Git — Prueba práctica (GitHub)',
    description:
      'Flujo real en un repo: crear issue, rama, subir carpeta y abrir un PR que cierre el issue — verificación automática vía GitHub API',
  },
  {
    id: 'playwright-practico',
    label: 'Playwright — Prueba práctica (E2E)',
    description:
      'Automatización real: specs de Playwright para login, catálogo, carrito y checkout de la Test App, entregados por PR — verificación automática vía GitHub API',
  },
  {
    id: 'performance',
    label: 'Performance Testing — Pruebas de carga',
    description:
      'Conceptos de pruebas de performance, herramientas (JMeter/k6), análisis de resultados',
  },
  {
    id: 'api-testing-fundamentals',
    label: 'API Testing — Fundamentos (Examen teórico)',
    description:
      'Conceptos de API, lectura de documentación, diseño de casos y análisis de respuestas — auto-corregido, 5 niveles',
  },
  {
    id: 'api-banking',
    label: 'API Testing - Challenge practico',
    description:
      'Prueba practica flexible con APIs publicas, casos reproducibles y hallazgos - auto-corregido, 100 pts',
  },
  {
    id: 'database-fundamentals',
    label: 'Bases de Datos — Fundamentos (Examen teórico)',
    description:
      'Modelo relacional, claves, tipos de datos, SELECT, JOINs y constraints — auto-corregido, 3 niveles',
  },
  {
    id: 'database-practice',
    label: 'Bases de Datos — Práctica SQL (Challenge)',
    description:
      'Predicción de resultados, detección de bugs en queries y escritura de SQL — auto-corregido, 100 pts',
  },
  {
    id: 'api-developer-fundamentals',
    label: 'APIs para Desarrolladores — Fundamentos (Examen teórico)',
    description:
      'Fundamentos REST: principios, recursos y URIs, OpenAPI, params y verbos HTTP — auto-corregido, 100 pts',
  },
  {
    id: 'infrastructure-fundamentals',
    label: 'Infraestructura — Fundamentos (Examen teórico)',
    description:
      'Contenedores Docker, conceptos de Kubernetes y arquitectura de clúster — auto-corregido, 3 niveles',
  },
  {
    id: 'api-dotnet-fundamentals',
    label: 'API .NET — Fundamentos (Examen teórico)',
    description:
      'Diseño REST y versionado, contrato OpenAPI/Swagger, Clean Architecture y manejo de errores en .NET — auto-corregido, 4 secciones',
  },
  {
    id: 'docker-fundamentals',
    label: 'Docker — Fundamentos (Examen teórico)',
    description:
      'Dockerfiles multistage e imágenes livianas, variables de entorno sin hardcode y ejecución/reproducibilidad local — auto-corregido, 3 secciones',
  },
  {
    id: 'kubernetes-helm-fundamentals',
    label: 'Kubernetes + Helm — Fundamentos (Examen teórico)',
    description:
      'Manifiestos Deployment/Service, ConfigMaps y Secrets, charts de Helm y despliegue funcional en Minikube — auto-corregido, 4 secciones',
  },
  {
    id: 'observability-fundamentals',
    label: 'Observabilidad — Fundamentos (Examen teórico)',
    description:
      'Logging estructurado con Serilog, centralización en Seq, niveles de log y visualización — auto-corregido, 4 secciones',
  },
  {
    id: 'cicd-fundamentals',
    label: 'CI/CD — Fundamentos (Examen teórico)',
    description:
      'Pipelines de integración continua, despliegue continuo automatizado y buenas prácticas de versionado — auto-corregido, 3 secciones',
  },
  {
    id: 'gherkin-fundamentals',
    label: 'Gherkin y BDD — Fundamentos (Examen teórico)',
    description:
      'Fundamentos de BDD, sintaxis Gherkin (Given/When/Then) y escenarios avanzados aplicados a testing — auto-corregido, 3 niveles',
  },
  {
    id: 'test-app',
    label: 'Test App — Exploratory Testing & Bug Hunt',
    description:
      'Aplicación con bugs intencionales para evaluación práctica de exploratory testing — 30 min, corrección manual por evaluador',
  },
];

function generateCode(positionName: string): string {
  const slug = positionName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('-');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${slug}-${rand}`;
}

export default function NuevoProcesoPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const DEFAULT_REPO_URL = 'https://github.com/stevenayal/bootcamp_ctl_2026';
  const GITHUB_REPO_RE = /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/;

  const [positionName, setPositionName] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState(DEFAULT_REPO_URL);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('active');
  const [groupId, setGroupId] = useState<string>('');
  const [groups, setGroups] = useState<ProcessGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    getMyProcessGroupsAction().then(({ data }) => setGroups(data ?? []));
  }, []);

  const toggleExam = (id: string) => {
    setExamTypes((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionName.trim()) return;
    if (examTypes.length === 0) {
      setError('Seleccioná al menos un tipo de examen.');
      return;
    }
    if (!GITHUB_REPO_RE.test(repositoryUrl.trim())) {
      setError(
        'Ingresá un repositorio válido (ej. https://github.com/usuario/repo).'
      );
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    // Generate unique code — retry up to 5 times on collision
    let code = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateCode(positionName);
      const { data: existing } = await supabase
        .from('hiring_processes')
        .select('code')
        .eq('code', candidate)
        .maybeSingle();
      if (!existing) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      setError('No se pudo generar un código único. Intentá de nuevo.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('hiring_processes')
      .insert({
        code,
        created_by: user.id,
        company_name: user.user_metadata?.company_name ?? '',
        position_name: positionName.trim(),
        description: description.trim() || null,
        repository_url: repositoryUrl.trim(),
        exam_types: examTypes,
        status,
        expires_at: expiresAt || null,
        ...(groupId ? { group_id: groupId } : {}),
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Show success state with code before redirecting
    const { data: created } = await supabase
      .from('hiring_processes')
      .select('id, code')
      .eq('code', code)
      .single();

    setCreatedCode(code);
    setCreatedId(created?.id ?? null);
    setLoading(false);
  };

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;

  // Success screen
  if (createdCode) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            className={`rounded-2xl border p-8 text-center ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`}
          >
            <p className="text-5xl mb-4">✅</p>
            <h1
              className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              ¡Proceso creado!
            </h1>
            <p
              className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Compartí este código con los candidatos para que rindan el examen
            </p>
            <div
              className={`rounded-xl border-2 border-dashed p-5 mb-6 ${isDarkMode ? 'border-indigo-600 bg-indigo-900/20' : 'border-indigo-300 bg-indigo-50'}`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}
              >
                Código del proceso
              </p>
              <p
                className={`text-4xl font-bold font-mono tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}
              >
                {createdCode}
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdCode);
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  codeCopied
                    ? 'border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300'
                    : isDarkMode
                      ? 'border-indigo-500 text-indigo-300 hover:bg-slate-700'
                      : 'border-indigo-400 text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {codeCopied ? '✅ Copiado!' : '📋 Copiar código'}
              </button>
              {createdId && (
                <Link
                  href={`/empresa/procesos/${createdId}`}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Ver proceso →
                </Link>
              )}
              <Link
                href="/empresa/procesos"
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Mis procesos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Nuevo proceso de selección
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Creá un proceso y compartí el código con los candidatos para que
            rindan los exámenes
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-xl border p-6 space-y-6 ${
            isDarkMode
              ? 'bg-dark-secondary border-slate-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Position name */}
          <div>
            <label className={labelClass}>Puesto / posición *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="ej. QA Analyst Jr."
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              Descripción{' '}
              <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>
                (opcional)
              </span>
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Describí brevemente el proceso o los requisitos del puesto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Repository (required) */}
          <div>
            <label className={labelClass}>Repositorio de GitHub *</label>
            <input
              type="url"
              className={inputClass}
              placeholder="https://github.com/usuario/repo"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              required
            />
            <p
              className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              Repo donde los candidatos harán la prueba práctica de Git (issue →
              rama → carpeta → PR). Por defecto el repo del bootcamp.
            </p>
          </div>

          {/* Event group */}
          {groups.length > 0 && (
            <div>
              <label className={labelClass}>
                Evento{' '}
                <span
                  className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}
                >
                  (opcional)
                </span>
              </label>
              <select
                className={inputClass}
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              >
                <option value="">— Sin categoría —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exam types */}
          <div>
            <label className={labelClass}>Exámenes a rendir *</label>
            <div className="space-y-2">
              {EXAM_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                    examTypes.includes(opt.id)
                      ? isDarkMode
                        ? 'border-indigo-500 bg-indigo-900/30'
                        : 'border-indigo-400 bg-indigo-50'
                      : isDarkMode
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-indigo-600 w-4 h-4 mt-0.5 shrink-0"
                    checked={examTypes.includes(opt.id)}
                    onChange={() => toggleExam(opt.id)}
                  />
                  <div>
                    <span
                      className={`text-sm font-medium block ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                    >
                      {opt.label}
                    </span>
                    <span
                      className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      {opt.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Expires at */}
          <div>
            <label className={labelClass}>
              Fecha de vencimiento{' '}
              <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>
                (opcional)
              </span>
            </label>
            <input
              type="date"
              className={inputClass}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Estado inicial</label>
            <div className="flex gap-3">
              {(['active', 'draft'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    status === s
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'border-slate-600 text-slate-300 hover:border-slate-500'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {s === 'active'
                    ? '✅ Activo (candidatos pueden rendir)'
                    : '📝 Borrador (guardado, no visible)'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !positionName.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear proceso'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/empresa/procesos')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
