import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  API_DOTNET_FUNDAMENTALS_SEED_VERSION,
  API_DOTNET_FUNDAMENTALS_SLUG,
  apiDotnetFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('api-dotnet-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(apiDotnetFundamentalsDefinition);
  });

  it('define 4 secciones teóricas sobre 100 puntos', () => {
    expect(apiDotnetFundamentalsDefinition.sections).toHaveLength(4);
    expect(apiDotnetFundamentalsDefinition.total_score).toBe(100);
    expect(apiDotnetFundamentalsDefinition.slug).toBe(
      API_DOTNET_FUNDAMENTALS_SLUG
    );
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[API_DOTNET_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(API_DOTNET_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('api-dotnet-fundamentals');
  });
});
