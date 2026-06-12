'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getExamUserDefaults } from '@/lib/exam-user-defaults';
import ProcessCodeInput from '@/components/labs/ProcessCodeInput';
import { SESSION_KEYS } from '../types';

export default function StartPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [processCode, setProcessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const userDefaults = getExamUserDefaults(user);
  const participantLabel =
    userDefaults.fullName || userDefaults.email || 'tu cuenta AIQUAA';

  // Pre-fill process code from ?code= (links desde invitaciones/procesos)
  useEffect(() => {
    const codeParam = new URLSearchParams(window.location.search).get('code');
    if (codeParam) setProcessCode(codeParam);
  }, []);

  async function handleStart(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user) {
      setError('Iniciá sesión para rendir este challenge.');
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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'No se pudo iniciar el challenge.');
        return;
      }

      const { attemptId, challengeToken, candidateName } = await res.json();

      sessionStorage.setItem(SESSION_KEYS.attemptId, String(attemptId));
      sessionStorage.setItem(SESSION_KEYS.challengeToken, challengeToken);
      sessionStorage.setItem(
        SESSION_KEYS.candidateName,
        candidateName || participantLabel
      );
      sessionStorage.setItem(SESSION_KEYS.startedAt, new Date().toISOString());

      router.push('/assessments/api-banking/workspace');
    } catch {
      setError('Error de red. Intentá de nuevo.');
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
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Iniciar challenge
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            API Banking — Challenge práctico
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
            Al iniciar aceptás que tu respuesta será evaluada automáticamente.
            Tenés el tiempo que necesitás — el timer es solo referencial.
          </div>

          <button
            type="submit"
            disabled={loading || !user}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Iniciando...' : 'Comenzar challenge →'}
          </button>
        </form>
      </div>
    </main>
  );
}
