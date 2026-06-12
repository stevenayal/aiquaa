'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { startAssessmentAttemptAction } from '@/actions/assessments';
import ProcessCodeInput from '@/components/labs/ProcessCodeInput';
import { DATABASE_FUNDAMENTALS_SLUG } from '../data/assessment-definition';

export default function StartDatabaseFundamentalsPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [processCode, setProcessCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Pre-fill desde ?code= (links de invitaciones/procesos de empresa)
  useEffect(() => {
    const codeParam = new URLSearchParams(window.location.search).get('code');
    if (codeParam) setProcessCode(codeParam);
  }, []);

  function handleStart() {
    setError('');
    startTransition(async () => {
      try {
        const { attempt, sectionSlug } = await startAssessmentAttemptAction({
          slug: DATABASE_FUNDAMENTALS_SLUG,
          processCode,
        });

        if (!sectionSlug) {
          setError('No se encontró la primera sección del assessment.');
          return;
        }

        router.push(
          `/assessments/database-fundamentals/section/${sectionSlug}?attempt=${attempt.id}`
        );
      } catch (startError) {
        setError(
          startError instanceof Error
            ? startError.message
            : 'No se pudo iniciar el assessment.'
        );
      }
    });
  }

  return (
    <div
      className={`min-h-screen px-4 py-12 ${
        isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-50 shadow-2xl shadow-cyan-950/20">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Preparación del intento
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          Bases de Datos — Fundamentos
        </h1>
        <p className="mt-3 text-slate-300">
          Vas a completar 3 niveles teóricos con autosave, scoring por sección y
          resultado final consolidado.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Duración sugerida
            </p>
            <p className="mt-2 text-lg font-semibold">~30 minutos</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Modalidad
            </p>
            <p className="mt-2 text-lg font-semibold">Conceptual</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Resultado
            </p>
            <p className="mt-2 text-lg font-semibold">Score total sobre 100</p>
          </div>
        </div>

        <div className="mt-8">
          <ProcessCodeInput
            value={processCode}
            onChange={setProcessCode}
            onNormalizedCode={setProcessCode}
            autoValidate
          />
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStart}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Preparando intento...' : 'Iniciar o reanudar'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/assessments/database-fundamentals')}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Volver al overview
          </button>
        </div>
      </div>
    </div>
  );
}
