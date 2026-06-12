import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  DATABASE_PRACTICE_SEED_VERSION,
  DATABASE_PRACTICE_SLUG,
  databasePracticeDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('database-practice definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(databasePracticeDefinition);
  });

  it('define 3 niveles prácticos sobre 100 puntos', () => {
    expect(databasePracticeDefinition.sections).toHaveLength(3);
    expect(databasePracticeDefinition.total_score).toBe(100);
    expect(databasePracticeDefinition.slug).toBe(DATABASE_PRACTICE_SLUG);
  });

  it('cada sección incluye el esquema SQL para el render', () => {
    for (const section of databasePracticeDefinition.sections) {
      expect(section.metadata?.sqlSchema).toBeDefined();
    }
  });

  it('las preguntas de predicción y detección de bugs traen escenario SQL', () => {
    const [prediction, bugs] = databasePracticeDefinition.sections;

    for (const question of prediction.questions) {
      expect(question.metadata?.sqlScenario).toBeDefined();
    }

    for (const question of bugs.questions) {
      expect(question.question_type).toBe('response_analysis');
      expect(question.metadata?.sqlScenario).toBeDefined();
    }
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[DATABASE_PRACTICE_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(DATABASE_PRACTICE_SEED_VERSION);
    expect(entry.examType).toBe('database-practice');
  });
});
