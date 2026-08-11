import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'DOCKER_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment Docker Fundamentals',
    passed: 'Aprobar el assessment Docker Fundamentals (score >= 70)',
    highScore: 'Score sobresaliente en Docker Fundamentals (>= 90)',
  },
});

export const DOCKER_FUNDAMENTALS_GAMIFICATION_RULES = gamification.rules;

export const buildDockerFundamentalsGamificationEvents =
  gamification.buildEvents;
