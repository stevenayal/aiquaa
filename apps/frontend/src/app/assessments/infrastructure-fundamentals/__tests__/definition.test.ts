import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION,
  INFRASTRUCTURE_FUNDAMENTALS_SLUG,
  infrastructureFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('infrastructure-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(infrastructureFundamentalsDefinition);
  });

  it('define 3 niveles teóricos sobre 100 puntos', () => {
    expect(infrastructureFundamentalsDefinition.sections).toHaveLength(3);
    expect(infrastructureFundamentalsDefinition.total_score).toBe(100);
    expect(infrastructureFundamentalsDefinition.slug).toBe(
      INFRASTRUCTURE_FUNDAMENTALS_SLUG
    );
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[INFRASTRUCTURE_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('infrastructure-fundamentals');
  });
});
