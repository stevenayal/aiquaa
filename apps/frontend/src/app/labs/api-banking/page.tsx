'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import ExamAuthGate from '@/components/labs/ExamAuthGate';
import { assessmentsService } from '@/services/assessmentsService';
import { SuruFloating } from '@/components/Suru';
import Workspace from './components/Workspace';
import ResultView from './components/ResultView';

type Phase = 'landing' | 'workspace' | 'result';

export interface ChallengeSession {
  attemptId: number;
  candidateName: string;
  challengeToken: string | null;
  startedAt: Date;
}

export default function ApiBankingPage() {
  const { isDarkMode } = useTheme();
  const { user } = useSupabaseAuth();
  const [phase, setPhase] = useState<Phase>('landing');
  const [session, setSession] = useState<ChallengeSession | null>(null);
  const [finalScore, setFinalScore] = useState<any>(null);
  const [candidateName, setCandidateName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.user_metadata?.full_name && !candidateName) {
      setCandidateName(user.user_metadata.full_name as string);
    } else if (user?.email && !candidateName) {
      setCandidateName(user.email);
    }
  }, [user, candidateName]);

  const handleStart = async () => {
    if (!candidateName.trim()) {
      setError('Ingresa tu nombre para comenzar');
      return;
    }
    setError('');
    setIsStarting(true);

    try {
      const result = await assessmentsService.startAttempt({
        candidateName: candidateName.trim(),
        assessmentSlug: 'api-banking',
      });

      // Login to banking API as user A
      const loginRes = await fetch('/api/challenge/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user.a@aiquaa.test',
          password: 'Test1234!',
        }),
      });

      let challengeToken: string | null = null;
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        challengeToken = loginData.accessToken ?? null;
      }

      const sess: ChallengeSession = {
        attemptId: result.attemptId,
        candidateName: candidateName.trim(),
        challengeToken,
        startedAt: new Date(),
      };

      sessionStorage.setItem(
        'challenge_session',
        JSON.stringify({
          ...sess,
          startedAt: sess.startedAt.toISOString(),
        })
      );

      setSession(sess);
      setPhase('workspace');
    } catch (err: unknown) {
      setError('Error al iniciar el challenge. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitComplete = (score: any) => {
    setFinalScore(score);
    setPhase('result');
  };

  const handleRestart = () => {
    sessionStorage.removeItem('challenge_session');
    setSession(null);
    setFinalScore(null);
    setCandidateName((user?.user_metadata?.full_name as string) ?? '');
    setPhase('landing');
  };

  if (phase === 'workspace' && session) {
    return (
      <Workspace session={session} onSubmitComplete={handleSubmitComplete} />
    );
  }

  if (phase === 'result' && finalScore) {
    return (
      <ResultView
        score={finalScore}
        candidateName={session?.candidateName ?? ''}
        onRestart={handleRestart}
      />
    );
  }

  // Landing
  return (
    <ExamAuthGate examName="API Banking Challenge" examEmoji="🏦">
      <div
        className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
      >
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero */}
          <div
            className={`rounded-2xl p-8 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-start gap-4 mb-6">
              <span className="text-5xl">🏦</span>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">
                    API Testing Challenge — Banca Digital
                  </h1>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    Semi-Senior
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                    105 min
                  </span>
                </div>
                <p
                  className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Evaluación práctica de API Testing con una API bancaria real
                  simulada. Detecta vulnerabilidades, escribe casos de prueba y
                  documenta bugs.
                </p>
              </div>
            </div>

            {/* What you'll practice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold mb-3 text-blue-500">
                  🎯 Qué vas a practicar
                </h3>
                <ul
                  className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  <li>✓ Exploración y análisis de una API REST</li>
                  <li>
                    ✓ Diseño de casos de prueba (positivos, negativos, borde,
                    seguridad, contrato)
                  </li>
                  <li>✓ Detección de bugs intencionales en la API</li>
                  <li>✓ Redacción profesional de reportes de bugs</li>
                  <li>✓ Validación contra especificación OpenAPI</li>
                  <li>
                    ✓ Identificación de vulnerabilidades IDOR y datos sensibles
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-green-500">
                  📊 Cómo se evalúa
                </h3>
                <ul
                  className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  <li>
                    🧪 Diseño de pruebas: <strong>25 pts</strong>
                  </li>
                  <li>
                    🔍 Validación de API: <strong>25 pts</strong>
                  </li>
                  <li>
                    🔒 Seguridad: <strong>20 pts</strong>
                  </li>
                  <li>
                    📝 Calidad de reportes: <strong>20 pts</strong>
                  </li>
                  <li>
                    📋 Resumen ejecutivo: <strong>10 pts</strong>
                  </li>
                  <li className="font-semibold text-green-600">
                    Mínimo para aprobar: <strong>70 pts</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Start form */}
            <div
              className={`border-t pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h3 className="font-semibold mb-4">Comenzar evaluación</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
                <button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                >
                  {isStarting ? 'Iniciando...' : 'Iniciar Challenge →'}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
          </div>

          {/* Context */}
          <div
            className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
          >
            <h3 className="font-semibold mb-3">📖 Contexto del challenge</h3>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Eres un QA Engineer contratado para auditar la API de{' '}
              <strong>Banca Digital AIQUAA</strong>, una fintech paraguaya que
              está por lanzar su plataforma de transferencias. La API ya está en
              staging y el equipo sospecha que puede haber bugs de seguridad y
              validación. Tu misión: encontrar los problemas antes del
              lanzamiento.
            </p>
          </div>
        </div>

        <SuruFloating />
      </div>
    </ExamAuthGate>
  );
}
