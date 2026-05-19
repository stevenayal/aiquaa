import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { IdeaCreatedEvent } from '../../ideas-board/events/idea-created.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

@EventsHandler(IdeaCreatedEvent)
export class IdeaCreatedHandler implements IEventHandler<IdeaCreatedEvent> {
  private readonly logger = new Logger(IdeaCreatedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: IdeaCreatedEvent): Promise<void> {
    const { userId, ideaId } = event;
    try {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.IDEA_CREATED,
        source: 'IDEAS_BOARD',
        sourceId: `${GamificationEvent.IDEA_CREATED}:${ideaId}`,
        metadata: { ideaId },
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting XP for idea creation user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
