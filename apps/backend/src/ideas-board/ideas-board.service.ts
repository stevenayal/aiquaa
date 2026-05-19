import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  CreateIdeaDto,
  UpdateIdeaDto,
  VoteIdeaDto,
  CreateCommentDto,
  UpdateStatusDto,
} from './dto';
import { IdeaService } from './services/idea.service';
import { IdeaVoteService } from './services/idea-vote.service';
import { IdeaFilters } from './repositories/idea.repository';

@Injectable()
export class IdeasBoardService {
  constructor(
    private readonly ideaService: IdeaService,
    private readonly voteService: IdeaVoteService
  ) {}

  createIdea(dto: CreateIdeaDto, authorId: number) {
    return this.ideaService.create(dto, authorId);
  }
  getIdeas(filters: IdeaFilters, userId?: number) {
    return this.ideaService.findMany(filters, userId);
  }
  getIdea(id: number, userId?: number) {
    return this.ideaService.findOne(id, userId);
  }
  updateIdea(id: number, dto: UpdateIdeaDto, userId: number, role: Role) {
    return this.ideaService.update(id, dto, userId, role);
  }
  deleteIdea(id: number, userId: number, role: Role) {
    return this.ideaService.remove(id, userId, role);
  }
  addComment(ideaId: number, userId: number, dto: CreateCommentDto) {
    return this.ideaService.addComment(ideaId, userId, dto);
  }
  updateStatus(id: number, dto: UpdateStatusDto, userId: number, role: Role) {
    return this.ideaService.updateStatus(id, dto, userId, role);
  }
  getTopIdeas(limit?: number, userId?: number) {
    return this.ideaService.getTopIdeas(limit, userId);
  }
  getCategories() {
    return this.ideaService.getCategories();
  }
  getUserVotedIdeas(userId: number, page?: number, limit?: number) {
    return this.ideaService.getUserVotedIdeas(userId, page, limit);
  }

  voteIdea(ideaId: number, userId: number, dto: VoteIdeaDto) {
    return this.voteService.vote(ideaId, userId, dto);
  }
  removeVote(ideaId: number, userId: number) {
    return this.voteService.removeVote(ideaId, userId);
  }
}
