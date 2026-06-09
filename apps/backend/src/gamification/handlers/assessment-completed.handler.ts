import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AssessmentCompletedEvent } from '../../assessments/events/assessment-completed.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

const PASS_THRESHOLD = 70;

@EventsHandler(AssessmentCompletedEvent)
export class AssessmentCompletedHandler
  implements IEventHandler<AssessmentCompletedEvent>
{
  private readonly logger = new Logger(AssessmentCompletedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: AssessmentCompletedEvent): Promise<void> {
    const { userId, attemptId, passed, totalScore } = event;
    const source = 'API_BANKING_CHALLENGE';
    const sourceIdBase = attemptId.toString();

    try {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.ASSESSMENT_COMPLETED,
        source,
        sourceId: `${GamificationEvent.ASSESSMENT_COMPLETED}:${sourceIdBase}`,
        metadata: { attemptId, totalScore },
      });

      if (passed || totalScore >= PASS_THRESHOLD) {
        await this.gamification.grantXp({
          userId,
          eventType: GamificationEvent.ASSESSMENT_PASSED,
          source,
          sourceId: `${GamificationEvent.ASSESSMENT_PASSED}:${sourceIdBase}`,
          metadata: { attemptId, totalScore },
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting assessment XP for user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
