import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'KUBERNETES_HELM_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment Kubernetes + Helm Fundamentals',
    passed:
      'Aprobar el assessment Kubernetes + Helm Fundamentals (score >= 70)',
    highScore: 'Score sobresaliente en Kubernetes + Helm Fundamentals (>= 90)',
  },
});

export const KUBERNETES_HELM_FUNDAMENTALS_GAMIFICATION_RULES =
  gamification.rules;

export const buildKubernetesHelmFundamentalsGamificationEvents =
  gamification.buildEvents;
