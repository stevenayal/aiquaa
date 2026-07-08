import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL',
  git: 'Git',
  'git-practico': 'Git Práctica',
  performance: 'Performance',
  'api-testing-fundamentals': 'API Testing Fundamentals',
  'api-banking': 'API Testing Challenge',
  'database-fundamentals': 'Bases de Datos — Fundamentos',
  'database-practice': 'Bases de Datos — Práctica SQL',
  'infrastructure-fundamentals': 'Infraestructura — Fundamentos',
  'api-developer-fundamentals': 'APIs para Desarrolladores — Fundamentos',
};

const ISTQB_LEVEL_LABELS: Record<string, string> = {
  ctfl: 'Foundation Level (CTFL)',
  ctal_ta: 'Advanced Level — Test Analyst',
  ctal_tm: 'Advanced Level — Test Manager',
  ctal_tta: 'Advanced Level — Technical Test Analyst',
  expert: 'Expert Level',
  en_proceso: 'En proceso de certificación',
};

type PageProps = {
  params: { id: string };
};

function getSafeExternalUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function ProfileUnavailable() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Perfil no disponible
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Este candidato todavía no activó su visibilidad para empresas.
        </p>
        <Link
          href="/empresa/candidatos"
          className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Volver a candidatos
        </Link>
      </div>
    </main>
  );
}

export default async function TalentProfilePage({ params }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <ProfileUnavailable />;
  }

  const { data: caller } = await supabase
    .from('profiles')
    .select('audience')
    .eq('id', user.id)
    .maybeSingle();

  if (caller?.audience !== 'empresa') {
    return <ProfileUnavailable />;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, display_name, role, country, istqb_level, github_profile, disponibilidad, talent_visible_to_empresas'
    )
    .eq('id', params.id)
    .eq('audience', 'candidato')
    .maybeSingle();

  if (!profile?.talent_visible_to_empresas) {
    return <ProfileUnavailable />;
  }

  const { data: results } = await supabase
    .from('exam_results')
    .select('id, exam_type, percentage, passed, created_at')
    .eq('user_id', params.id)
    .lte('percentage', 100)
    .order('percentage', { ascending: false })
    .limit(8);

  const bestScore = results?.length ? Number(results[0].percentage ?? 0) : null;
  const passedCount = (results ?? []).filter((result) => result.passed).length;
  const githubUrl = getSafeExternalUrl(profile.github_profile);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/empresa/candidatos"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver a candidatos
        </Link>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Talento QA AIQUAA
              </p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                {profile.display_name || 'Candidato QA'}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {[profile.role, profile.country].filter(Boolean).join(' · ') ||
                  'Perfil QA'}
              </p>
              {profile.istqb_level && (
                <p className="mt-1 text-sm text-gray-500">
                  ISTQB:{' '}
                  {ISTQB_LEVEL_LABELS[profile.istqb_level] ??
                    profile.istqb_level}
                </p>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  className="mt-2 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver GitHub
                </a>
              )}
            </div>
            {profile.disponibilidad === 'activo' && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Disponible para contacto
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Mejor score
              </p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">
                {bestScore != null ? `${bestScore}%` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Evaluaciones
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {results?.length ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Aprobadas
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {passedCount}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Evidencia de evaluaciones
          </h2>
          <div className="mt-4 divide-y divide-gray-100">
            {(results ?? []).length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                Sin evaluaciones visibles todavía.
              </p>
            ) : (
              (results ?? []).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {EXAM_LABELS[result.exam_type] ?? result.exam_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(result.created_at).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">
                      {Number(result.percentage ?? 0)}%
                    </p>
                    <p
                      className={`text-xs font-semibold ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {result.passed ? 'Aprobado' : 'No aprobado'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
