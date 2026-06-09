import { describe, expect, it } from 'vitest';
import {
  API_TESTING_GAMIFICATION_RULES,
  API_TESTING_HIGH_SCORE_THRESHOLD,
  buildApiTestingGamificationEvents,
  calculateXpLevel,
} from '../lib/gamification';

describe('calculateXpLevel', () => {
  it('matches the expected XP progression', () => {
    expect(calculateXpLevel(0)).toBe(1);
    expect(calculateXpLevel(100)).toBe(2);
    expect(calculateXpLevel(300)).toBe(3);
    expect(calculateXpLevel(1000)).toBe(5);
  });
});

describe('buildApiTestingGamificationEvents', () => {
  it('always grants completion XP', () => {
    const events = buildApiTestingGamificationEvents({
      attemptId: 'attempt-1',
      assessmentSlug: 'api-testing-fundamentals',
      passed: false,
      percentage: 55,
      score: 55,
      candidateLevel: 'Junior en formacion',
    });

    expect(events.map((event) => event.eventType)).toEqual([
      'API_TESTING_COMPLETED',
    ]);
  });

  it('adds passed and high score XP when thresholds are met', () => {
    const events = buildApiTestingGamificationEvents({
      attemptId: 'attempt-2',
      assessmentSlug: 'api-testing-fundamentals',
      passed: true,
      percentage: API_TESTING_HIGH_SCORE_THRESHOLD,
      score: 90,
      candidateLevel: 'Semi Senior',
    });

    expect(events.map((event) => event.eventType)).toEqual([
      'API_TESTING_COMPLETED',
      'API_TESTING_PASSED',
      'API_TESTING_HIGH_SCORE',
    ]);
  });
});

describe('API testing gamification rules', () => {
  it('defines the expected XP catalog', () => {
    expect(API_TESTING_GAMIFICATION_RULES).toHaveLength(3);
    expect(
      API_TESTING_GAMIFICATION_RULES.find(
        (rule) => rule.eventType === 'API_TESTING_COMPLETED'
      )?.xpAmount
    ).toBe(70);
  });
});
