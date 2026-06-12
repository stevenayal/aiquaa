import { describe, expect, it } from 'vitest';
import type { ExamQuestion } from '../types';
import { exportToCSV, generateExamResult } from '../utils';

const questions: ExamQuestion[] = [
  {
    id: 1,
    questionText: 'What is testing?',
    options: [
      { label: 'A', text: 'Finding all bugs' },
      { label: 'B', text: 'Evaluating work products' },
    ],
    correctAnswer: ['B'],
    learningObjective: 'LO1.1',
    kLevel: 'K1',
    points: 1,
    type: 'single',
    explanations: {
      A: { correct: false, explanation: 'Testing cannot find every bug.' },
      B: { correct: true, explanation: 'Testing evaluates quality.' },
    },
  },
  {
    id: 2,
    questionText: 'Which technique is black-box?',
    options: [
      { label: 'A', text: 'Equivalence partitioning' },
      { label: 'B', text: 'Statement coverage' },
    ],
    correctAnswer: ['A'],
    learningObjective: 'LO4.2',
    kLevel: 'K2',
    points: 1,
    type: 'single',
    explanations: {
      A: { correct: true, explanation: 'It is a black-box technique.' },
      B: { correct: false, explanation: 'It is a white-box technique.' },
    },
  },
];

describe('ISTQB result utilities', () => {
  it('includes per-question time in generated results', () => {
    const result = generateExamResult(
      'QA Tester',
      questions,
      new Map([
        [1, ['B']],
        [2, ['B']],
      ]),
      90,
      2,
      new Map([
        [1, 35],
        [2, 55],
      ])
    );

    expect(result.answers.map((answer) => answer.timeSpent)).toEqual([35, 55]);
    expect(result.learningObjectiveAnalysis).toEqual([
      {
        learningObjective: 'LO1.1',
        totalQuestions: 1,
        correctAnswers: 1,
        percentage: 100,
      },
      {
        learningObjective: 'LO4.2',
        totalQuestions: 1,
        correctAnswers: 0,
        percentage: 0,
      },
    ]);
  });

  it('exports per-question time to CSV', () => {
    const result = generateExamResult(
      'QA Tester',
      questions,
      new Map([[1, ['B']]]),
      35,
      1,
      new Map([[1, 35]])
    );

    const csv = exportToCSV(result);

    expect(csv).toContain('Tiempo por Pregunta (s)');
    expect(csv).toContain(',35');
  });
});
