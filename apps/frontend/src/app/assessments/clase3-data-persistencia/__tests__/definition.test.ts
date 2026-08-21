import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  CLASE3_DATA_PERSISTENCIA_SEED_VERSION,
  CLASE3_DATA_PERSISTENCIA_SLUG,
  clase3DataPersistenciaDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

const questions = clase3DataPersistenciaDefinition.sections.flatMap(
  (section) => section.questions
);

describe('clase3-data-persistencia definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(clase3DataPersistenciaDefinition);
  });

  it('define 3 secciones sobre 100 puntos', () => {
    expect(clase3DataPersistenciaDefinition.sections).toHaveLength(3);
    expect(clase3DataPersistenciaDefinition.total_score).toBe(100);
    expect(clase3DataPersistenciaDefinition.slug).toBe(
      CLASE3_DATA_PERSISTENCIA_SLUG
    );
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
    const entry = ASSESSMENT_REGISTRY[CLASE3_DATA_PERSISTENCIA_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(CLASE3_DATA_PERSISTENCIA_SEED_VERSION);
    expect(entry.examType).toBe(CLASE3_DATA_PERSISTENCIA_SLUG);
  });
});
