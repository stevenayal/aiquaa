import { describe, expect, it } from 'vitest';
import {
  deriveCandidateLevel,
  scoreAssessmentQuestion,
} from '../../_shared/lib/scoring';
import type { AssessmentQuestion, CandidateBand } from '../../_shared/types';

function buildQuestion(
  overrides: Partial<AssessmentQuestion>
): AssessmentQuestion {
  return {
    id: 'q-1',
    section_id: 's-1',
    question_type: 'short_text',
    prompt: 'demo',
    points: 5,
    order_index: 1,
    ...overrides,
  };
}

describe('scoring de escenarios SQL (response_analysis sin request/response)', () => {
  const bugQuestion = buildQuestion({
    question_type: 'response_analysis',
    points: 5,
    metadata: {
      scenario: {
        id: 'db-bug-2',
        title: 'Clientes sin email',
        expectedVerdict: 'bug',
        expectedBugReason:
          'NULL no se compara con igual, hay que usar IS NULL para filtrar',
      },
    },
  });

  it('otorga el puntaje completo con veredicto bug y razón precisa', () => {
    const result = scoreAssessmentQuestion(bugQuestion, {
      verdict: 'bug',
      reason:
        'No se puede comparar NULL con igual, hay que usar IS NULL para filtrar la columna',
    });

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(5);
  });

  it('penaliza levemente el veredicto bug con razón vaga', () => {
    const result = scoreAssessmentQuestion(bugQuestion, {
      verdict: 'bug',
      reason: 'la query está mal',
    });

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(4);
  });

  it('da cero si el veredicto no coincide', () => {
    const result = scoreAssessmentQuestion(bugQuestion, {
      verdict: 'correct',
      reason: '',
    });

    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it('puntúa escenarios correctos solo por el veredicto', () => {
    const correctQuestion = buildQuestion({
      question_type: 'response_analysis',
      points: 5,
      metadata: {
        scenario: {
          id: 'db-bug-1',
          title: 'Pedidos pendientes',
          expectedVerdict: 'correct',
        },
      },
    });

    const result = scoreAssessmentQuestion(correctQuestion, {
      verdict: 'correct',
    });

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(5);
  });
});

describe('scoring de escritura SQL por keywords', () => {
  const sqlQuestion = buildQuestion({
    question_type: 'short_text',
    points: 6,
    expected_keywords: [
      'select',
      'estado',
      'count',
      'from',
      'pedidos',
      'group by',
    ],
  });

  it('da puntaje completo a una query bien formada', () => {
    const result = scoreAssessmentQuestion(sqlQuestion, {
      value: 'SELECT estado, COUNT(*) FROM pedidos GROUP BY estado;',
    });

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(6);
  });

  it('da crédito parcial si faltan cláusulas clave', () => {
    const result = scoreAssessmentQuestion(sqlQuestion, {
      value: 'SELECT estado FROM pedidos;',
    });

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(6);
  });

  it('da cero con respuesta vacía', () => {
    const result = scoreAssessmentQuestion(sqlQuestion, { value: '' });

    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });
});

describe('deriveCandidateLevel con bandas custom', () => {
  const bands: CandidateBand[] = [
    { min: 0, max: 39, label: 'Inicial' },
    { min: 40, max: 59, label: 'Junior en formación' },
    { min: 60, max: 74, label: 'Junior' },
    { min: 75, max: 89, label: 'Junior avanzado / Semi Senior inicial' },
    { min: 90, max: 100, label: 'Semi Senior' },
  ];

  it('usa la banda que matchea el score', () => {
    expect(deriveCandidateLevel(65, bands)).toBe('Junior');
    expect(deriveCandidateLevel(90, bands)).toBe('Semi Senior');
    expect(deriveCandidateLevel(0, bands)).toBe('Inicial');
  });

  it('cae a los thresholds por defecto sin bandas', () => {
    expect(deriveCandidateLevel(65)).toBe('Junior');
    expect(deriveCandidateLevel(95)).toBe('Semi Senior');
    expect(deriveCandidateLevel(30)).toBe('Inicial');
  });
});
