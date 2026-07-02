import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'INFRASTRUCTURE_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment Infrastructure Fundamentals',
    passed: 'Aprobar el assessment Infrastructure Fundamentals (score >= 70)',
    highScore: 'Score sobresaliente en Infrastructure Fundamentals (>= 90)',
  },
});

export const INFRASTRUCTURE_FUNDAMENTALS_GAMIFICATION_RULES =
  gamification.rules;

export const buildInfrastructureFundamentalsGamificationEvents =
  gamification.buildEvents;
