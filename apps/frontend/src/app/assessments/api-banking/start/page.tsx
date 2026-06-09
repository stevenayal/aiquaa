'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getExamUserDefaults } from '@/lib/exam-user-defaults';
import { SESSION_KEYS } from '../types';

export default function StartPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill from active AIQUAA session
  useEffect(() => {
    if (user) {
      const defaults = getExamUserDefaults(user);
      if (defaults.fullName) setName(defaults.fullName);
      if (defaults.email) setEmail(defaults.email);
    }
  }, [user]);

  async function startChallenge(candidateName: string, candidateEmail: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assessments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          candidateEmail: candidateEmail.trim() || undefined,
          aiquaaUserId: user?.id ?? undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'No se pudo iniciar el challenge.');
        return;
      }

      const { attemptId, challengeToken } = await res.json();

      sessionStorage.setItem(SESSION_KEYS.attemptId, String(attemptId));
      sessionStorage.setItem(SESSION_KEYS.challengeToken, challengeToken);
      sessionStorage.setItem(SESSION_KEYS.candidateName, candidateName.trim());
      sessionStorage.setItem(SESSION_KEYS.startedAt, new Date().toISOString());

      router.push('/assessments/api-banking/workspace');
    } catch {
      setError('Error de red. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStart(ev: React.FormEvent) {
    ev.preventDefault();
    if (!name.trim()) {
      setError('El nombre es requerido.');
      return;
    }
    await startChallenge(name, email);
  }

  // If logged in and we already have name → auto-start
  useEffect(() => {
    if (!authLoading && user) {
      const defaults = getExamUserDefaults(user);
      if (defaults.fullName) {
        startChallenge(defaults.fullName, defaults.email);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // Show spinner while auto-starting
  if (authLoading || (user && loading)) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Iniciando challenge...
          </p>
        </div>
      </main>
    );
  }

  // Guest: show form
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Iniciar challenge
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            QA API Challenge — Banking Transactions
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email{' '}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10 p-3 text-xs text-blue-700 dark:text-blue-400">
            Al iniciar aceptás que tu respuesta será evaluada automáticamente.
            Tenés el tiempo que necesitás — el timer es solo referencial.
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Iniciando...' : 'Comenzar challenge →'}
          </button>
        </form>
      </div>
    </main>
  );
}
