import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  API_DEVELOPER_FUNDAMENTALS_SEED_VERSION,
  API_DEVELOPER_FUNDAMENTALS_SLUG,
  apiDeveloperFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('api-developer-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(apiDeveloperFundamentalsDefinition);
  });

  it('define 1 sección teórica de 15 preguntas sobre 100 puntos', () => {
    expect(apiDeveloperFundamentalsDefinition.sections).toHaveLength(1);
    expect(
      apiDeveloperFundamentalsDefinition.sections[0].questions
    ).toHaveLength(15);
    expect(apiDeveloperFundamentalsDefinition.total_score).toBe(100);
    expect(apiDeveloperFundamentalsDefinition.slug).toBe(
      API_DEVELOPER_FUNDAMENTALS_SLUG
    );
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[API_DEVELOPER_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(API_DEVELOPER_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('api-developer-fundamentals');
  });
});
