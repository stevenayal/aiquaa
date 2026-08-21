import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'CLASE6_CONFIG_KUBERNETES',
  descriptions: {
    completed: 'Completar el assessment Clase 6 Configuración en Kubernetes',
    passed:
      'Aprobar el assessment Clase 6 Configuración en Kubernetes (score >= 70)',
    highScore:
      'Score sobresaliente en Clase 6 Configuración en Kubernetes (>= 90)',
  },
});

export const CLASE6_CONFIG_KUBERNETES_GAMIFICATION_RULES = gamification.rules;

export const buildClase6ConfigKubernetesGamificationEvents =
  gamification.buildEvents;
