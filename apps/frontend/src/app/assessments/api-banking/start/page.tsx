'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getExamUserDefaults } from '@/lib/exam-user-defaults';
import ProcessCodeInput from '@/components/labs/ProcessCodeInput';
import { SESSION_KEYS } from '../types';
import {
  API_CHALLENGE_TARGETS,
  DEFAULT_API_TARGET_ID,
  type ApiChallengeTargetId,
} from '../data/apiChallengeTargets';

export default function StartPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [processCode, setProcessCode] = useState('');
  const [apiTarget, setApiTarget] = useState<ApiChallengeTargetId>(
    DEFAULT_API_TARGET_ID
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const userDefaults = getExamUserDefaults(user);
  const participantLabel =
    userDefaults.fullName || userDefaults.email || 'tu cuenta AIQUAA';

  useEffect(() => {
    const codeParam = new URLSearchParams(window.location.search).get('code');
    if (codeParam) setProcessCode(codeParam);
  }, []);

  async function handleStart(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user) {
      setError('Inicia sesion para rendir este challenge.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assessments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processCode: processCode.trim() || undefined,
          apiTarget,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'No se pudo iniciar el challenge.');
        return;
      }

      const {
        attemptId,
        challengeToken,
        candidateName,
        apiTarget: savedApiTarget,
      } = await res.json();

      sessionStorage.setItem(SESSION_KEYS.attemptId, String(attemptId));
      sessionStorage.setItem(SESSION_KEYS.challengeToken, challengeToken);
      sessionStorage.setItem(
        SESSION_KEYS.candidateName,
        candidateName || participantLabel
      );
      sessionStorage.setItem(SESSION_KEYS.startedAt, new Date().toISOString());
      sessionStorage.setItem(
        SESSION_KEYS.apiTarget,
        savedApiTarget || apiTarget
      );

      router.push('/assessments/api-banking/workspace');
    } catch {
      setError('Error de red. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cargando...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Iniciar challenge
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            API Testing - Challenge practico
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            Vas a rendir como{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {participantLabel}
            </span>
            .
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Elegi la API para tu prueba
            </legend>
            <div className="grid gap-2">
              {API_CHALLENGE_TARGETS.map((target) => (
                <label
                  key={target.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    apiTarget === target.id
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="apiTarget"
                      value={target.id}
                      checked={apiTarget === target.id}
                      onChange={() => setApiTarget(target.id)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {target.name}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {target.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {target.recommendedFor}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <ProcessCodeInput
            value={processCode}
            onChange={setProcessCode}
            onNormalizedCode={setProcessCode}
            autoValidate
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10 p-3 text-xs text-blue-700 dark:text-blue-400">
            Al iniciar aceptas que tu respuesta sera evaluada automaticamente.
            Tenes el tiempo que necesitas; el timer es solo referencial. La
            evaluacion premia cobertura, evidencia y criterio QA, no encontrar
            bugs reales a la fuerza.
          </div>

          <button
            type="submit"
            disabled={loading || !user}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Iniciando...' : 'Comenzar challenge ->'}
          </button>
        </form>
      </div>
    </main>
  );
}
