import { describe, expect, it } from 'vitest';
import { apiTestingFundamentalsDefinition } from '../data/assessment-definition';
import {
  buildAssessmentFeedback,
  deriveCandidateLevel,
  scoreAssessmentQuestion,
} from '../lib/scoring';

const section1 = apiTestingFundamentalsDefinition.sections[0];
const section3 = apiTestingFundamentalsDefinition.sections[2];

describe('deriveCandidateLevel', () => {
  it('maps ranges correctly', () => {
    expect(deriveCandidateLevel(20)).toBe('Inicial');
    expect(deriveCandidateLevel(50)).toBe('Junior en formación');
    expect(deriveCandidateLevel(70)).toBe('Junior');
    expect(deriveCandidateLevel(80)).toBe(
      'Junior avanzado / Semi Senior inicial'
    );
    expect(deriveCandidateLevel(95)).toBe('Semi Senior');
  });
});

describe('scoreAssessmentQuestion', () => {
  it('scores a multiple choice answer exactly', () => {
    const question = section1.questions[0];
    const result = scoreAssessmentQuestion(question, { value: 'a' });
    expect(result.score).toBe(question.points);
    expect(result.isCorrect).toBe(true);
  });

  it('scores short text by keyword coverage', () => {
    const question = section1.questions[1];
    const result = scoreAssessmentQuestion(question, {
      value:
        'La request la envía el cliente al servidor y la response es lo que devuelve el servidor.',
    });
    expect(result.score).toBeGreaterThan(0);
    expect(result.isCorrect).toBe(true);
  });

  it('scores response analysis with correct bug reasoning', () => {
    const question = section3.questions[1];
    const result = scoreAssessmentQuestion(question, {
      verdict: 'bug',
      reason:
        'La API responde 200 pero debería devolver 404 cuando el producto no existe.',
    });
    expect(result.score).toBe(question.points);
    expect(result.isCorrect).toBe(true);
  });

  it('scores response analysis with correct verdict', () => {
    const question = section3.questions[0];
    const result = scoreAssessmentQuestion(question, {
      verdict: 'correct',
      reason: 'Respuesta válida con status 200 y body completo.',
    });
    expect(result.score).toBe(question.points);
    expect(result.isCorrect).toBe(true);
  });

  it('gives zero for wrong verdict', () => {
    const question = section3.questions[1];
    const result = scoreAssessmentQuestion(question, {
      verdict: 'correct',
      reason: 'Looks fine to me.',
    });
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });
});

describe('buildAssessmentFeedback', () => {
  it('builds strengths, weaknesses and entries', () => {
    const sections = [
      {
        id: '1',
        assessment_id: 'a',
        slug: 'level-1',
        title: 'Nivel 1',
        description: 'Conceptos',
        order_index: 1,
        max_score: 35,
      },
      {
        id: '2',
        assessment_id: 'a',
        slug: 'level-2',
        title: 'Nivel 2',
        description: 'Docs',
        order_index: 2,
        max_score: 30,
      },
      {
        id: '3',
        assessment_id: 'a',
        slug: 'level-3',
        title: 'Nivel 3',
        description: 'Análisis',
        order_index: 3,
        max_score: 35,
      },
    ];
    const scores = [
      {
        id: 's1',
        attempt_id: 'attempt',
        section_id: '1',
        score: 30,
        max_score: 35,
        scoring_mode: 'automatic' as const,
        feedback: '',
      },
      {
        id: 's2',
        attempt_id: 'attempt',
        section_id: '2',
        score: 12,
        max_score: 30,
        scoring_mode: 'automatic' as const,
        feedback: '',
      },
      {
        id: 's3',
        attempt_id: 'attempt',
        section_id: '3',
        score: 28,
        max_score: 35,
        scoring_mode: 'automatic' as const,
        feedback: '',
      },
    ];

    const feedback = buildAssessmentFeedback(sections, scores, 'attempt');
    expect(feedback.strengths.length).toBeGreaterThan(0);
    expect(feedback.weaknesses.length).toBeGreaterThan(0);
    expect(feedback.feedbackEntries).toHaveLength(3);
  });
});
