import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SEED_VERSION,
  KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SLUG,
  kubernetesOrchestrationFundamentalsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

describe('kubernetes-orchestration-fundamentals definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(
      kubernetesOrchestrationFundamentalsDefinition
    );
  });

  it('define 3 secciones teóricas sobre 100 puntos', () => {
    expect(kubernetesOrchestrationFundamentalsDefinition.sections).toHaveLength(
      3
    );
    expect(kubernetesOrchestrationFundamentalsDefinition.total_score).toBe(100);
    expect(kubernetesOrchestrationFundamentalsDefinition.slug).toBe(
      KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SLUG
    );
  });

  it('la pregunta de pilares de orquestación es multi_select con 3 valores correctos', () => {
    const question =
      kubernetesOrchestrationFundamentalsDefinition.sections[0].questions[1];
    expect(question.question_type).toBe('multi_select');
    expect((question.correct_answer as { values: string[] }).values).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry =
      ASSESSMENT_REGISTRY[KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(
      KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SEED_VERSION
    );
    expect(entry.examType).toBe('kubernetes-orchestration-fundamentals');
  });
});
