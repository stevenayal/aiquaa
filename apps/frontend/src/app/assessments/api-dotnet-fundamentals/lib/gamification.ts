import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'API_DOTNET_FUNDAMENTALS',
  descriptions: {
    completed: 'Completar el assessment API .NET Fundamentals',
    passed: 'Aprobar el assessment API .NET Fundamentals (score >= 70)',
    highScore: 'Score sobresaliente en API .NET Fundamentals (>= 90)',
  },
});

export const API_DOTNET_FUNDAMENTALS_GAMIFICATION_RULES = gamification.rules;

export const buildApiDotnetFundamentalsGamificationEvents =
  gamification.buildEvents;
