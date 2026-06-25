import type { XpRuleDefinition } from '@/lib/gamification/grant-xp';

export const API_BANKING_PASS_THRESHOLD = 60;
export const API_BANKING_HIGH_SCORE_THRESHOLD = 90;

export type ApiBankingGamificationEventType =
  | 'API_BANKING_COMPLETED'
  | 'API_BANKING_PASSED'
  | 'API_BANKING_HIGH_SCORE';

export interface ApiBankingGamificationEvent {
  eventType: ApiBankingGamificationEventType;
  sourceId: string;
  metadata: Record<string, unknown>;
}

export const API_BANKING_GAMIFICATION_RULES: XpRuleDefinition[] = [
  {
    eventType: 'API_BANKING_COMPLETED',
    xpAmount: 70,
    description: 'Completar el API Testing Challenge practico',
    dailyLimit: 3,
  },
  {
    eventType: 'API_BANKING_PASSED',
    xpAmount: 120,
    description: 'Aprobar el API Testing Challenge practico (score >= 60)',
    dailyLimit: 3,
  },
  {
    eventType: 'API_BANKING_HIGH_SCORE',
    xpAmount: 160,
    description:
      'Score sobresaliente en API Testing Challenge practico (>= 90)',
    dailyLimit: 3,
  },
];

export function buildApiBankingGamificationEvents(input: {
  attemptId: number;
  totalScore: number;
  bugsFound: number;
  bugsTotal: number;
}): ApiBankingGamificationEvent[] {
  const baseMetadata = {
    assessmentSlug: 'api-banking',
    totalScore: input.totalScore,
    bugsFound: input.bugsFound,
    bugsTotal: input.bugsTotal,
  };

  // Prefijo "api-banking" en sourceId: los attempt ids de qac son enteros y sin
  // prefijo podrían colisionar con dedup keys de otros exámenes.
  const events: ApiBankingGamificationEvent[] = [
    {
      eventType: 'API_BANKING_COMPLETED',
      sourceId: `api-banking:${input.attemptId}:completed`,
      metadata: baseMetadata,
    },
  ];

  if (input.totalScore >= API_BANKING_PASS_THRESHOLD) {
    events.push({
      eventType: 'API_BANKING_PASSED',
      sourceId: `api-banking:${input.attemptId}:passed`,
      metadata: baseMetadata,
    });
  }

  if (input.totalScore >= API_BANKING_HIGH_SCORE_THRESHOLD) {
    events.push({
      eventType: 'API_BANKING_HIGH_SCORE',
      sourceId: `api-banking:${input.attemptId}:high-score`,
      metadata: baseMetadata,
    });
  }

  return events;
}
