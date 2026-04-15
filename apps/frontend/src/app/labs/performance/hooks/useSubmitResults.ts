import { useState } from 'react';
import { saveExamResultAction } from '@/actions/exams';
import type { ExamResult } from '../types';

export function useSubmitResults() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitResults = async (
    result: ExamResult,
    mode: 'exam' | 'training',
    _startTime: Date,
    _endTime: Date,
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await saveExamResultAction({
        exam_type: 'performance',
        exam_mode: mode,
        participant_name: result.participantName,
        github_profile: result.githubProfile,
        exam_purpose: result.examPurpose,
        company_name: result.companyName,
        score: result.score,
        total_questions: result.totalQuestions,
        correct_answers: result.correctAnswers,
        incorrect_answers: result.incorrectAnswers,
        passed: result.passed,
        percentage: result.percentage,
        time_spent: result.timeSpent,
        answers: result.answers as any,
        learning_objectives: result.learningObjectiveAnalysis as any,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      setIsSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al guardar resultados';
      setError(msg);
      console.error('Error al guardar resultado Performance:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitResults, isSubmitting, error, isSubmitted };
}
