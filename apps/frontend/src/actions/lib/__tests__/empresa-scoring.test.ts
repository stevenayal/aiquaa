import { describe, expect, it } from 'vitest';
import {
  scoreEmpresaPregunta,
  scoreEmpresaIntento,
  type EmpresaPregunta,
} from '../empresa-scoring';

function mc(overrides: Partial<EmpresaPregunta> = {}): EmpresaPregunta {
  return {
    id: 'q1',
    question_type: 'multiple_choice',
    correct_answer: { value: 'B' },
    points: 10,
    ...overrides,
  };
}

function tf(overrides: Partial<EmpresaPregunta> = {}): EmpresaPregunta {
  return {
    id: 'q2',
    question_type: 'true_false',
    correct_answer: { value: true },
    points: 5,
    ...overrides,
  };
}

function shortText(overrides: Partial<EmpresaPregunta> = {}): EmpresaPregunta {
  return {
    id: 'q3',
    question_type: 'short_text',
    correct_answer: {},
    expected_keywords: ['regresion', 'smoke test', 'automatizacion'],
    points: 9,
    ...overrides,
  };
}

describe('scoreEmpresaPregunta — multiple_choice', () => {
  it('awards full points on exact match', () => {
    const result = scoreEmpresaPregunta(mc(), { value: 'B' });
    expect(result).toMatchObject({
      score: 10,
      isCorrect: true,
      autoScored: false,
    });
  });

  it('is case/whitespace insensitive', () => {
    const result = scoreEmpresaPregunta(mc(), { value: '  b  ' });
    expect(result.isCorrect).toBe(true);
  });

  it('awards zero on wrong answer', () => {
    const result = scoreEmpresaPregunta(mc(), { value: 'A' });
    expect(result).toMatchObject({ score: 0, isCorrect: false });
  });

  it('awards zero on empty answer', () => {
    const result = scoreEmpresaPregunta(mc(), { value: '' });
    expect(result.isCorrect).toBe(false);
  });
});

describe('scoreEmpresaPregunta — true_false', () => {
  it('awards full points on match', () => {
    const result = scoreEmpresaPregunta(tf(), { value: true });
    expect(result).toMatchObject({
      score: 5,
      isCorrect: true,
      autoScored: false,
    });
  });

  it('awards zero on mismatch', () => {
    const result = scoreEmpresaPregunta(tf(), { value: false });
    expect(result).toMatchObject({ score: 0, isCorrect: false });
  });
});

describe('scoreEmpresaPregunta — short_text', () => {
  it('awards full points when all keywords match, flagged auto_scored', () => {
    const result = scoreEmpresaPregunta(
      shortText(),
      'Hicimos una regresion completa con smoke test antes de la automatizacion'
    );
    expect(result).toMatchObject({
      score: 9,
      isCorrect: true,
      autoScored: true,
    });
  });

  it('awards proportional score on partial keyword match', () => {
    const result = scoreEmpresaPregunta(shortText(), 'Solo hicimos smoke test');
    expect(result.score).toBe(3); // 1/3 keywords * 9 points
    expect(result.autoScored).toBe(true);
  });

  it('is below the 0.6 ratio threshold when isCorrect should be false', () => {
    const result = scoreEmpresaPregunta(shortText(), 'Solo hicimos smoke test');
    expect(result.isCorrect).toBe(false);
  });

  it('awards zero on empty answer', () => {
    const result = scoreEmpresaPregunta(shortText(), '');
    expect(result).toMatchObject({
      score: 0,
      isCorrect: false,
      autoScored: true,
    });
  });

  it('awards zero when no expected_keywords are configured', () => {
    const result = scoreEmpresaPregunta(
      shortText({ expected_keywords: [] }),
      'cualquier respuesta'
    );
    expect(result.score).toBe(0);
  });
});

describe('scoreEmpresaIntento', () => {
  it('aggregates score and maxScore across all question types', () => {
    const preguntas = [mc(), tf(), shortText()];
    const summary = scoreEmpresaIntento(preguntas, {
      q1: { value: 'B' },
      q2: { value: true },
      q3: 'regresion smoke test automatizacion',
    });

    expect(summary.maxScore).toBe(24); // 10 + 5 + 9
    expect(summary.score).toBe(24);
    expect(summary.breakdown).toHaveLength(3);
  });

  it('handles missing answers gracefully', () => {
    const summary = scoreEmpresaIntento([mc()], {});
    expect(summary.score).toBe(0);
    expect(summary.breakdown[0].isCorrect).toBe(false);
  });
});
