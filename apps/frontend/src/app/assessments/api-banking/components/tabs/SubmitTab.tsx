'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProgressTracker } from '../ProgressTracker';

interface Props {
  attemptId: number | null;
  testCasesCount: number;
  bugReportsCount: number;
  hasSummary: boolean;
  onSubmit: () => Promise<{ score: any; error: string | null }>;
}

export function SubmitTab({
  attemptId,
  testCasesCount,
  bugReportsCount,
  hasSummary,
  onSubmit,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = testCasesCount >= 1 && bugReportsCount >= 1;

  async function handleSubmit() {
    if (!canSubmit || !attemptId) return;
    setLoading(true);
    setError(null);
    const result = await onSubmit();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      // Clear session storage
      sessionStorage.clear();
      router.push(`/assessments/api-banking/result/${attemptId}`);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Finalizar challenge
        </h2>
        <p className="text-xs text-slate-500">
          Revisá tu progreso antes de enviar. Una vez enviado no podrás
          modificar tu respuesta.
        </p>
      </div>

      <ProgressTracker
        testCasesCount={testCasesCount}
        bugReportsCount={bugReportsCount}
        hasSummary={hasSummary}
      />

      <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-3 text-xs text-amber-700 dark:text-amber-400">
        <strong>Antes de enviar:</strong>
        <ul className="mt-1 list-disc list-inside space-y-0.5">
          <li>¿Documentaste todos los bugs que encontraste?</li>
          <li>
            ¿Tus casos de prueba cubren escenarios positivos, negativos y de
            seguridad?
          </li>
          <li>¿El resumen ejecutivo refleja tus hallazgos principales?</li>
        </ul>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading || !attemptId}
        className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Enviando...' : 'Finalizar y enviar'}
      </button>

      {!canSubmit && (
        <p className="text-xs text-slate-400 text-center">
          Necesitás al menos 1 caso de prueba y 1 bug report para enviar.
        </p>
      )}
    </div>
  );
}
