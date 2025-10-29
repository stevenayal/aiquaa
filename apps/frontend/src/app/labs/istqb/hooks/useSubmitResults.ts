import { useEffect, useState } from 'react';
import type { ExamResult } from '../types';

export function useSubmitResults(result: ExamResult, mode: 'exam' | 'training') {
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const submitResults = async () => {
      setIsSubmitting(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/v1/istqb/submit-exam`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantName: result.participantName,
            participantEmail: undefined,
            startTime: new Date(Date.now() - result.timeSpent * 1000).toISOString(),
            endTime: new Date().toISOString(),
            timeSpent: result.timeSpent,
            score: result.score,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctAnswers,
            incorrectAnswers: result.incorrectAnswers,
            percentage: result.percentage,
            passed: result.passed,
            mode: mode.toUpperCase() as 'EXAM' | 'TRAINING',
            answers: result.answers,
            learningObjectiveAnalysis: result.learningObjectiveAnalysis,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Resultados enviados exitosamente:', data);
          setEmailSent(true);
        } else {
          console.error('Error enviando resultados:', await response.text());
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    submitResults();
  }, [result, mode]);

  return { emailSent, isSubmitting };
}
