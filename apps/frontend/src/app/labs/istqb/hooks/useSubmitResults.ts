import { useEffect, useState } from 'react';
import { saveExamResultAction } from '@/actions/exams';
import type { ExamResult } from '../types';

export function useSubmitResults(
  result: ExamResult,
  mode: 'exam' | 'training',
  processCode?: string
) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const submit = async () => {
      setIsSubmitting(true);
      setSaveError(null);
      try {
        const res = await saveExamResultAction({
          exam_type: 'istqb',
          exam_mode: mode,
          participant_name: result.participantName,
          score: result.score,
          total_questions: result.totalQuestions,
          max_possible_score: result.totalQuestions,
          correct_answers: result.correctAnswers,
          incorrect_answers: result.incorrectAnswers,
          passing_score: 26,
          passed: result.passed,
          percentage: result.percentage,
          time_spent: result.timeSpent,
          answers: result.answers as any,
          learning_objectives: result.learningObjectiveAnalysis as any,
          process_code: processCode?.trim() || undefined,
        });

        if (res.error) {
          console.error('Error guardando resultado ISTQB:', res.error);
          setSaveError(res.error);
        } else {
          setIsSaved(true);
        }
      } catch (err) {
        console.error('Error guardando resultado ISTQB:', err);
        setSaveError(
          err instanceof Error ? err.message : 'No se pudo guardar el resultado'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    submit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isSaved, isSubmitting, saveError };
}
