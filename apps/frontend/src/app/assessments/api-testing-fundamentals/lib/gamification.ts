import {
  createAssessmentGamification,
  type AssessmentGamificationEvent,
  type AssessmentGamificationRule,
} from '../../_shared/lib/gamification';

export { calculateXpLevel } from '../../_shared/lib/gamification';

export const API_TESTING_HIGH_SCORE_THRESHOLD = 90;

export type ApiTestingGamificationEventType =
  | 'API_TESTING_COMPLETED'
  | 'API_TESTING_PASSED'
  | 'API_TESTING_HIGH_SCORE';

export type ApiTestingGamificationRule = AssessmentGamificationRule;
export type ApiTestingGamificationEvent = AssessmentGamificationEvent;

const gamification = createAssessmentGamification({
  prefix: 'API_TESTING',
  descriptions: {
    completed: 'Complete API Testing Fundamentals challenge in exam mode',
    passed: 'Pass API Testing Fundamentals challenge',
    highScore: 'Reach 90% or more in API Testing Fundamentals challenge',
  },
  highScoreThreshold: API_TESTING_HIGH_SCORE_THRESHOLD,
});

export const API_TESTING_GAMIFICATION_RULES = gamification.rules;

export const buildApiTestingGamificationEvents = gamification.buildEvents;
