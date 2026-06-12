import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  DATABASE_FUNDAMENTALS_SEED_VERSION,
  DATABASE_FUNDAMENTALS_SLUG,
  databaseFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('database-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(databaseFundamentalsDefinition);
  });

  it('define 3 niveles teóricos sobre 100 puntos', () => {
    expect(databaseFundamentalsDefinition.sections).toHaveLength(3);
    expect(databaseFundamentalsDefinition.total_score).toBe(100);
    expect(databaseFundamentalsDefinition.slug).toBe(
      DATABASE_FUNDAMENTALS_SLUG
    );
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[DATABASE_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(DATABASE_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('database-fundamentals');
  });
});
