import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'OBSERVABILITY_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment Observability Fundamentals',
    passed: 'Aprobar el assessment Observability Fundamentals (score >= 70)',
    highScore: 'Score sobresaliente en Observability Fundamentals (>= 90)',
  },
});

export const OBSERVABILITY_FUNDAMENTALS_GAMIFICATION_RULES = gamification.rules;

export const buildObservabilityFundamentalsGamificationEvents =
  gamification.buildEvents;
