import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CommentAddedEvent } from '../../ideas-board/events/comment-added.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

@EventsHandler(CommentAddedEvent)
export class CommentAddedHandler implements IEventHandler<CommentAddedEvent> {
  private readonly logger = new Logger(CommentAddedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: CommentAddedEvent): Promise<void> {
    const { userId, commentId, ideaId } = event;
    try {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.COMMENT_ADDED,
        source: 'IDEAS_BOARD',
        sourceId: `${GamificationEvent.COMMENT_ADDED}:${commentId}`,
        metadata: { commentId, ideaId },
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting XP for comment user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
