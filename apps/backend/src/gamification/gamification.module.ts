import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { PrismaModule } from '../prisma/prisma.module';
import {
  IstqbExamCompletedHandler,
  AllPairsGeneratedHandler,
  ThreadCreatedHandler,
  PostCreatedHandler,
  IdeaCreatedHandler,
  IdeaVotedHandler,
  CommentAddedHandler,
  PerformanceExamCompletedHandler,
  AssessmentCompletedHandler,
} from './handlers';

const EVENT_HANDLERS = [
  IstqbExamCompletedHandler,
  AllPairsGeneratedHandler,
  ThreadCreatedHandler,
  PostCreatedHandler,
  IdeaCreatedHandler,
  IdeaVotedHandler,
  CommentAddedHandler,
  PerformanceExamCompletedHandler,
  AssessmentCompletedHandler,
];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [GamificationController],
  providers: [GamificationService, ...EVENT_HANDLERS],
  exports: [GamificationService],
})
export class GamificationModule {}
