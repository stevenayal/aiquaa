import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'CICD_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment CI/CD Fundamentals',
    passed: 'Aprobar el assessment CI/CD Fundamentals (score >= 70)',
    highScore: 'Score sobresaliente en CI/CD Fundamentals (>= 90)',
  },
});

export const CICD_FUNDAMENTALS_GAMIFICATION_RULES = gamification.rules;

export const buildCicdFundamentalsGamificationEvents = gamification.buildEvents;
