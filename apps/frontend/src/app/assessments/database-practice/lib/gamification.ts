import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'DATABASE_PRACTICE',
  descriptions: {
    completed: 'Completar el assessment Database Practice',
    passed: 'Aprobar el assessment Database Practice (score >= 60)',
    highScore: 'Score sobresaliente en Database Practice (>= 90)',
  },
});

export const DATABASE_PRACTICE_GAMIFICATION_RULES = gamification.rules;

export const buildDatabasePracticeGamificationEvents = gamification.buildEvents;
