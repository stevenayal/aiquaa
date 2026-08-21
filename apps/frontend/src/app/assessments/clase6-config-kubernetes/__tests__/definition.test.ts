import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  CLASE6_CONFIG_KUBERNETES_SEED_VERSION,
  CLASE6_CONFIG_KUBERNETES_SLUG,
  clase6ConfigKubernetesDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

const questions = clase6ConfigKubernetesDefinition.sections.flatMap(
  (section) => section.questions
);

describe('clase6-config-kubernetes definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(clase6ConfigKubernetesDefinition);
  });

  it('define 3 secciones sobre 100 puntos', () => {
    expect(clase6ConfigKubernetesDefinition.sections).toHaveLength(3);
    expect(clase6ConfigKubernetesDefinition.total_score).toBe(100);
    expect(clase6ConfigKubernetesDefinition.slug).toBe(
      CLASE6_CONFIG_KUBERNETES_SLUG
    );
  });

  it('reproduce el banco del bootcamp: 10 preguntas, 9 de respuesta única y 1 de varias', () => {
    expect(questions).toHaveLength(10);
    expect(
      questions.filter((q) => q.question_type === 'multiple_choice')
    ).toHaveLength(9);
    expect(
      questions.filter((q) => q.question_type === 'multiple_select')
    ).toHaveLength(1);
    questions.forEach((q) => {
      expect(q.points).toBe(10);
      expect(q.options).toHaveLength(4);
      expect(q.explanation).toBeTruthy();
      expect(q.metadata?.paginasPdf).toBeTruthy();
    });
  });

  it('está registrado con el seedVersion correcto', () => {
    const entry = ASSESSMENT_REGISTRY[CLASE6_CONFIG_KUBERNETES_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(CLASE6_CONFIG_KUBERNETES_SEED_VERSION);
    expect(entry.examType).toBe(CLASE6_CONFIG_KUBERNETES_SLUG);
  });
});
