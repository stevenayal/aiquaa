import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL — Fundamentos de QA',
  git: 'Git — Control de versiones',
  performance: 'Performance Testing',
  'api-testing-fundamentals': 'API Testing Fundamentals',
  'api-banking': 'API Banking Challenge',
};

const EXAM_URLS: Record<string, string> = {
  istqb: '/labs/istqb',
  git: '/labs/git',
  performance: '/labs/performance',
  'api-testing-fundamentals': '/assessments/api-testing-fundamentals/start',
  'api-banking': '/assessments/api-banking/start',
};

function examHref(examType: string, code: string) {
  const base = EXAM_URLS[examType];
  if (!base) return null;
  return `${base}?code=${encodeURIComponent(code)}`;
}

type Props = { params: Promise<{ token: string }> };

export default async function InvitacionTokenPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: inv, error } = await supabase
    .from('empresa_invitaciones')
    .select(
      '*, empresas(razon_social, nombre_comercial, logo_url, industry, country), hiring_processes(position_name, code, exam_types)'
    )
    .eq('token', token)
    .single();

  if (error || !inv) notFound();

  const empresa = inv.empresas as {
    razon_social: string;
    nombre_comercial: string | null;
    logo_url: string | null;
    industry: string | null;
    country: string | null;
  } | null;

  const proceso = inv.hiring_processes as {
    position_name: string;
    code: string;
    exam_types: string[];
  } | null;

  const displayName =
    empresa?.nombre_comercial ?? empresa?.razon_social ?? 'Una empresa';
  const isExpired = inv.status === 'rechazada';
  const isCompleted = inv.status === 'completada';

  // Mark as "vista" if still pending
  if (inv.status === 'pendiente') {
    await supabase
      .from('empresa_invitaciones')
      .update({ status: 'vista', viewed_at: new Date().toISOString() })
      .eq('token', token);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            ← AIQUAA
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {/* Hero */}
          <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-600" />

          <div className="px-6 pb-6">
            {/* Logo */}
            <div className="-mt-8 mb-4">
              {empresa?.logo_url ? (
                <div className="relative w-16 h-16 rounded-xl border-4 border-white dark:border-slate-800 bg-white shadow overflow-hidden">
                  <Image
                    src={empresa.logo_url}
                    alt={`Logo ${displayName}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-4 border-white dark:border-slate-800 bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shadow">
                  <span className="text-2xl">🏢</span>
                </div>
              )}
            </div>

            {isCompleted ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">✅</p>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Evaluación completada!
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Ya completaste la evaluación de {displayName}. Podés ver tus
                  resultados en tu perfil.
                </p>
                <Link
                  href="/perfil"
                  className="inline-block mt-4 px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Ver mi perfil
                </Link>
              </div>
            ) : isExpired ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">⛔</p>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Invitación vencida
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Esta invitación ya no está disponible. Contactá a{' '}
                  {displayName} para más información.
                </p>
              </div>
            ) : (
              <>
                {/* Invitation body */}
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {displayName} te invita a rendir
                </h1>
                {proceso && (
                  <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                    {proceso.position_name}
                  </p>
                )}

                {inv.message && (
                  <blockquote className="border-l-4 border-indigo-400 pl-4 py-1 my-4 text-sm text-gray-700 dark:text-slate-300 italic">
                    {inv.message}
                  </blockquote>
                )}

                {/* Exams */}
                {proceso && proceso.exam_types.length > 0 && (
                  <div className="my-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Evaluaciones a rendir
                    </p>
                    {proceso.exam_types.map((et) => {
                      const href = examHref(et, proceso.code);
                      const chip = (
                        <>
                          <span>📋</span>
                          {EXAM_LABELS[et] ?? et}
                        </>
                      );
                      return href ? (
                        <Link
                          key={et}
                          href={href}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-sm font-medium text-indigo-800 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {chip}
                          </span>
                          <span className="text-xs font-semibold">
                            Rendir →
                          </span>
                        </Link>
                      ) : (
                        <div
                          key={et}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-sm font-medium text-indigo-800 dark:text-indigo-200"
                        >
                          {chip}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Process code */}
                {proceso && (
                  <div className="my-4 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-700/50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1">
                      Código del proceso
                    </p>
                    <p className="text-2xl font-bold font-mono tracking-widest text-indigo-700 dark:text-indigo-300">
                      {proceso.code}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      Usá este código al iniciar el examen
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                  Para rendir la evaluación necesitás una cuenta en AIQUAA
                  (gratuita). Si ya tenés cuenta, ingresá directamente.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/login?next=/dashboard`}
                    className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Tengo cuenta — Ingresar
                  </Link>
                  <Link
                    href={`/register`}
                    className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold border border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    Crear cuenta gratis
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500">
          AIQUAA · Plataforma QA gratuita para LATAM
        </p>
      </div>
    </div>
  );
}
