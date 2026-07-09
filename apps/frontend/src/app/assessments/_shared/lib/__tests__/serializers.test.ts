import { describe, expect, it } from 'vitest';
import { mapQuestion, stripAnswerKey } from '../serializers';

describe('mapQuestion', () => {
  it('includes the answer-key fields (needed by server-only scoring paths)', () => {
    const question = mapQuestion({
      id: 'q1',
      section_id: 's1',
      question_type: 'multiple_choice',
      prompt: '¿Qué es QA?',
      correct_answer: { value: 'b' },
      expected_keywords: ['regresion'],
      scoring_rules: { strict: true },
      rubric: { criteria: ['x'] },
      points: 10,
      order_index: 0,
    });

    expect(question.correct_answer).toEqual({ value: 'b' });
    expect(question.expected_keywords).toEqual(['regresion']);
    expect(question.scoring_rules).toEqual({ strict: true });
    expect(question.rubric).toEqual({ criteria: ['x'] });
  });
});

describe('stripAnswerKey', () => {
  it('nulls/empties every answer-key field regardless of input', () => {
    const question = mapQuestion({
      id: 'q1',
      section_id: 's1',
      question_type: 'multiple_choice',
      prompt: '¿Qué es QA?',
      correct_answer: { value: 'b' },
      expected_keywords: ['regresion', 'smoke'],
      scoring_rules: { strict: true },
      rubric: { criteria: ['x'] },
      points: 10,
      order_index: 0,
    });

    const sanitized = stripAnswerKey(question);

    expect(sanitized.correct_answer).toBeNull();
    expect(sanitized.expected_keywords).toEqual([]);
    expect(sanitized.scoring_rules).toEqual({});
    expect(sanitized.rubric).toEqual({});
  });

  it('preserves every non-answer-key field untouched', () => {
    const question = mapQuestion({
      id: 'q1',
      section_id: 's1',
      question_type: 'short_text',
      prompt: 'Explicá regresión',
      description: 'desc',
      options: [{ label: 'A', value: 'a' }],
      explanation: 'explicacion',
      points: 5,
      order_index: 2,
    });

    const sanitized = stripAnswerKey(question);

    expect(sanitized).toMatchObject({
      id: 'q1',
      section_id: 's1',
      question_type: 'short_text',
      prompt: 'Explicá regresión',
      description: 'desc',
      options: [{ label: 'A', value: 'a' }],
      explanation: 'explicacion',
      points: 5,
      order_index: 2,
    });
  });

  it('handles a question with no answer-key data set (still returns safe empties)', () => {
    const question = mapQuestion({
      id: 'q2',
      section_id: 's1',
      question_type: 'true_false',
      prompt: 'Verdadero o falso',
      points: 3,
      order_index: 1,
    });

    const sanitized = stripAnswerKey(question);

    expect(sanitized.correct_answer).toBeNull();
    expect(sanitized.expected_keywords).toEqual([]);
    expect(sanitized.scoring_rules).toEqual({});
    expect(sanitized.rubric).toEqual({});
  });
});
