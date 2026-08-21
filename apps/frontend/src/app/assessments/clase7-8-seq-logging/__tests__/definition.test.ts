import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  CLASE7_8_SEQ_LOGGING_SEED_VERSION,
  CLASE7_8_SEQ_LOGGING_SLUG,
  clase78SeqLoggingDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

const questions = clase78SeqLoggingDefinition.sections.flatMap(
  (section) => section.questions
);

describe('clase7-8-seq-logging definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(clase78SeqLoggingDefinition);
  });

  it('define 3 secciones sobre 100 puntos', () => {
    expect(clase78SeqLoggingDefinition.sections).toHaveLength(3);
    expect(clase78SeqLoggingDefinition.total_score).toBe(100);
    expect(clase78SeqLoggingDefinition.slug).toBe(CLASE7_8_SEQ_LOGGING_SLUG);
  });

  it('reproduce el banco del bootcamp: 10 preguntas, 9 de respuesta única y 1 de varias', () => {
    expect(questions).toHaveLength(10);
    expect(
      questions.filter((q) => q.question_type === 'multiple_choice')
    ).toHaveLength(9);
    expect(
      questions.filter((q) => q.question_type === 'multiple_select')
    ).toHaveLength(1);
    questions.forEach((q) => {
      expect(q.points).toBe(10);
      expect(q.options).toHaveLength(4);
      expect(q.explanation).toBeTruthy();
      expect(q.metadata?.paginasPdf).toBeTruthy();
    });
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[CLASE7_8_SEQ_LOGGING_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(CLASE7_8_SEQ_LOGGING_SEED_VERSION);
    expect(entry.examType).toBe(CLASE7_8_SEQ_LOGGING_SLUG);
  });
});
