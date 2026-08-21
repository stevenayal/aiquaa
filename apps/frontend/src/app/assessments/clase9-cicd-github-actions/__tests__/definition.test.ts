import { describe, expect, it } from 'vitest';
import { assertAssessmentDefinitionConsistency } from '../../_shared/testing/assessment-definition-checks';
import {
  CLASE9_CICD_GITHUB_ACTIONS_SEED_VERSION,
  CLASE9_CICD_GITHUB_ACTIONS_SLUG,
  clase9CicdGithubActionsDefinition,
} from '../data/assessment-definition';
import { ASSESSMENT_REGISTRY } from '../../_shared/registry';

const questions = clase9CicdGithubActionsDefinition.sections.flatMap(
  (section) => section.questions
);

describe('clase9-cicd-github-actions definition', () => {
  it('mantiene presupuestos de puntos y answer keys consistentes', () => {
    assertAssessmentDefinitionConsistency(clase9CicdGithubActionsDefinition);
  });

  it('define 3 secciones sobre 100 puntos', () => {
    expect(clase9CicdGithubActionsDefinition.sections).toHaveLength(3);
    expect(clase9CicdGithubActionsDefinition.total_score).toBe(100);
    expect(clase9CicdGithubActionsDefinition.slug).toBe(
      CLASE9_CICD_GITHUB_ACTIONS_SLUG
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
    const entry = ASSESSMENT_REGISTRY[CLASE9_CICD_GITHUB_ACTIONS_SLUG];
    expect(entry).toBeDefined();
    expect(entry.seedVersion).toBe(CLASE9_CICD_GITHUB_ACTIONS_SEED_VERSION);
    expect(entry.examType).toBe(CLASE9_CICD_GITHUB_ACTIONS_SLUG);
  });
});
