export interface AssessmentGamificationRule {
  eventType: string;
  xpAmount: number;
  description: string;
  dailyLimit: number | null;
}

export interface AssessmentGamificationEvent {
  eventType: string;
  sourceId: string;
  metadata: Record<string, unknown>;
}

export interface AssessmentGamificationConfig {
  prefix: string;
  descriptions: {
    completed: string;
    passed: string;
    highScore: string;
  };
  highScoreThreshold?: number;
}

export function calculateXpLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  const level = Math.floor((1 + Math.sqrt(1 + (4 * totalXp) / 50)) / 2);
  return Math.max(1, level);
}

// Factory de reglas + eventos XP para assessments (COMPLETED 70 / PASSED 120 /
// HIGH_SCORE 160, límite diario 3 — espejo de api-testing-fundamentals).
export function createAssessmentGamification(
  config: AssessmentGamificationConfig
) {
  const highScoreThreshold = config.highScoreThreshold ?? 90;

  const rules: AssessmentGamificationRule[] = [
    {
      eventType: `${config.prefix}_COMPLETED`,
      xpAmount: 70,
      description: config.descriptions.completed,
      dailyLimit: 3,
    },
    {
      eventType: `${config.prefix}_PASSED`,
      xpAmount: 120,
      description: config.descriptions.passed,
      dailyLimit: 3,
    },
    {
      eventType: `${config.prefix}_HIGH_SCORE`,
      xpAmount: 160,
      description: config.descriptions.highScore,
      dailyLimit: 3,
    },
  ];

  function buildEvents(input: {
    attemptId: string;
    assessmentSlug: string;
    passed: boolean;
    percentage: number;
    score: number;
    candidateLevel: string;
  }): AssessmentGamificationEvent[] {
    const baseMetadata = {
      assessmentSlug: input.assessmentSlug,
      percentage: input.percentage,
      score: input.score,
      candidateLevel: input.candidateLevel,
    };

    const events: AssessmentGamificationEvent[] = [
      {
        eventType: `${config.prefix}_COMPLETED`,
        sourceId: `${input.attemptId}:completed`,
        metadata: baseMetadata,
      },
    ];

    if (input.passed) {
      events.push({
        eventType: `${config.prefix}_PASSED`,
        sourceId: `${input.attemptId}:passed`,
        metadata: baseMetadata,
      });
    }

    if (input.percentage >= highScoreThreshold) {
      events.push({
        eventType: `${config.prefix}_HIGH_SCORE`,
        sourceId: `${input.attemptId}:high-score`,
        metadata: baseMetadata,
      });
    }

    return events;
  }

  return { rules, buildEvents, highScoreThreshold };
}
