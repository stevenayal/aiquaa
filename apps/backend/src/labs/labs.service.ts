import { Injectable, Logger } from '@nestjs/common';
import { GamificationService } from '../gamification/gamification.service';
import { GamificationEvent } from '../gamification/constants/xp-events.enum';

const LARGE_RESULT_THRESHOLD = 20;

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);

  constructor(private readonly gamification: GamificationService) {}

  async sendGitExamResult(_examResult: any): Promise<void> {
    this.logger.debug(
      'sendGitExamResult called but email notifications are disabled'
    );
  }

  async sendTechnicalBugReport(_report: any): Promise<void> {
    this.logger.debug(
      'sendTechnicalBugReport called but email notifications are disabled'
    );
  }

  async trackAllPairsGeneration(
    userId: number,
    combinationsCount: number,
    sessionId: string
  ) {
    const results = await Promise.all([
      this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.ALLPAIRS_GENERATED,
        source: 'ALLPAIRS_LAB',
        sourceId: sessionId,
        metadata: { combinationsCount },
      }),
      combinationsCount > LARGE_RESULT_THRESHOLD
        ? this.gamification.grantXp({
            userId,
            eventType: GamificationEvent.ALLPAIRS_LARGE_RESULT,
            source: 'ALLPAIRS_LAB',
            sourceId: `large:${sessionId}`,
            metadata: { combinationsCount },
          })
        : Promise.resolve(null),
    ]);

    const [baseResult, largeResult] = results;
    const totalXpGranted =
      (baseResult.xpGranted ?? 0) + (largeResult?.xpGranted ?? 0);
    const allAchievements = [
      ...(baseResult.newAchievements ?? []),
      ...(largeResult?.newAchievements ?? []),
    ];

    return {
      xpGranted: totalXpGranted,
      newTotal: largeResult?.newTotal ?? baseResult.newTotal,
      newLevel: largeResult?.newLevel ?? baseResult.newLevel,
      newAchievements: allAchievements,
      alreadyProcessed: baseResult.alreadyProcessed,
    };
  }
}
