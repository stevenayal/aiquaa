import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  CICD_FUNDAMENTALS_SEED_VERSION,
  CICD_FUNDAMENTALS_SLUG,
  cicdFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('cicd-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(cicdFundamentalsDefinition);
  });

  it('define 3 secciones teóricas sobre 100 puntos', () => {
    expect(cicdFundamentalsDefinition.sections).toHaveLength(3);
    expect(cicdFundamentalsDefinition.total_score).toBe(100);
    expect(cicdFundamentalsDefinition.slug).toBe(CICD_FUNDAMENTALS_SLUG);
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[CICD_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(CICD_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('cicd-fundamentals');
  });
});
