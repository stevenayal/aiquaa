import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'CLASE5_KUBERNETES',
  descriptions: {
    completed: 'Completar el assessment Clase 5 Kubernetes',
    passed: 'Aprobar el assessment Clase 5 Kubernetes (score >= 70)',
    highScore: 'Score sobresaliente en Clase 5 Kubernetes (>= 90)',
  },
});

export const CLASE5_KUBERNETES_GAMIFICATION_RULES = gamification.rules;

export const buildClase5KubernetesGamificationEvents = gamification.buildEvents;
