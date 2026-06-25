import { describe, expect, it } from 'vitest';
import {
  API_CHALLENGE_TARGETS,
  DEFAULT_API_TARGET_ID,
  getApiChallengeTarget,
  isApiChallengeTargetId,
} from '../data/apiChallengeTargets';
import {
  API_CHALLENGE_EVALUATION_CRITERIA,
  API_CHALLENGE_TOTAL_SCORE,
} from '../data/evaluationCriteria';

describe('API challenge targets', () => {
  it('defines the three public API options', () => {
    expect(API_CHALLENGE_TARGETS.map((target) => target.id).sort()).toEqual([
      'chuck-norris',
      'nasa',
      'rick-and-morty',
    ]);
  });

  it('keeps each target usable for the workspace', () => {
    for (const target of API_CHALLENGE_TARGETS) {
      expect(target.name).toBeTruthy();
      expect(target.baseUrl).toMatch(/^https:\/\//);
      expect(target.docsUrl).toMatch(/^https:\/\//);
      expect(target.endpoints.length).toBeGreaterThan(0);
      expect(target.tasks.length).toBeGreaterThan(0);
      expect(target.sampleRequests.length).toBeGreaterThan(0);
    }
  });

  it('uses Rick and Morty as the default fallback', () => {
    expect(DEFAULT_API_TARGET_ID).toBe('rick-and-morty');
    expect(getApiChallengeTarget('unknown').id).toBe('rick-and-morty');
  });

  it('configures NASA APOD with DEMO_KEY examples', () => {
    const nasa = getApiChallengeTarget('nasa');

    expect(nasa.apiKeyNote).toContain('DEMO_KEY');
    expect(nasa.sampleRequests.join(' ')).toContain('api_key=DEMO_KEY');
    expect(nasa.endpoints[0].path).toContain('api_key=DEMO_KEY');
  });

  it('validates target ids', () => {
    expect(isApiChallengeTargetId('chuck-norris')).toBe(true);
    expect(isApiChallengeTargetId('nasa')).toBe(true);
    expect(isApiChallengeTargetId('rick-and-morty')).toBe(true);
    expect(isApiChallengeTargetId('banking')).toBe(false);
  });

  it('documents clear evaluation criteria for candidates', () => {
    expect(API_CHALLENGE_TOTAL_SCORE).toBe(100);
    expect(API_CHALLENGE_EVALUATION_CRITERIA).toHaveLength(5);

    for (const criterion of API_CHALLENGE_EVALUATION_CRITERIA) {
      expect(criterion.label).toBeTruthy();
      expect(criterion.summary.length).toBeGreaterThan(40);
      expect(criterion.fullCredit.length).toBeGreaterThan(80);
      expect(criterion.checks.length).toBeGreaterThanOrEqual(3);
      expect(criterion.maxScore).toBeGreaterThan(0);
    }
  });
});
