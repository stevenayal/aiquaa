import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'CLASE9_CICD_GITHUB_ACTIONS',
  descriptions: {
    completed: 'Completar el assessment Clase 9 CI/CD con GitHub Actions',
    passed:
      'Aprobar el assessment Clase 9 CI/CD con GitHub Actions (score >= 70)',
    highScore:
      'Score sobresaliente en Clase 9 CI/CD con GitHub Actions (>= 90)',
  },
});

export const CLASE9_CICD_GITHUB_ACTIONS_GAMIFICATION_RULES = gamification.rules;

export const buildClase9CicdGithubActionsGamificationEvents =
  gamification.buildEvents;
