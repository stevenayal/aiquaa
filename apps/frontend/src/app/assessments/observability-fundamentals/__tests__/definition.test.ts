import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  OBSERVABILITY_FUNDAMENTALS_SEED_VERSION,
  OBSERVABILITY_FUNDAMENTALS_SLUG,
  observabilityFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('observability-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(observabilityFundamentalsDefinition);
  });

  it('define 4 secciones teóricas sobre 100 puntos', () => {
    expect(observabilityFundamentalsDefinition.sections).toHaveLength(4);
    expect(observabilityFundamentalsDefinition.total_score).toBe(100);
    expect(observabilityFundamentalsDefinition.slug).toBe(
      OBSERVABILITY_FUNDAMENTALS_SLUG
    );
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[OBSERVABILITY_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(OBSERVABILITY_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('observability-fundamentals');
  });
});
