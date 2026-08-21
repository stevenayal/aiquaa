import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'KUBERNETES_ORCHESTRATION_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment Kubernetes Orchestration Fundamentals',
    passed:
      'Aprobar el assessment Kubernetes Orchestration Fundamentals (score >= 70)',
    highScore:
      'Score sobresaliente en Kubernetes Orchestration Fundamentals (>= 90)',
  },
});

export const KUBERNETES_ORCHESTRATION_FUNDAMENTALS_GAMIFICATION_RULES =
  gamification.rules;

export const buildKubernetesOrchestrationFundamentalsGamificationEvents =
  gamification.buildEvents;
