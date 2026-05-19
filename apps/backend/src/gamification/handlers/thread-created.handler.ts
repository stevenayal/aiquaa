import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ThreadCreatedEvent } from '../../forum/events/thread-created.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

@EventsHandler(ThreadCreatedEvent)
export class ThreadCreatedHandler implements IEventHandler<ThreadCreatedEvent> {
  private readonly logger = new Logger(ThreadCreatedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: ThreadCreatedEvent): Promise<void> {
    const { userId, threadId } = event;
    try {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.THREAD_CREATED,
        source: 'FORUM',
        sourceId: `${GamificationEvent.THREAD_CREATED}:${threadId}`,
        metadata: { threadId },
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting XP for thread creation user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
