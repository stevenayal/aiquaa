import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'GHERKIN_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment Gherkin Fundamentals',
    passed: 'Aprobar el assessment Gherkin Fundamentals (score >= 70)',
    highScore: 'Score sobresaliente en Gherkin Fundamentals (>= 90)',
  },
});

export const GHERKIN_FUNDAMENTALS_GAMIFICATION_RULES = gamification.rules;

export const buildGherkinFundamentalsGamificationEvents =
  gamification.buildEvents;
