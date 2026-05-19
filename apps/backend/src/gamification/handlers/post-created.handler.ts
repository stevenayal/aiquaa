import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PostCreatedEvent } from '../../forum/events/post-created.event';
import { GamificationService } from '../gamification.service';
import { GamificationEvent } from '../constants/xp-events.enum';

@EventsHandler(PostCreatedEvent)
export class PostCreatedHandler implements IEventHandler<PostCreatedEvent> {
  private readonly logger = new Logger(PostCreatedHandler.name);

  constructor(private readonly gamification: GamificationService) {}

  async handle(event: PostCreatedEvent): Promise<void> {
    const { userId, postId, threadId } = event;
    try {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.POST_CREATED,
        source: 'FORUM',
        sourceId: `${GamificationEvent.POST_CREATED}:${postId}`,
        metadata: { postId, threadId },
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error granting XP for post creation user=${userId}: ${error.message}`,
        error.stack
      );
    }
  }
}
