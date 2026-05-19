import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { ThreadService } from './services/thread.service';
import { PostService } from './services/post.service';
import { ForumMetaService } from './services/forum-meta.service';
import { ThreadRepository } from './repositories/thread.repository';
import { PostRepository } from './repositories/post.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, AppCacheModule, CqrsModule],
  controllers: [ForumController],
  providers: [
    ForumService,
    ThreadService,
    PostService,
    ForumMetaService,
    ThreadRepository,
    PostRepository,
  ],
  exports: [ForumService],
})
export class ForumModule {}
