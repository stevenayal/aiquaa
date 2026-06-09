export const API_TESTING_HIGH_SCORE_THRESHOLD = 90;

export type ApiTestingGamificationEventType =
  | 'API_TESTING_COMPLETED'
  | 'API_TESTING_PASSED'
  | 'API_TESTING_HIGH_SCORE';

export interface ApiTestingGamificationRule {
  eventType: ApiTestingGamificationEventType;
  xpAmount: number;
  description: string;
  dailyLimit: number | null;
}

export interface ApiTestingGamificationEvent {
  eventType: ApiTestingGamificationEventType;
  sourceId: string;
  metadata: Record<string, unknown>;
}

export const API_TESTING_GAMIFICATION_RULES: ApiTestingGamificationRule[] = [
  {
    eventType: 'API_TESTING_COMPLETED',
    xpAmount: 70,
    description: 'Complete API Testing Fundamentals challenge in exam mode',
    dailyLimit: 3,
  },
  {
    eventType: 'API_TESTING_PASSED',
    xpAmount: 120,
    description: 'Pass API Testing Fundamentals challenge',
    dailyLimit: 3,
  },
  {
    eventType: 'API_TESTING_HIGH_SCORE',
    xpAmount: 160,
    description: 'Reach 90% or more in API Testing Fundamentals challenge',
    dailyLimit: 3,
  },
];

export function calculateXpLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  const level = Math.floor((1 + Math.sqrt(1 + (4 * totalXp) / 50)) / 2);
  return Math.max(1, level);
}

export function buildApiTestingGamificationEvents(input: {
  attemptId: string;
  assessmentSlug: string;
  passed: boolean;
  percentage: number;
  score: number;
  candidateLevel: string;
}): ApiTestingGamificationEvent[] {
  const baseMetadata = {
    assessmentSlug: input.assessmentSlug,
    percentage: input.percentage,
    score: input.score,
    candidateLevel: input.candidateLevel,
  };

  const events: ApiTestingGamificationEvent[] = [
    {
      eventType: 'API_TESTING_COMPLETED',
      sourceId: `${input.attemptId}:completed`,
      metadata: baseMetadata,
    },
  ];

  if (input.passed) {
    events.push({
      eventType: 'API_TESTING_PASSED',
      sourceId: `${input.attemptId}:passed`,
      metadata: baseMetadata,
    });
  }

  if (input.percentage >= API_TESTING_HIGH_SCORE_THRESHOLD) {
    events.push({
      eventType: 'API_TESTING_HIGH_SCORE',
      sourceId: `${input.attemptId}:high-score`,
      metadata: baseMetadata,
    });
  }

  return events;
}
