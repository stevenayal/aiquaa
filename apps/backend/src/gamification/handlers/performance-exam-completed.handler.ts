import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PerformanceExamCompletedEvent } from '../../performance/events/performance-exam-completed.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

@EventsHandler(PerformanceExamCompletedEvent)
export class PerformanceExamCompletedHandler
  implements IEventHandler<PerformanceExamCompletedEvent>
{
  private readonly logger = new Logger(PerformanceExamCompletedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: PerformanceExamCompletedEvent): Promise<void> {
    const { userId, resultId, passed, mode } = event;
    const sourceIdBase = resultId.toString();

    try {
      if (mode !== 'training') {
        await this.gamification.grantXp({
          userId,
          eventType: GamificationEvent.PERFORMANCE_COMPLETED,
          source: 'PERFORMANCE',
          sourceId: `${GamificationEvent.PERFORMANCE_COMPLETED}:${sourceIdBase}`,
          metadata: { resultId, mode },
        });
      }

      if (passed) {
        await this.gamification.grantXp({
          userId,
          eventType: GamificationEvent.PERFORMANCE_PASSED,
          source: 'PERFORMANCE',
          sourceId: `${GamificationEvent.PERFORMANCE_PASSED}:${sourceIdBase}`,
          metadata: { resultId },
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting Performance XP for user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
