import { Module } from '@nestjs/common';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, AppCacheModule],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
