import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'PLAYWRIGHT_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment Playwright Fundamentals',
    passed: 'Aprobar el assessment Playwright Fundamentals (score >= 60)',
    highScore: 'Score sobresaliente en Playwright Fundamentals (>= 90)',
  },
});

export const PLAYWRIGHT_FUNDAMENTALS_GAMIFICATION_RULES = gamification.rules;

export const buildPlaywrightFundamentalsGamificationEvents =
  gamification.buildEvents;
