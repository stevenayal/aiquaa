import { describe, expect, it } from 'vitest';
import { recalculateLegacyExamPayload } from '../legacy-exam-scoring';
import { loadExamData } from '@/app/labs/git/utils';

describe('legacy exam server-side scoring', () => {
  it('recalculates Git scores from the server question bank instead of trusting client totals', () => {
    const firstQuestion = loadExamData().questions[0];
    const recalculated = recalculateLegacyExamPayload({
      exam_type: 'git',
      exam_mode: 'exam',
      participant_name: 'QA Tester',
      github_profile: 'https://github.com/qa',
      exam_purpose: 'practica',
      score: 999,
      total_questions: 1,
      correct_answers: 999,
      incorrect_answers: 0,
      passed: true,
      percentage: 100,
      time_spent: 60,
      answers: [
        {
          questionId: firstQuestion.id,
          userAnswer: ['__wrong__'],
        },
      ],
    });

    expect(recalculated.score).toBe(0);
    expect(recalculated.correct_answers).toBe(0);
    expect(recalculated.incorrect_answers).toBe(1);
    expect(recalculated.percentage).toBe(0);
    expect(recalculated.passed).toBe(false);
  });
});
