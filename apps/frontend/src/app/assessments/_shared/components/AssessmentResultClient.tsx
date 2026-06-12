'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { getAssessmentResultAction } from '@/actions/assessments';
import AssessmentResultScreen from './AssessmentResultScreen';
import type { AssessmentResultSummary } from '../types';

export default function AssessmentResultClient({
  startHref,
  fallbackRecommendation,
}: {
  startHref: string;
  fallbackRecommendation?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useTheme();
  const attemptId = searchParams.get('attempt');
  const [result, setResult] = useState<AssessmentResultSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) {
      router.push(startHref);
      return;
    }

    let cancelled = false;

    async function loadResult() {
      if (!attemptId) return;
      try {
        const data = await getAssessmentResultAction(attemptId);
        if (!cancelled) setResult(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudo cargar el resultado.'
          );
        }
      }
    }

    void loadResult();

    return () => {
      cancelled = true;
    };
  }, [attemptId, router, startHref]);

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <AssessmentResultScreen
      result={result}
      startHref={startHref}
      fallbackRecommendation={fallbackRecommendation}
    />
  );
}
