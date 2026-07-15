import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  PLAYWRIGHT_FUNDAMENTALS_SEED_VERSION,
  PLAYWRIGHT_FUNDAMENTALS_SLUG,
  playwrightFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('playwright-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(playwrightFundamentalsDefinition);
  });

  it('define 4 niveles teóricos sobre 100 puntos', () => {
    expect(playwrightFundamentalsDefinition.sections).toHaveLength(4);
    expect(playwrightFundamentalsDefinition.total_score).toBe(100);
    expect(playwrightFundamentalsDefinition.slug).toBe(
      PLAYWRIGHT_FUNDAMENTALS_SLUG
    );
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[PLAYWRIGHT_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(PLAYWRIGHT_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('playwright-fundamentals');
  });
});
