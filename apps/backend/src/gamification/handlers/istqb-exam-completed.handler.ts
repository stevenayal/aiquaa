import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { IstqbExamCompletedEvent } from '../../istqb/events/istqb-exam-completed.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

const HIGH_SCORE_THRESHOLD = 90;

@EventsHandler(IstqbExamCompletedEvent)
export class IstqbExamCompletedHandler
  implements IEventHandler<IstqbExamCompletedEvent>
{
  private readonly logger = new Logger(IstqbExamCompletedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: IstqbExamCompletedEvent): Promise<void> {
    const { userId, examId, passed, percentage, mode } = event;
    const source = 'ISTQB_SIMULATOR';
    const sourceIdBase = examId.toString();

    try {
      if (mode !== 'TRAINING') {
        await this.gamification.grantXp({
          userId,
          eventType: GamificationEvent.ISTQB_COMPLETED,
          source,
          sourceId: `${GamificationEvent.ISTQB_COMPLETED}:${sourceIdBase}`,
          metadata: { examId, mode },
        });
      }

      if (passed) {
        await this.gamification.grantXp({
          userId,
          eventType: GamificationEvent.ISTQB_PASSED,
          source,
          sourceId: `${GamificationEvent.ISTQB_PASSED}:${sourceIdBase}`,
          metadata: { examId, percentage },
        });
      }

      if (percentage >= HIGH_SCORE_THRESHOLD) {
        await this.gamification.grantXp({
          userId,
          eventType: GamificationEvent.ISTQB_HIGH_SCORE,
          source,
          sourceId: `${GamificationEvent.ISTQB_HIGH_SCORE}:${sourceIdBase}`,
          metadata: { examId, percentage },
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting ISTQB XP for user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
