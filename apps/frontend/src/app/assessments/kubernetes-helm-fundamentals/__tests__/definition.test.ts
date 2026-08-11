import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  KUBERNETES_HELM_FUNDAMENTALS_SEED_VERSION,
  KUBERNETES_HELM_FUNDAMENTALS_SLUG,
  kubernetesHelmFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('kubernetes-helm-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(kubernetesHelmFundamentalsDefinition);
  });

  it('define 4 secciones teóricas sobre 100 puntos', () => {
    expect(kubernetesHelmFundamentalsDefinition.sections).toHaveLength(4);
    expect(kubernetesHelmFundamentalsDefinition.total_score).toBe(100);
    expect(kubernetesHelmFundamentalsDefinition.slug).toBe(
      KUBERNETES_HELM_FUNDAMENTALS_SLUG
    );
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[KUBERNETES_HELM_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(KUBERNETES_HELM_FUNDAMENTALS_SEED_VERSION);
    expect(entry.examType).toBe('kubernetes-helm-fundamentals');
  });
});
