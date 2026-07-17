import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL',
  git: 'Git',
  'git-practico': 'Git Práctica',
  'playwright-practico': 'Playwright Práctica',
  performance: 'Performance Testing',
  'api-testing-fundamentals': 'API Testing Fundamentals',
  'api-banking': 'API Testing Challenge',
  'database-fundamentals': 'Bases de Datos — Fundamentos',
  'database-practice': 'Bases de Datos — Práctica SQL',
  'infrastructure-fundamentals': 'Infraestructura — Fundamentos',
  'api-developer-fundamentals': 'APIs para Desarrolladores — Fundamentos',
  'gherkin-fundamentals': 'Gherkin y BDD — Fundamentos',
};

type Props = { params: Promise<{ token: string }> };

export default async function InvitacionTokenPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  // Validate UUID format before querying
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(token)) notFound();

  const { data: rows, error } = await supabase.rpc('get_invitacion_by_token', {
    p_token: token,
  });

  if (error || !rows || rows.length === 0) notFound();

  const inv = rows[0];

  // Mark as viewed (non-blocking — fire and forget pattern)
  supabase.rpc('mark_invitacion_vista', { p_token: token }).then(() => {});

  const isExpired = inv.status === 'rechazada';
  const isCompleted = inv.status === 'completada';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Company card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="px-6 pb-6">
            <div className="-mt-8 mb-4">
              {inv.empresa_logo ? (
                <div className="relative w-16 h-16 rounded-xl border-4 border-white dark:border-slate-800 bg-white shadow overflow-hidden">
                  <Image
                    src={inv.empresa_logo}
                    alt={`Logo ${inv.empresa_nombre}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-4 border-white dark:border-slate-800 bg-indigo-100 flex items-center justify-center shadow">
                  <span className="text-2xl">🏢</span>
                </div>
              )}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-1">
              Invitación de evaluación técnica
            </p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {inv.empresa_nombre}
            </h1>
            {inv.empresa_industry && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {inv.empresa_industry}
              </p>
            )}
          </div>
        </div>

        {/* Invitation details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Para</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
              {inv.candidate_name ?? inv.candidate_email}
            </p>
            {inv.candidate_name && (
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {inv.candidate_email}
              </p>
            )}
          </div>

          {inv.process_position && (
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Proceso de selección
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                {inv.process_position}
              </p>
              {(inv.process_exam_types ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(inv.process_exam_types as string[]).map((et) => (
                    <span
                      key={et}
                      className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                    >
                      {EXAM_LABELS[et] ?? et}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {inv.message && (
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Mensaje
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                {inv.message}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        {isExpired ? (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5 text-center">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
              Esta invitación ya no está activa
            </p>
            <p className="text-xs text-red-500 dark:text-red-400">
              Contactá a la empresa directamente si querés participar
            </p>
          </div>
        ) : isCompleted ? (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-5 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Ya completaste esta evaluación
            </p>
          </div>
        ) : (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700/50 p-5 space-y-3">
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
              ¿Listo para rendir?
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              Creá tu cuenta o iniciá sesión en AIQUAA, luego ingresá el código
              del proceso para comenzar la evaluación.
            </p>
            {inv.process_code && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-600 dark:text-indigo-400">
                  Código del proceso:
                </span>
                <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 text-indigo-800 dark:text-indigo-200">
                  {inv.process_code}
                </span>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Link
                href="/registro"
                className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Crear cuenta
              </Link>
              <Link
                href="/login"
                className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold border border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            ← Volver a AIQUAA
          </Link>
        </div>
      </div>
    </div>
  );
}
