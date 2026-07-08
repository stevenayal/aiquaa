import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'API_DEVELOPER_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment API Developer Fundamentals',
    passed: 'Aprobar el assessment API Developer Fundamentals (score >= 70)',
    highScore: 'Score sobresaliente en API Developer Fundamentals (>= 90)',
  },
});

export const API_DEVELOPER_FUNDAMENTALS_GAMIFICATION_RULES = gamification.rules;

export const buildApiDeveloperFundamentalsGamificationEvents =
  gamification.buildEvents;
