import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { IdeaVotedEvent } from '../../ideas-board/events/idea-voted.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

@EventsHandler(IdeaVotedEvent)
export class IdeaVotedHandler implements IEventHandler<IdeaVotedEvent> {
  private readonly logger = new Logger(IdeaVotedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: IdeaVotedEvent): Promise<void> {
    const { userId, ideaId } = event;
    try {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.IDEA_VOTED,
        source: 'IDEAS_BOARD',
        sourceId: `${GamificationEvent.IDEA_VOTED}:${userId}:${ideaId}`,
        metadata: { ideaId },
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting XP for idea vote user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
