import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  GHERKIN_FUNDAMENTALS_SEED_VERSION,
  GHERKIN_FUNDAMENTALS_SLUG,
  gherkinFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('gherkin-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(gherkinFundamentalsDefinition);
  });

  it('define 3 niveles teóricos sobre 100 puntos', () => {
    expect(gherkinFundamentalsDefinition.sections).toHaveLength(3);
    expect(gherkinFundamentalsDefinition.total_score).toBe(100);
    expect(gherkinFundamentalsDefinition.slug).toBe(GHERKIN_FUNDAMENTALS_SLUG);
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[GHERKIN_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(GHERKIN_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('gherkin-fundamentals');
  });
});
