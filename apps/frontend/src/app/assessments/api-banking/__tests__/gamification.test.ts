import { describe, expect, it } from 'vitest';
import {
  API_BANKING_GAMIFICATION_RULES,
  API_BANKING_HIGH_SCORE_THRESHOLD,
  API_BANKING_PASS_THRESHOLD,
  buildApiBankingGamificationEvents,
} from '../lib/gamification';

describe('buildApiBankingGamificationEvents', () => {
  it('always grants completion XP', () => {
    const events = buildApiBankingGamificationEvents({
      attemptId: 1,
      totalScore: 40,
      bugsFound: 3,
      bugsTotal: 12,
    });

    expect(events.map((event) => event.eventType)).toEqual([
      'API_BANKING_COMPLETED',
    ]);
  });

  it('adds passed XP at the pass threshold', () => {
    const events = buildApiBankingGamificationEvents({
      attemptId: 2,
      totalScore: API_BANKING_PASS_THRESHOLD,
      bugsFound: 7,
      bugsTotal: 12,
    });

    expect(events.map((event) => event.eventType)).toEqual([
      'API_BANKING_COMPLETED',
      'API_BANKING_PASSED',
    ]);
  });

  it('adds high score XP at the high score threshold', () => {
    const events = buildApiBankingGamificationEvents({
      attemptId: 3,
      totalScore: API_BANKING_HIGH_SCORE_THRESHOLD,
      bugsFound: 11,
      bugsTotal: 12,
    });

    expect(events.map((event) => event.eventType)).toEqual([
      'API_BANKING_COMPLETED',
      'API_BANKING_PASSED',
      'API_BANKING_HIGH_SCORE',
    ]);
  });

  it('prefixes source ids to avoid dedup collisions with other exams', () => {
    const [completed] = buildApiBankingGamificationEvents({
      attemptId: 42,
      totalScore: 10,
      bugsFound: 1,
      bugsTotal: 12,
    });

    expect(completed.sourceId).toBe('api-banking:42:completed');
  });
});

describe('API banking gamification rules', () => {
  it('defines the expected XP catalog', () => {
    expect(API_BANKING_GAMIFICATION_RULES).toHaveLength(3);
    expect(
      API_BANKING_GAMIFICATION_RULES.find(
        (rule) => rule.eventType === 'API_BANKING_COMPLETED'
      )?.xpAmount
    ).toBe(70);
    expect(
      API_BANKING_GAMIFICATION_RULES.find(
        (rule) => rule.eventType === 'API_BANKING_PASSED'
      )?.xpAmount
    ).toBe(120);
    expect(
      API_BANKING_GAMIFICATION_RULES.find(
        (rule) => rule.eventType === 'API_BANKING_HIGH_SCORE'
      )?.xpAmount
    ).toBe(160);
  });
});
