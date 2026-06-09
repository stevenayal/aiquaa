import { describe, expect, it } from 'vitest';
import { apiTestingFundamentalsDefinition } from '../data/assessment-definition';
import {
  buildAssessmentFeedback,
  deriveCandidateLevel,
  scoreAssessmentQuestion,
} from '../lib/scoring';

const section1 = apiTestingFundamentalsDefinition.sections[0];
const section3 = apiTestingFundamentalsDefinition.sections[2];
const section4 = apiTestingFundamentalsDefinition.sections[3];
const section5 = apiTestingFundamentalsDefinition.sections[4];

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
    const question = section4.questions[1];
    const result = scoreAssessmentQuestion(question, {
      verdict: 'bug',
      reason:
        'La API responde 200 pero debería devolver 404 cuando el producto no existe.',
    });
    expect(result.score).toBe(question.points);
    expect(result.isCorrect).toBe(true);
  });

  it('scores test case design heuristically', () => {
    const question = section3.questions[1];
    const result = scoreAssessmentQuestion(question, [
      {
        title: 'Crear producto válido',
        endpoint: '/api/products',
        method: 'POST',
        preconditions: 'Usuario autenticado',
        input: '{"name":"Mouse","price":100,"stock":10,"active":true}',
        steps: 'Enviar request POST con body válido',
        expectedResult: '201 y contrato con id, name, price, stock, active',
        caseType: 'positivo',
        priority: 'Alta',
      },
      {
        title: 'No permitir name vacío',
        endpoint: '/api/products',
        method: 'POST',
        preconditions: 'Usuario autenticado',
        input: '{"name":"","price":100,"stock":10,"active":true}',
        steps: 'Enviar request POST con name vacío',
        expectedResult: '400 porque name es obligatorio',
        caseType: 'negativo',
        priority: 'Alta',
      },
      {
        title: 'No permitir price negativo',
        endpoint: '/api/products',
        method: 'POST',
        preconditions: 'Usuario autenticado',
        input: '{"name":"Mouse","price":-1,"stock":10,"active":true}',
        steps: 'Enviar request POST con price negativo',
        expectedResult: '400 porque price debe ser mayor a 0',
        caseType: 'borde',
        priority: 'Media',
      },
      {
        title: 'No crear duplicado',
        endpoint: '/api/products',
        method: 'POST',
        preconditions: 'Ya existe un producto Mouse',
        input: '{"name":"Mouse","price":100,"stock":10,"active":true}',
        steps: 'Enviar request POST con nombre duplicado',
        expectedResult: '409 o 400 por regla de negocio de duplicado',
        caseType: 'contrato',
        priority: 'Media',
      },
      {
        title: 'Rechazar usuario sin token',
        endpoint: '/api/products',
        method: 'POST',
        preconditions: 'Sin token',
        input: '{"name":"Mouse","price":100,"stock":10,"active":true}',
        steps: 'Enviar request sin Authorization',
        expectedResult: '401 no autenticado',
        caseType: 'seguridad',
        priority: 'Alta',
      },
    ]);
    expect(result.score).toBeGreaterThanOrEqual(4);
    expect(result.isCorrect).toBe(true);
  });

  it('scores bug reports using required fields and status alignment', () => {
    const question = section5.questions[0];
    const result = scoreAssessmentQuestion(question, {
      title: 'GET retorna 200 para producto inexistente',
      endpoint: '/api/products/prod_999',
      method: 'GET',
      description: 'La API informa product not found pero responde status 200.',
      stepsToReproduce:
        '1. Enviar GET /api/products/prod_999 con token válido. 2. Revisar status y body.',
      actualResult: 'La respuesta actual es 200 con message Product not found.',
      expectedResult:
        'La API debería responder 404 para recursos inexistentes.',
      severity: 'Media',
      priority: 'Alta',
      evidence: 'Body {"message":"Product not found"}',
      environment: 'QA',
    });
    expect(result.score).toBe(question.points);
    expect(result.isCorrect).toBe(true);
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
        max_score: 20,
      },
      {
        id: '2',
        assessment_id: 'a',
        slug: 'level-2',
        title: 'Nivel 2',
        description: 'Docs',
        order_index: 2,
        max_score: 20,
      },
    ];
    const scores = [
      {
        id: 's1',
        attempt_id: 'attempt',
        section_id: '1',
        score: 18,
        max_score: 20,
        scoring_mode: 'automatic' as const,
        feedback: '',
      },
      {
        id: 's2',
        attempt_id: 'attempt',
        section_id: '2',
        score: 8,
        max_score: 20,
        scoring_mode: 'automatic' as const,
        feedback: '',
      },
    ];

    const feedback = buildAssessmentFeedback(sections, scores, 'attempt');
    expect(feedback.strengths.length).toBeGreaterThan(0);
    expect(feedback.weaknesses.length).toBeGreaterThan(0);
    expect(feedback.feedbackEntries).toHaveLength(2);
  });
});
