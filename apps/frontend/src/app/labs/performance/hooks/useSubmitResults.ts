import { useState } from 'react';
import type { ExamResult } from '../types';

interface SubmitResultsPayload {
  participantName: string;
  githubProfile: string;
  examPurpose: 'capacitacion' | 'postulacion' | 'practica' | 'otro';
  companyName?: string;
  startTime: string;
  endTime: string;
  timeSpent: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  passed: boolean;
  mode: 'exam' | 'training';
  answers: any[];
  learningObjectiveAnalysis: any[];
}

export function useSubmitResults() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitResults = async (
    result: ExamResult,
    mode: 'exam' | 'training',
    startTime: Date,
    endTime: Date
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const payload: SubmitResultsPayload = {
        participantName: result.participantName,
        githubProfile: result.githubProfile,
        examPurpose: result.examPurpose,
        companyName: result.companyName,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timeSpent: result.timeSpent,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        percentage: result.percentage,
        passed: result.passed,
        mode,
        answers: result.answers,
        learningObjectiveAnalysis: result.learningObjectiveAnalysis,
      };

      const response = await fetch(`${apiUrl}/api/v1/performance/submit-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al guardar los resultados');
      }

      const data = await response.json();
      console.log('Resultados guardados exitosamente:', data);

      setIsSubmitted(true);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al guardar resultados';
      setError(errorMessage);
      console.error('Error al enviar resultados:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitResults,
    isSubmitting,
    error,
    isSubmitted,
  };
}
