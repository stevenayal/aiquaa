import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  DOCKER_FUNDAMENTALS_SEED_VERSION,
  DOCKER_FUNDAMENTALS_SLUG,
  dockerFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('docker-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(dockerFundamentalsDefinition);
  });

  it('define 3 secciones teóricas sobre 100 puntos', () => {
    expect(dockerFundamentalsDefinition.sections).toHaveLength(3);
    expect(dockerFundamentalsDefinition.total_score).toBe(100);
    expect(dockerFundamentalsDefinition.slug).toBe(DOCKER_FUNDAMENTALS_SLUG);
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[DOCKER_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(DOCKER_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('docker-fundamentals');
  });
});
