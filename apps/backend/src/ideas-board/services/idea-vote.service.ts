import { Injectable, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { CacheService } from '../../cache/cache.service';
import { VoteIdeaDto } from '../dto';
import { IdeaRepository } from '../repositories/idea.repository';
import { IdeaVoteRepository } from '../repositories/idea-vote.repository';
import { IdeaVotedEvent } from '../events/idea-voted.event';

@Injectable()
export class IdeaVoteService {
  constructor(
    private readonly ideas: IdeaRepository,
    private readonly votes: IdeaVoteRepository,
    private readonly cache: CacheService,
    private readonly eventBus: EventBus
  ) {}

  async vote(ideaId: number, userId: number, dto: VoteIdeaDto) {
    const idea = await this.ideas.findById(ideaId);
    if (!idea) throw new NotFoundException('Idea no encontrada');

    const vote = await this.votes.upsert(ideaId, userId, dto.value);
    await this.ideas.updateScore(ideaId);
    await this.cache.invalidate(`ideas:${ideaId}`);
    await this.cache.invalidateByTag('ideas');
    this.eventBus.publish(new IdeaVotedEvent(userId, ideaId, dto.value));
    return vote;
  }

  async removeVote(ideaId: number, userId: number) {
    const idea = await this.ideas.findById(ideaId);
    if (!idea) throw new NotFoundException('Idea no encontrada');

    try {
      await this.votes.delete(ideaId, userId);
      await this.ideas.updateScore(ideaId);
      await this.cache.invalidate(`ideas:${ideaId}`);
      await this.cache.invalidateByTag('ideas');
      return { message: 'Voto removido exitosamente' };
    } catch {
      throw new NotFoundException('No has votado por esta idea');
    }
  }
}
