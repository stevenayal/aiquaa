'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  API_CHALLENGE_MIN_FINDINGS,
  API_CHALLENGE_MIN_TEST_CASES,
} from '../../data/apiChallengeTargets';
import { API_CHALLENGE_EVALUATION_CRITERIA } from '../../data/evaluationCriteria';
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

  const canSubmit =
    testCasesCount >= API_CHALLENGE_MIN_TEST_CASES &&
    bugReportsCount >= API_CHALLENGE_MIN_FINDINGS &&
    hasSummary;

  async function handleSubmit() {
    if (!canSubmit || !attemptId) return;
    setLoading(true);
    setError(null);
    const result = await onSubmit();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
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
          Revisa tu progreso antes de enviar. Una vez enviado no podras
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
          <li>Incluiste URLs, parametros y datos para replicar tus pruebas.</li>
          <li>
            Tus casos cubren escenarios positivos, negativos, borde y contrato.
          </li>
          <li>
            Tus hallazgos pueden ser bugs, riesgos, inconsistencias,
            limitaciones o mejoras testables.
          </li>
          <li>
            El resumen ejecutivo refleja cobertura, riesgos y recomendacion.
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-400">
        <strong className="text-slate-700 dark:text-slate-300">
          Criterio de evaluacion:
        </strong>
        <div className="mt-2 grid gap-1">
          {API_CHALLENGE_EVALUATION_CRITERIA.map((criterion) => (
            <p key={criterion.key}>
              <span className="font-semibold">{criterion.maxScore} pts</span> -{' '}
              {criterion.label}: {criterion.summary}
            </p>
          ))}
        </div>
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
          Necesitas al menos {API_CHALLENGE_MIN_TEST_CASES} casos,{' '}
          {API_CHALLENGE_MIN_FINDINGS} hallazgos y un resumen completo para
          enviar.
        </p>
      )}
    </div>
  );
}
