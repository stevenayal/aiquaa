import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdeasBoardController } from './ideas-board.controller';
import { IdeasBoardService } from './ideas-board.service';
import { IdeaService } from './services/idea.service';
import { IdeaVoteService } from './services/idea-vote.service';
import { IdeaRepository } from './repositories/idea.repository';
import { IdeaVoteRepository } from './repositories/idea-vote.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, AppCacheModule, CqrsModule],
  controllers: [IdeasBoardController],
  providers: [
    IdeasBoardService,
    IdeaService,
    IdeaVoteService,
    IdeaRepository,
    IdeaVoteRepository,
  ],
  exports: [IdeasBoardService],
})
export class IdeasBoardModule {}
