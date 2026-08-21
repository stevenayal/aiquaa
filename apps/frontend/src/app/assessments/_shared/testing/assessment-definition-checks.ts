import { expect } from 'vitest';
import type { AssessmentSeedDefinition } from '../types';

// Aserciones de consistencia para definiciones de assessments autorales:
// presupuestos de puntos, índices contiguos y answer keys válidas.
export function assertAssessmentDefinitionConsistency(
  definition: AssessmentSeedDefinition
) {
  const sectionsTotal = definition.sections.reduce(
    (sum, section) => sum + section.max_score,
    0
  );
  expect(sectionsTotal).toBe(definition.total_score);

  definition.sections.forEach((section, sectionIndex) => {
    expect(section.order_index).toBe(sectionIndex + 1);

    const questionsTotal = section.questions.reduce(
      (sum, question) => sum + question.points,
      0
    );
    expect(questionsTotal).toBe(section.max_score);

    section.questions.forEach((question, questionIndex) => {
      expect(question.order_index).toBe(questionIndex + 1);
      expect(question.points).toBeGreaterThan(0);

      if (question.question_type === 'multiple_choice') {
        const correctValue = (
          question.correct_answer as { value?: string } | undefined
        )?.value;
        expect(correctValue).toBeTruthy();
        expect(
          question.options?.some((option) => option.value === correctValue)
        ).toBe(true);
      }

      if (question.question_type === 'multiple_select') {
        const correctValues = (
          question.correct_answer as { values?: string[] } | undefined
        )?.values;
        expect(Array.isArray(correctValues)).toBe(true);
        expect(correctValues!.length).toBeGreaterThanOrEqual(2);
        expect(new Set(correctValues).size).toBe(correctValues!.length);
        correctValues!.forEach((value) => {
          expect(
            question.options?.some((option) => option.value === value)
          ).toBe(true);
        });
        // Si todas las opciones fueran correctas la pregunta no discrimina.
        expect(correctValues!.length).toBeLessThan(
          question.options?.length ?? 0
        );
      }

      if (question.question_type === 'true_false') {
        const correctValue = (
          question.correct_answer as { value?: unknown } | undefined
        )?.value;
        expect(typeof correctValue).toBe('boolean');
      }

      if (question.question_type === 'short_text') {
        expect(question.expected_keywords?.length ?? 0).toBeGreaterThan(0);
      }

      if (question.question_type === 'response_analysis') {
        const scenario = question.metadata?.scenario as
          | { expectedVerdict?: string; expectedBugReason?: string }
          | undefined;
        expect(scenario?.expectedVerdict).toMatch(/^(correct|bug)$/);
        if (scenario?.expectedVerdict === 'bug') {
          expect(scenario.expectedBugReason).toBeTruthy();
        }
      }
    });
  });
}
