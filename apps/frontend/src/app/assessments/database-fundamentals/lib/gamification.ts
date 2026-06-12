import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'DATABASE_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment Database Fundamentals',
    passed: 'Aprobar el assessment Database Fundamentals (score >= 60)',
    highScore: 'Score sobresaliente en Database Fundamentals (>= 90)',
  },
});

export const DATABASE_FUNDAMENTALS_GAMIFICATION_RULES = gamification.rules;

export const buildDatabaseFundamentalsGamificationEvents =
  gamification.buildEvents;
