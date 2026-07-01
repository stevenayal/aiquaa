import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const INDUSTRY_LABELS: Record<string, string> = {
  tecnologia: 'Tecnología',
  finanzas: 'Finanzas / Banca',
  salud: 'Salud',
  retail: 'Retail / Comercio',
  telecomunicaciones: 'Telecomunicaciones',
  educacion: 'Educación',
  gobierno: 'Gobierno / Público',
  manufactura: 'Manufactura',
  logistica: 'Logística',
  otro: 'Otro',
};

const TEAM_LABELS: Record<string, string> = {
  '1-10': '1–10 personas',
  '11-50': '11–50 personas',
  '51-200': '51–200 personas',
  '201-500': '201–500 personas',
  '500+': 'Más de 500',
};

const COUNTRY_LABELS: Record<string, string> = {
  PY: '🇵🇾 Paraguay',
  AR: '🇦🇷 Argentina',
  BO: '🇧🇴 Bolivia',
  BR: '🇧🇷 Brasil',
  CL: '🇨🇱 Chile',
  CO: '🇨🇴 Colombia',
  EC: '🇪🇨 Ecuador',
  MX: '🇲🇽 México',
  PE: '🇵🇪 Perú',
  UY: '🇺🇾 Uruguay',
  VE: '🇻🇪 Venezuela',
};

type Props = { params: Promise<{ id: string }> };

export default async function PublicEmpresaPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: empresa, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !empresa) notFound();

  // Increment profile view counter (fire-and-forget — non-blocking)
  supabase.rpc('increment_empresa_profile_views', { p_empresa_id: id }).then(() => {});

  // Active processes (public info only)
  const { data: processes } = await supabase
    .from('hiring_processes')
    .select('id, code, position_name, description, exam_types, expires_at, created_at')
    .eq('empresa_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);

  const displayName = empresa.nombre_comercial || empresa.razon_social;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* Hero card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4">
              {empresa.logo_url ? (
                <div className="relative w-20 h-20 rounded-xl border-4 border-white dark:border-slate-800 bg-white shadow overflow-hidden">
                  <Image
                    src={empresa.logo_url}
                    alt={`Logo ${displayName}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-4 border-white dark:border-slate-800 bg-indigo-100 flex items-center justify-center shadow">
                  <span className="text-3xl">🏢</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
            {empresa.razon_social !== displayName && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{empresa.razon_social}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-4">
              {empresa.industry && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  🏭 {INDUSTRY_LABELS[empresa.industry] ?? empresa.industry}
                </span>
              )}
              {empresa.country && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300">
                  {COUNTRY_LABELS[empresa.country] ?? empresa.country}
                </span>
              )}
              {empresa.team_size && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300">
                  👥 {TEAM_LABELS[empresa.team_size] ?? empresa.team_size}
                </span>
              )}
              {empresa.website_url && (
                <a
                  href={empresa.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300 transition-colors"
                >
                  🌐 Sitio web ↗
                </a>
              )}
            </div>

            {empresa.description && (
              <p className="mt-4 text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {empresa.description}
              </p>
            )}

            {/* Employer branding extras */}
            <div className="mt-4 space-y-3">
              {empresa.work_mode && (
                <div className="flex items-start gap-2">
                  <span className="text-sm">
                    {empresa.work_mode === 'remoto'
                      ? '🌐'
                      : empresa.work_mode === 'hibrido'
                        ? '🏠'
                        : '🏢'}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-slate-300 capitalize">
                    {empresa.work_mode === 'remoto'
                      ? 'Trabajo remoto'
                      : empresa.work_mode === 'hibrido'
                        ? 'Trabajo híbrido'
                        : 'Presencial'}
                  </p>
                </div>
              )}
              {(empresa.tech_stack ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-1.5">
                    Stack QA
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(empresa.tech_stack as string[]).map((tool) => (
                      <span
                        key={tool}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {empresa.benefits && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-1">
                    Beneficios
                  </p>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {empresa.benefits}
                  </p>
                </div>
              )}
              {empresa.linkedin_url && (
                <a
                  href={empresa.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>🔗</span> LinkedIn de la empresa ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Active processes */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Procesos activos
            {processes && processes.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-slate-400">
                ({processes.length})
              </span>
            )}
          </h2>

          {!processes || processes.length === 0 ? (
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium">Sin procesos activos en este momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processes.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                        {p.position_name}
                      </h3>
                      {p.description && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="font-mono text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                          Código: {p.code}
                        </span>
                        {(p.exam_types ?? []).map((et: string) => (
                          <span
                            key={et}
                            className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                          >
                            {et === 'istqb' ? 'ISTQB CTFL' : et === 'git' ? 'Git' : et === 'performance' ? 'Performance Testing' : et}
                          </span>
                        ))}
                        {p.expires_at && (
                          <span className="text-xs text-gray-400 dark:text-slate-500">
                            Vence: {new Date(p.expires_at).toLocaleDateString('es-PY')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700/50 p-5 text-center">
          <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1">
            ¿Querés rendir una evaluación técnica?
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-3">
            Registrate en AIQUAA, practicá y rendí el examen con el código del proceso
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/registro"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Crear cuenta
            </Link>
            <Link
              href="/exams"
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              Ver exámenes
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            ← Volver a AIQUAA
          </Link>
        </div>
      </div>
    </div>
  );
}
