import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AllPairsGeneratedEvent } from '../../labs/events/allpairs-generated.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

const LARGE_RESULT_THRESHOLD = 20;

@EventsHandler(AllPairsGeneratedEvent)
export class AllPairsGeneratedHandler
  implements IEventHandler<AllPairsGeneratedEvent>
{
  private readonly logger = new Logger(AllPairsGeneratedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: AllPairsGeneratedEvent): Promise<void> {
    const { userId, combinationsCount, sessionId } = event;

    try {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.ALLPAIRS_GENERATED,
        source: 'ALLPAIRS_LAB',
        sourceId: sessionId,
        metadata: { combinationsCount },
      });

      if (combinationsCount > LARGE_RESULT_THRESHOLD) {
        await this.gamification.grantXp({
          userId,
          eventType: GamificationEvent.ALLPAIRS_LARGE_RESULT,
          source: 'ALLPAIRS_LAB',
          sourceId: `large:${sessionId}`,
          metadata: { combinationsCount },
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting AllPairs XP for user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
