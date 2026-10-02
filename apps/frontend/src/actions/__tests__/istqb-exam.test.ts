import { describe, expect, it } from 'vitest';
import {
  checkAnswerAction,
  getExamConfigAction,
  startExamAction,
  submitExamAction,
} from '../istqb-exam';

describe('istqb-exam actions (#225 - server-side grading)', () => {
  it('getExamConfigAction never exposes questions or answers', async () => {
    const config = await getExamConfigAction('es-model-a');

    expect(config.examInfo.totalQuestions).toBeGreaterThan(0);
    expect(config.availableQuestions).toBeGreaterThan(0);
    expect(config).not.toHaveProperty('questions');
  });

  it('startExamAction strips correctAnswer and explanations from every question', async () => {
    const { questions } = await startExamAction({
      examId: 'es-model-a',
      count: 10,
    });

    expect(questions.length).toBe(10);
    for (const question of questions) {
      expect(question).not.toHaveProperty('correctAnswer');
      expect(question).not.toHaveProperty('explanations');
      expect(typeof question.answerCount).toBe('number');
      expect(question.answerCount).toBeGreaterThan(0);
    }
  });

  it('checkAnswerAction grades a single question without revealing the rest of the bank', async () => {
    const { questions } = await startExamAction({
      examId: 'es-model-a',
      count: 1,
    });
    const question = questions[0];

    const wrongLabel = question.options.find(
      (opt) => opt.label !== question.options[0].label
    );

    const feedback = await checkAnswerAction({
      examId: 'es-model-a',
      questionId: question.id,
      userAnswer: [question.options[0].label],
    });

    expect(feedback).not.toBeNull();
    expect(feedback?.correctAnswer.length).toBe(question.answerCount);
    expect(typeof feedback?.isCorrect).toBe('boolean');
    expect(wrongLabel).toBeDefined();
  });

  it('checkAnswerAction returns null for an unknown question id', async () => {
    const feedback = await checkAnswerAction({
      examId: 'es-model-a',
      questionId: -1,
      userAnswer: ['A'],
    });

    expect(feedback).toBeNull();
  });

  it('submitExamAction grades using only the submitted question ids, matching per-question checks', async () => {
    const { questions } = await startExamAction({
      examId: 'es-model-a',
      count: 3,
    });

    const answers: Record<number, string[]> = {};
    const questionDurations: Record<number, number> = {};
    let expectedCorrect = 0;

    for (const question of questions) {
      const guess = [question.options[0].label];
      answers[question.id] = guess;
      questionDurations[question.id] = 12;

      const feedback = await checkAnswerAction({
        examId: 'es-model-a',
        questionId: question.id,
        userAnswer: guess,
      });
      if (feedback?.isCorrect) expectedCorrect += 1;
    }

    const result = await submitExamAction({
      examId: 'es-model-a',
      participantName: 'QA Tester',
      questionIds: questions.map((q) => q.id),
      answers,
      questionDurations,
      timeSpent: 90,
    });

    expect(result.totalQuestions).toBe(3);
    expect(result.correctAnswers).toBe(expectedCorrect);
    expect(result.answers.every((a) => a.correctAnswer.length > 0)).toBe(true);
  });

  it('submitExamAction ignores question ids that do not belong to the requested bank', async () => {
    const result = await submitExamAction({
      examId: 'es-model-a',
      participantName: 'QA Tester',
      questionIds: [-1, -2],
      answers: {},
      questionDurations: {},
      timeSpent: 10,
    });

    expect(result.totalQuestions).toBe(0);
    expect(result.answers).toEqual([]);
  });
});
